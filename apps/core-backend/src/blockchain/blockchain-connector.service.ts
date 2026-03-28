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
    this.gatewayUrl = this.configService.get<string>(
      'BLOCKCHAIN_GATEWAY_URL',
      'http://localhost:4001/access-requests',
    );
  }

  async createRequest(dto: unknown): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<unknown>(this.gatewayUrl, dto),
      );
      return data;
    } catch (error) {
      this.logger.error(
        `Failed to reach Blockchain Gateway at ${this.gatewayUrl}`,
      );
      throw error;
    }
  }

  async getAllAccessRequests(patientDid: string): Promise<unknown[]> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<unknown[]>(
          `${this.gatewayUrl}/patient/${patientDid}`,
        ),
      );
      return data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch access requests for patient ${patientDid} from ${this.gatewayUrl}`,
      );
      return [];
    }
  }

  async getAccessRequest(requestId: string): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<unknown>(`${this.gatewayUrl}/${requestId}`),
      );
      return data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch access request ${requestId} from ${this.gatewayUrl}`,
      );
      throw error;
    }
  }

  async getRecordRegistry(patientDid: string): Promise<unknown[]> {
    try {
      const registryUrl = this.configService.get<string>(
        'BLOCKCHAIN_REGISTRY_URL',
        'http://localhost:4001/record-registry',
      );
      const { data } = await firstValueFrom(
        this.httpService.get<unknown[]>(`${registryUrl}/patient/${patientDid}`),
      );
      return data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch record registry for patient ${patientDid}`,
      );
      return [];
    }
  }

  // verify connectivity from local machine to gateway
  async checkGatewayHealth(): Promise<BlockchainHealthResponseDto> {
    const { data } = await firstValueFrom(
      this.httpService.get<BlockchainHealthResponseDto>(
        `${this.gatewayUrl}/access-requests/health`,
      ),
    );
    return data;
  }
}
