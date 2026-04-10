import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { BlockchainHealthResponseDto } from '../health/dto/health-response.dto';

@Injectable()
export class BlockchainConnectorService {
  private readonly logger = new Logger(BlockchainConnectorService.name);
  private readonly gatewayUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // get the blockchain gateway url from the env
    this.gatewayUrl = this.configService.get<string>(
      'BLOCKCHAIN_GATEWAY_URL',
      'http://localhost:4001/access-requests',
    );
  }

  //send access request to blockchain gateway to record the request on the ledger
  async createRequest(dto: unknown): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<unknown>(this.gatewayUrl, dto),
      );
      return data;
    } catch (error) {
      console.log(error);
      this.logger.error(
        `Failed to reach Blockchain Gateway at ${this.gatewayUrl}`,
      );
      throw error;
    }
  }

  //send audit log to blockchain gateway to record the log on the ledger
  async logAuditEvent(auditEvent: unknown): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<unknown>(
          `${this.gatewayUrl}/audit-logs`,
          auditEvent,
        ),
      );
      return data;
    } catch (error) {
      console.log(error);
      this.logger.error(
        `Failed to reach Blockchain Gateway for Audit Log at ${this.gatewayUrl}/audit-logs`,
      );
      return null;
    }
  }

  //get audit history for a patient from the blockchain gateway
  async getAuditHistory(patientDid: string): Promise<any[]> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<any[]>(
          `${this.gatewayUrl}/audit-logs/${patientDid}`,
        ),
      );
      return data;
    } catch (error) {
      console.log(error);
      this.logger.error(
        `Failed to fetch audit history for ${patientDid} from blockchain gateway`,
      );
      return [];
    }
  }

  //get all access requests for a patient from the blockchain gateway
  async getAllAccessRequests(patientDid: string): Promise<unknown[]> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<unknown[]>(
          `${this.gatewayUrl}/patient/${patientDid}`,
        ),
      );
      return data;
    } catch (error) {
      console.log(error);
      this.logger.error(
        `Failed to fetch access requests for patient ${patientDid} from ${this.gatewayUrl}`,
        error,
      );
      return [];
    }
  }

  //get access request by id from the blockchain gateway
  async getAccessRequest(requestId: string): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<unknown>(`${this.gatewayUrl}/${requestId}`),
      );
      return data;
    } catch (error) {
      console.log(error);
      this.logger.error(
        `Failed to fetch access request ${requestId} from ${this.gatewayUrl}`,
        error,
      );
      throw error;
    }
  }

  // check the connection between the core-backend and the blockchain gateway
  async checkGatewayHealth(): Promise<BlockchainHealthResponseDto> {
    const { data } = await firstValueFrom(
      this.httpService.get<BlockchainHealthResponseDto>(
        `${this.gatewayUrl}/access-requests/health`,
      ),
    );
    return data;
  }
}
