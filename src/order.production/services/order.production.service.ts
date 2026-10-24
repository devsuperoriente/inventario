import { BadRequestException, ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderProductionDto } from '../dto/create-order.production.dto.js';
import { UpdateOrderProductionDto } from '../dto/update-order.production.dto.js';
import { OrderProduction } from '../entities/order.production.entity.js';
import { Recipe } from '../../recipe/entities/recipe.entity.js';
import { parsePositiveModelDecimal, multiplyAndDivideDecimals, addDecimalStrings, decimalToScaledInteger, roundDecimalToScale, scaledIntegerToDecimal } from '../utils/decimal-quantity.js';
import { Batch } from '../../batchs/entities/batch.entity.js';
import { RawMaterialConsumption } from '../../raw.material.consumption/entities/raw.material.consumption.entity.js';
import { InventoryMovement } from '../../inventory.movement/entities/inventory.movement.entity.js';
import { TypeMovement } from '../../inventory.movement/entities/type.movement.entity.js';
import { State } from '../entities/state.entity.js';

export interface RequiredMaterial {
  id: number;
  nombre: string;
  unidadMedida: {
    id: number;
    nombre: string;
    abreviatura: string;
  };
  cantidadRequerida: string;
}

@Injectable()
export class OrderProductionService {
  constructor(
    @InjectRepository(OrderProduction)
    private readonly orderProductionsRepository: Repository<OrderProduction>,
    @InjectRepository(Recipe)
    private readonly recipesRepository: Repository<Recipe>,
  ) {}

  findAll() {
    return this.orderProductionsRepository.find({
      relations: {
        state: true,
        product: true,
        user: true,
      },
    });
  }

  async findOne(id: number) {
    const orderProduction = await this.orderProductionsRepository.findOne({
      where: { id },
      relations: { state: true, product: { category: true } },
    });
    if (!orderProduction) {
      throw new NotFoundException(`Production order with ID ${id} not found`);
    }
    return orderProduction;
  }

  async findRequiredMaterials(id: number) {
    const orderProduction = await this.findOne(id);
    const { recipe, materials } = await this.calculateRequiredMaterials(orderProduction, this.recipesRepository);

    return {
      orden: orderProduction,
      receta: {
        id: recipe.id,
        code: recipe.code,
        name: recipe.name,
        baseYield: recipe.baseYield,
      },
      insumos: materials,
    };
  }

