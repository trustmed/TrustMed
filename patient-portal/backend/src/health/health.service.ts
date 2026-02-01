import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface HealthResponse {
  status: 'up' | 'down';
  uptime: number;
  timestamp: string;
  message: string;
  database?: {
    status: 'connected' | 'disconnected';
    type: string;
  };
}

@Injectable()
export class HealthService {
  private startTime: number;

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {
    this.startTime = Date.now();
  }

  async getHealth(): Promise<HealthResponse> {
    try {
      // Calculate uptime in seconds
      const uptimeMs = Date.now() - this.startTime;
      const uptime = Math.floor(uptimeMs / 1000);

      // Check database connection
      let dbStatus: 'connected' | 'disconnected' = 'disconnected';
      try {
        if (this.dataSource.isInitialized) {
          await this.dataSource.query('SELECT 1');
          dbStatus = 'connected';
        }
      } catch (error) {
        dbStatus = 'disconnected';
        throw new Error(
          'Database connection error: ' + (error as Error).message,
        );
      }

      return {
        status: dbStatus === 'connected' ? 'up' : 'down',
        uptime,
        timestamp: new Date().toISOString(),
        message:
          dbStatus === 'connected'
            ? 'Backend is running and database is connected'
            : 'Backend is running but database is disconnected',
        database: {
          status: dbStatus,
          type: this.dataSource.options.type,
        },
      };
    } catch (error) {
      throw new Error('Health check failed : ' + (error as Error).message);
    }
  }
}
