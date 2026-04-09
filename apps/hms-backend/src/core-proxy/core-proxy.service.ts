import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type { AxiosRequestConfig } from 'axios';

/**
 * Core proxy service that forwards requests to the TrustMed core-backend.
 * All HMS backend modules use this to communicate with the core API.
 */
@Injectable()
export class CoreProxyService {
  private readonly logger = new Logger(CoreProxyService.name);
  private readonly coreUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.coreUrl = this.configService.get<string>(
      'CORE_BACKEND_URL',
      'http://localhost:4000',
    );
  }

  /**
   * Forward a request to the core-backend, passing cookies through
   * so the JWT auth works end-to-end.
   */
  async forward<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    options?: {
      data?: any;
      cookies?: string;
      params?: Record<string, string>;
      responseType?: 'json' | 'arraybuffer';
    },
  ): Promise<{ data: T; headers: Record<string, any>; status: number }> {
    const url = `${this.coreUrl}/api${path}`;

    const config: AxiosRequestConfig = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      params: options?.params,
      responseType: options?.responseType || 'json',
    };

    // Forward cookies for auth
    if (options?.cookies) {
      config.headers = {
        ...config.headers,
        Cookie: options.cookies,
      };
    }

    if (options?.data) {
      config.data = options.data;
    }

    this.logger.debug(`Proxying ${method} ${path} → ${url}`);

    const response = await firstValueFrom(
      this.httpService.request<T>(config),
    );

    return {
      data: response.data,
      headers: response.headers as Record<string, any>,
      status: response.status,
    };
  }
}
