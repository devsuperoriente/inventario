import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as soap from 'soap';
import { Builder } from 'xml2js';
import { CreateSiesaInventoryMovementDto } from '../interfaces/siesa.interface.js';

@Injectable()
export class SiesaService {
  private readonly logger = new Logger(SiesaService.name);
  private readonly wsdlUrl = 'https://wssuperoriente.siesacloud.com:8043/WSUNOEE/WSUNOEE.asmx?WSDL';

  async registrarEntradaInventario(dto: CreateSiesaInventoryMovementDto): Promise<void> {
    const xmlPayload = this.buildXmlPayload(dto);

    try {
      const client = await soap.createClientAsync(this.wsdlUrl);
      const [result] = await client.ImportarXMLAsync({ pvstrDatos: xmlPayload });

      this.validateSiesaResponse(result?.ImportarXMLResult);
    } catch (error) {
      throw new InternalServerErrorException('Fallo en la sincronización con Siesa ERP');
    }
  }

  private buildXmlPayload(dto: CreateSiesaInventoryMovementDto): string {
    const builder = new Builder({ rootName: 'IMPORTAR', xmldec: { version: '1.0', encoding: 'UTF-8' } });
    return builder.buildObject({
      NombreConector: 'EntradasInventario',
      IdCompania: process.env.SIESA_COMPANY_ID || '1',
      Datos: {
        Linea: {
          CodigoLote: dto.batchCode,
          Cantidad: dto.quantity,
          IdProducto: dto.productId,
          IdProveedor: dto.providerId,
        },
      },
    });
  }

  private validateSiesaResponse(responseXml?: string): void {
    if (!responseXml || responseXml.includes('Status="Error"') || responseXml.includes('<Error>')) {
      this.logger.error(`Siesa devolvió un error de negocio: ${responseXml}`);
      throw new Error('Siesa no pudo procesar la transacción.');
    }
  }
}
