import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

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
        this.httpService.post(this.gatewayUrl, dto),
      );
      return data;
    } catch (error) {
      this.logger.error(
        `Failed to reach Blockchain Gateway at ${this.gatewayUrl}`,
      );
      throw error;
    }
  }

  // Helper to verify connectivity from local machine to gateway
  async checkGatewayHealth(): Promise<{ status: string }> {
    await firstValueFrom(this.httpService.get(`${this.gatewayUrl}/health`));
    return { status: 'connected' };
  }
}
