import { BadRequestException, HttpException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBatchDto } from '../dto/create-batch.dto.js';
import { UpdateBatchDto } from '../dto/update-batch.dto.js';
import { Batch } from '../entities/batch.entity.js';
import { Product } from '../../products/entities/product.entity.js';
import { Provider } from '../../providers/entities/provider.entity.js';
import { InventoryMovement } from '../../inventory.movement/entities/inventory.movement.entity.js';
import { TypeMovement } from '../../inventory.movement/entities/type.movement.entity.js';

@Injectable()
export class BatchsService {
  constructor(
    @InjectRepository(Batch)
    private readonly batchsRepository: Repository<Batch>,
  ) {}

  findAll() {
    return this.batchsRepository.find({
      relations: {
        product: true,
        provider: true,
      },
    });
  }

  async getStockSummary() {
    const rows = await this.batchsRepository.createQueryBuilder('batch').innerJoin('batch.product', 'product').innerJoin('product.unitsMeasurement', 'unit').select('product.id', 'productoId').addSelect('product.name', 'producto').addSelect('unit.abbreviation', 'unidad').addSelect('SUM(batch.quantityAvailable)', 'cantidadDisponible').where('batch.quantityAvailable > 0').groupBy('product.id').addGroupBy('product.name').addGroupBy('unit.abbreviation').orderBy('product.name', 'ASC').getRawMany<{
      productoId: number | string;
      producto: string;
      unidad: string;
      cantidadDisponible: string;
    }>();

    return {
      existencias: rows.map((row) => ({
        productoId: Number(row.productoId),
        producto: row.producto,
        unidad: row.unidad,
        cantidadDisponible: row.cantidadDisponible,
      })),
    };
  }

  async getStockByProduct(productId: number) {
    if (!Number.isInteger(productId) || productId <= 0) {
      throw new BadRequestException('El ID del producto debe ser un entero positivo');
    }

    const batches = await this.batchsRepository.find({
      where: { product: { id: productId } },
      relations: { product: { unitsMeasurement: true }, provider: true },
      order: { expirationDate: 'ASC', entryDate: 'ASC' },
    });

    const product = batches[0]?.product;
    return {
      productoId: productId,
      producto: product?.name ?? null,
      unidad: product?.unitsMeasurement.abbreviation ?? null,
      lotes: batches.map((batch) => ({
        id: batch.id,
        codigo: batch.code,
        proveedor: batch.provider.name,
        fechaIngreso: batch.entryDate,
        fechaVencimiento: batch.expirationDate,
        cantidadInicial: batch.quantityInitial,
        cantidadDisponible: batch.quantityAvailable,
      })),
    };
  }

  async findOne(id: number) {
    const batch = await this.batchsRepository.findOne({
      where: { id },
      relations: {
        product: true,
        provider: true,
      },
    });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }
    return batch;
  }

  async getBatchByCode(code: string) {
    const batch = await this.batchsRepository.find({
      where: { code },
      relations: {
        product: true,
        provider: true,
      },
    });

    if (!batch) {
      throw new NotFoundException(`Batch with code ${code} not found`);
    }

    return batch;
  }

  async create(createBatchDto: CreateBatchDto) {
    const { providerId, productId, quantityInitial, quantityAvailable, ...fields } = createBatchDto;
    if (quantityInitial === undefined || quantityInitial === null || !Number.isFinite(quantityInitial) || quantityInitial <= 0) {
      throw new BadRequestException('La cantidad inicial del lote debe ser mayor que cero');
    }
    if (quantityAvailable !== undefined && quantityAvailable !== null && quantityAvailable !== quantityInitial) {
      throw new BadRequestException('La cantidad disponible inicial debe coincidir con la cantidad inicial del lote');
    }

    try {
      return await this.batchsRepository.manager.transaction(async (manager) => {
        const repository = manager.getRepository(Batch);
        const inventoryMovementsRepository = manager.getRepository(InventoryMovement);
        const typeMovementsRepository = manager.getRepository(TypeMovement);

        const batch = repository.create({
          ...fields,
          quantityInitial,
          quantityAvailable: quantityInitial,
          entryDate: fields.entryDate ?? new Date(),
          code: 'TEMP',
          provider: { id: providerId },
          product: { id: productId },
        });

        const savedBatch = await repository.save(batch);
        savedBatch.code = `L-${String(savedBatch.id).padStart(6, '0')}`;

        const batchWithCode = await repository.save(savedBatch);
        const entryType = await typeMovementsRepository.findOne({
          where: { name: 'ENTRADA', isActive: true },
        });
        if (!entryType) {
          throw new UnprocessableEntityException('No está configurado un tipo de movimiento activo llamado ENTRADA');
        }

        const inventoryMovement = inventoryMovementsRepository.create({
          quantity: quantityInitial,
          balancePrevius: 0,
          balanceCurrent: quantityInitial,
          date: batchWithCode.entryDate,
          observation: `Entrada inicial del lote ${batchWithCode.code}`,
          batch: { id: batchWithCode.id },
          typeMovement: { id: entryType.id },
        });
        await inventoryMovementsRepository.save(inventoryMovement);

        return batchWithCode;
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }

      throw new BadRequestException('Error al crear el lote');
    }
  }

  async update(id: number, updateBatchDto: UpdateBatchDto) {
    try {
      const batch = await this.findOne(id);
      const { productId, providerId, quantityAvailable, ...detailData } = updateBatchDto;

      const updatedBatch = this.batchsRepository.merge(batch, detailData);

      if (productId !== undefined) {
        updatedBatch.product = { id: Number(productId) } as Product;
      }

      if (providerId !== undefined) {
        updatedBatch.provider = { id: Number(providerId) } as Provider;
      }

      await this.batchsRepository.save(updatedBatch);

      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al actualizar el lote');
    }
  }

  async remove(id: number) {
    const batch = await this.findOne(id);
    try {
      await this.batchsRepository.remove(batch);

      return {
        success: true,
        message: 'Lote eliminado correctamente',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al eliminar el lote');
    }
  }
}