  async consumeRequiredMaterials(id: number) {
    return this.orderProductionsRepository.manager.transaction(async (manager) => {
      const ordersRepository = manager.getRepository(OrderProduction);
      const stateRepository = manager.getRepository(State);
      const consumptionsRepository = manager.getRepository(RawMaterialConsumption);
      const batchRepository = manager.getRepository(Batch);
      const inventoryMovementsRepository = manager.getRepository(InventoryMovement);

      // MEJORA 1: Bloqueo y carga de relaciones en una sola consulta
      const orderProduction = await ordersRepository.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
        relations: { state: true, product: { category: true } },
      });

      if (!orderProduction) {
        throw new NotFoundException(`Production order with ID ${id} not found`);
      }

      // Opcional/Recomendado: Validar que la orden esté en un estado válido para consumir
      // if (orderProduction.state.name !== 'ESTADO_ESPERADO') throw new ConflictException(...);

      const existingConsumptions = await consumptionsRepository.count({
        where: { ordersProduction: { id } },
      });
      if (existingConsumptions > 0) {
        throw new ConflictException(`La orden ${id} ya tiene consumos de materia prima registrados`);
      }

      const dosificacionState = await stateRepository.findOne({
        where: { name: 'EN DOSIFICACION', isActive: true },
      });
      if (!dosificacionState) {
        throw new UnprocessableEntityException('No se encontró el estado "EN DOSIFICACION".');
      }

      // Actualizamos el estado pero podemos diferir el guardado para el final, o hacerlo aquí.
      orderProduction.state = dosificacionState;
      await ordersRepository.save(orderProduction);

      const { recipe, materials } = await this.calculateRequiredMaterials(orderProduction, manager.getRepository(Recipe));

      const exitType = await manager.getRepository(TypeMovement).findOne({
        where: { name: 'SALIDA', isActive: true },
      });
      if (!exitType) {
        throw new UnprocessableEntityException('No está configurado un tipo de movimiento activo llamado SALIDA');
      }

      const materialTotals = new Map<number, RequiredMaterial>();
      for (const material of materials) {
        const existing = materialTotals.get(material.id);
        materialTotals.set(
          material.id,
          existing
            ? {
                ...existing,
                cantidadRequerida: addDecimalStrings(existing.cantidadRequerida, material.cantidadRequerida),
              }
            : material,
        );
      }

      const consumptionDate = new Date();
      const plannedConsumptions = [];

      // Validar y planificar (Se mantiene igual, excelente lógica de bloqueos por ID y validación)
      for (const material of [...materialTotals.values()].sort((left, right) => left.id - right.id)) {
        const requiredQuantityText = roundDecimalToScale(material.cantidadRequerida, 2);
        const requiredQuantity = parsePositiveModelDecimal(requiredQuantityText, `La cantidad requerida...`);
        const requiredCents = decimalToScaledInteger(requiredQuantity, 2);

        const batches = await batchRepository.createQueryBuilder('batch').where('batch.product_id = :productId', { productId: material.id }).andWhere('batch.quantityAvailable > 0').andWhere('batch.expirationDate >= CURRENT_DATE').orderBy('batch.expirationDate', 'ASC').addOrderBy('batch.entryDate', 'ASC').addOrderBy('batch.id', 'ASC').setLock('pessimistic_write').getMany();

        let availableCents = 0n;
        const eligibleBatches = batches.map((batch) => {
          const available = parsePositiveModelDecimal(batch.quantityAvailable, `El saldo del lote ${batch.code}`);
          const balance = decimalToScaledInteger(available, 2);
          availableCents += balance;
          return { batch, balance };
        });

        if (availableCents < requiredCents) {
          throw new UnprocessableEntityException(`Inventario insuficiente de ${material.nombre}: se requieren ${requiredQuantityText} ${material.unidadMedida.abreviatura} y hay ${scaledIntegerToDecimal(availableCents, 2)} disponibles en lotes vigentes`);
        }

        let remainingCents = requiredCents;
        for (const { batch, balance } of eligibleBatches) {
          if (remainingCents === 0n) break;
          const quantity = balance < remainingCents ? balance : remainingCents;
          plannedConsumptions.push({ material, batch, quantity, previousBalance: balance });
          remainingCents -= quantity;
        }
      }

      // MEJORA 2: Preparar arreglos para inserciones masivas en BD
      const consumptionsByMaterial = new Map<number, any>();
      const batchesToUpdate = [];
      const consumptionsToInsert = [];
      const movementsToInsert = [];

      for (const planned of plannedConsumptions) {
        const { batch, material, quantity, previousBalance } = planned;
        const quantityText = scaledIntegerToDecimal(quantity, 2);
        const currentBalance = previousBalance - quantity;

        // Acumular Lotes
        batch.quantityAvailable = scaledIntegerToDecimal(currentBalance, 2);
        batchesToUpdate.push(batch);

        // Acumular Consumos
        consumptionsToInsert.push(
          consumptionsRepository.create({
            quantity: quantityText,
            date: consumptionDate,
            observation: `Consumo de ${material.nombre} para la orden ${orderProduction.numberOrder ?? id}`,
            batch: { id: batch.id },
            ordersProduction: { id },
          }),
        );

        // Acumular Movimientos
        movementsToInsert.push(
          inventoryMovementsRepository.create({
            quantity: quantityText,
            balancePrevius: scaledIntegerToDecimal(previousBalance, 2),
            balanceCurrent: scaledIntegerToDecimal(currentBalance, 2),
            date: consumptionDate,
            observation: `Salida de ${material.nombre} para la orden ${orderProduction.numberOrder ?? id}`,
            batch: { id: batch.id },
            ordersProduction: { id },
            typeMovement: { id: exitType.id },
          }),
        );

        // Construir respuesta
        const materialConsumption = consumptionsByMaterial.get(material.id) ?? {
          productoId: material.id,
          producto: material.nombre,
          unidad: material.unidadMedida.abreviatura,
          cantidadRequerida: roundDecimalToScale(material.cantidadRequerida, 2),
          lotes: [],
        };

        materialConsumption.lotes.push({
          loteId: batch.id,
          codigoLote: batch.code ?? String(batch.id),
          cantidadConsumida: quantityText,
          saldoAnterior: scaledIntegerToDecimal(previousBalance, 2),
          saldoActual: scaledIntegerToDecimal(currentBalance, 2),
        });
        consumptionsByMaterial.set(material.id, materialConsumption);
      }

      // MEJORA 2 (Ejecución): Guardar todo en bloque fuera del for
      if (batchesToUpdate.length > 0) await batchRepository.save(batchesToUpdate);
      if (consumptionsToInsert.length > 0) await consumptionsRepository.save(consumptionsToInsert);
      if (movementsToInsert.length > 0) await inventoryMovementsRepository.save(movementsToInsert);

      return {
        orden: { id, numberOrder: orderProduction.numberOrder, estado: orderProduction.state.name },
        receta: { id: recipe.id, code: recipe.code, name: recipe.name },
        consumos: [...consumptionsByMaterial.values()],
      };
    });
  }

  private async calculateRequiredMaterials(orderProduction: OrderProduction, recipesRepository: Repository<Recipe>): Promise<{ recipe: Recipe; materials: RequiredMaterial[] }> {
    if (!orderProduction.product) {
      throw new UnprocessableEntityException(`La orden ${orderProduction.id} no tiene un producto final válido`);
    }
    if (orderProduction.product.category.id !== 2) {
      throw new UnprocessableEntityException(`El producto ${orderProduction.product.id} de la orden ${orderProduction.id} no pertenece a la categoría 2`);
    }
    const scheduledQuantity = parsePositiveModelDecimal(orderProduction.quantitySheduled, 'La cantidad programada de la orden');

    const applicableRecipes = await recipesRepository.find({
      where: { isActive: true, product: { id: orderProduction.product.id } },
      relations: {
        product: true,
        detailsRecipe: { product: { unitsMeasurement: true } },
      },
    });
    if (applicableRecipes.length === 0) {
      throw new NotFoundException(`El producto ${orderProduction.product.id} no tiene una receta activa`);
    }
    if (applicableRecipes.length > 1) {
      throw new ConflictException(`El producto ${orderProduction.product.id} tiene más de una receta activa; revise la asignación de recetas`);
    }
    const [recipe] = applicableRecipes;

    let baseYield: ReturnType<typeof parsePositiveModelDecimal>;
    try {
      baseYield = parsePositiveModelDecimal(recipe.baseYield, `The base yield for recipe ${recipe.id}`);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new UnprocessableEntityException(error.message);
      }
      throw error;
    }

    if (!recipe.detailsRecipe?.length) {
      throw new UnprocessableEntityException(`La receta ${recipe.id} no tiene detalles de insumos`);
    }

    const materials = recipe.detailsRecipe.map((detail) => {
      if (!detail.product || !detail.product.unitsMeasurement) {
        throw new UnprocessableEntityException(`El detalle ${detail.id} de la receta ${recipe.id} no tiene un insumo o unidad de medida válida`);
      }
      let amount: ReturnType<typeof parsePositiveModelDecimal>;
      try {
        amount = parsePositiveModelDecimal(detail.amount, `La cantidad del detalle ${detail.id} de la receta ${recipe.id}`);
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw new UnprocessableEntityException(error.message);
        }
        throw error;
      }
      return {
        id: detail.product.id,
        nombre: detail.product.name,
        unidadMedida: {
          id: detail.product.unitsMeasurement.id,
          nombre: detail.product.unitsMeasurement.name,
          abreviatura: detail.product.unitsMeasurement.abbreviation,
        },
        cantidadRequerida: multiplyAndDivideDecimals(amount, scheduledQuantity, baseYield),
      };
    });

    return { recipe, materials };
  }

  async create(createOrderProductionDto: CreateOrderProductionDto, userId: number) {
    try {
      const { stateId, productId, ...fields } = createOrderProductionDto;

      return await this.orderProductionsRepository.manager.transaction(async (manager) => {
        const repository = manager.getRepository(OrderProduction);

        const order = repository.create({
          ...fields,
          numberOrder: 'TEMP',
          user: { id: userId },
          state: { id: Number(stateId) },
          product: { id: Number(productId) },
        });

        const savedOrder = await repository.save(order);

        savedOrder.numberOrder = `OP-${String(savedOrder.id).padStart(6, '0')}`;

        return await repository.save(savedOrder);
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }

      throw new BadRequestException('Error al crear la orden de producción');
    }
  }

  async update(id: number, updateOrderProductionDto: UpdateOrderProductionDto) {
    const orderProduction = await this.findOne(id);
    const { stateId, productId, ...orderProductionFields } = updateOrderProductionDto;
    try {
      const updatedOrderProduction = this.orderProductionsRepository.merge(orderProduction, {
        ...orderProductionFields,
        ...(stateId !== undefined ? { state: { id: stateId } } : {}),
        ...(productId !== undefined ? { product: { id: productId } } : {}),
      });
      await this.orderProductionsRepository.save(updatedOrderProduction);
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al actualizar la orden de producción');
    }
  }

  async remove(id: number) {
    const orderProduction = await this.findOne(id);
    try {
      await this.orderProductionsRepository.remove(orderProduction);
      return {
        success: true,
        message: 'Orden de producción eliminada correctamente',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al eliminar la orden de producción');
    }
  }
}
