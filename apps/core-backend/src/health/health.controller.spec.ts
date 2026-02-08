import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService, HealthResponse } from './health.service';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;
  let dataSource: Partial<DataSource>;

  beforeEach(async () => {
    dataSource = {
      isInitialized: true,
      query: jest.fn().mockResolvedValue([{ 1: 1 }]),
      options: { type: 'mysql' } as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: getDataSourceToken(),
          useValue: dataSource,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkHealth', () => {
    describe('when backend is not up', () => {
      it('should return status as down', async () => {
        // Arrange
        jest
          .spyOn(service, 'getHealth')
          .mockRejectedValueOnce(new Error('Database connection failed'));

        // Act & Assert
        await expect(controller.checkHealth()).rejects.toThrow(
          'Database connection failed',
        );
      });

      it('should indicate service is unavailable when health check fails', async () => {
        // Arrange
        const healthCheckError = new Error('Service unavailable');
        jest
          .spyOn(service, 'getHealth')
          .mockRejectedValueOnce(healthCheckError);

        // Act & Assert
        await expect(controller.checkHealth()).rejects.toThrow(
          'Service unavailable',
        );
      });
    });

    describe('when backend is up', () => {
      it('should return status as up with uptime information', async () => {
        // Arrange
        const mockHealthResponse: HealthResponse = {
          status: 'up',
          uptime: 3600, // 1 hour in seconds
          timestamp: new Date().toISOString(),
          message: 'Backend is running and database is connected',
          database: {
            status: 'connected',
            type: 'mysql',
          },
        };
        jest
          .spyOn(service, 'getHealth')
          .mockResolvedValueOnce(mockHealthResponse);

        // Act
        const result = await controller.checkHealth();

        // Assert
        expect(result.status).toBe('up');
        expect(result.uptime).toBeDefined();
        expect(result.timestamp).toBeDefined();
        expect(result.message).toBeDefined();
        expect(result.database).toBeDefined();
        expect(result.database?.status).toBe('connected');
      });

      it('should return correct uptime in seconds', async () => {
        // Arrange
        const expectedUptime = 7200; // 2 hours
        const mockHealthResponse: HealthResponse = {
          status: 'up',
          uptime: expectedUptime,
          timestamp: new Date().toISOString(),
          message: 'Backend is running and database is connected',
          database: {
            status: 'connected',
            type: 'mysql',
          },
        };
        jest
          .spyOn(service, 'getHealth')
          .mockResolvedValueOnce(mockHealthResponse);

        // Act
        const result = await controller.checkHealth();

        // Assert
        expect(result.uptime).toBe(expectedUptime);
      });

      it('should return current timestamp when backend is up', async () => {
        // Arrange
        const beforeTime = new Date();
        const mockHealthResponse: HealthResponse = {
          status: 'up',
          uptime: 1800,
          timestamp: new Date().toISOString(),
          message: 'Backend is running and database is connected',
          database: {
            status: 'connected',
            type: 'mysql',
          },
        };
        jest
          .spyOn(service, 'getHealth')
          .mockResolvedValueOnce(mockHealthResponse);

        // Act
        const result = await controller.checkHealth();
        const responseTime = new Date(result.timestamp);

        // Assert
        expect(responseTime).toBeInstanceOf(Date);
        expect(responseTime.getTime()).toBeGreaterThanOrEqual(
          beforeTime.getTime(),
        );
      });

      it('should include descriptive message about backend status', async () => {
        // Arrange
        const mockHealthResponse: HealthResponse = {
          status: 'up',
          uptime: 5000,
          timestamp: new Date().toISOString(),
          message: 'Backend is running and database is connected',
          database: {
            status: 'connected',
            type: 'mysql',
          },
        };
        jest
          .spyOn(service, 'getHealth')
          .mockResolvedValueOnce(mockHealthResponse);

        // Act
        const result = await controller.checkHealth();

        // Assert
        expect(result.message).toBeDefined();
        expect(typeof result.message).toBe('string');
        expect(result.message.length).toBeGreaterThan(0);
      });

      it('should return consistent data structure across multiple calls', async () => {
        // Arrange
        const mockHealthResponse1: HealthResponse = {
          status: 'up',
          uptime: 1000,
          timestamp: new Date().toISOString(),
          message: 'Backend is running and database is connected',
          database: {
            status: 'connected',
            type: 'mysql',
          },
        };
        const mockHealthResponse2: HealthResponse = {
          status: 'up',
          uptime: 2000,
          timestamp: new Date().toISOString(),
          message: 'Backend is running and database is connected',
          database: {
            status: 'connected',
            type: 'mysql',
          },
        };

        jest
          .spyOn(service, 'getHealth')
          .mockResolvedValueOnce(mockHealthResponse1)
          .mockResolvedValueOnce(mockHealthResponse2);

        // Act
        const result1 = await controller.checkHealth();
        const result2 = await controller.checkHealth();

        // Assert
        expect(Object.keys(result1).sort()).toEqual(
          Object.keys(result2).sort(),
        );
        expect(result1).toHaveProperty('status');
        expect(result1).toHaveProperty('uptime');
        expect(result1).toHaveProperty('timestamp');
        expect(result1).toHaveProperty('message');
        expect(result1).toHaveProperty('database');
      });

      it('should return database connection status when connected', async () => {
        // Arrange
        const mockHealthResponse: HealthResponse = {
          status: 'up',
          uptime: 1000,
          timestamp: new Date().toISOString(),
          message: 'Backend is running and database is connected',
          database: {
            status: 'connected',
            type: 'mysql',
          },
        };
        jest
          .spyOn(service, 'getHealth')
          .mockResolvedValueOnce(mockHealthResponse);

        // Act
        const result = await controller.checkHealth();

        // Assert
        expect(result.database).toBeDefined();
        expect(result.database?.status).toBe('connected');
        expect(result.database?.type).toBe('mysql');
      });

      it('should return database type information', async () => {
        // Arrange
        const mockHealthResponse: HealthResponse = {
          status: 'up',
          uptime: 1000,
          timestamp: new Date().toISOString(),
          message: 'Backend is running and database is connected',
          database: {
            status: 'connected',
            type: 'mysql',
          },
        };
        jest
          .spyOn(service, 'getHealth')
          .mockResolvedValueOnce(mockHealthResponse);

        // Act
        const result = await controller.checkHealth();

        // Assert
        expect(result.database?.type).toBeDefined();
        expect(typeof result.database?.type).toBe('string');
      });
    });

    describe('when database is disconnected', () => {
      it('should return status as down when database is not connected', async () => {
        // Arrange
        const mockHealthResponse: HealthResponse = {
          status: 'down',
          uptime: 1000,
          timestamp: new Date().toISOString(),
          message: 'Backend is running but database is disconnected',
          database: {
            status: 'disconnected',
            type: 'mysql',
          },
        };
        jest
          .spyOn(service, 'getHealth')
          .mockResolvedValueOnce(mockHealthResponse);

        // Act
        const result = await controller.checkHealth();

        // Assert
        expect(result.status).toBe('down');
        expect(result.database?.status).toBe('disconnected');
      });

      it('should include appropriate message when database is disconnected', async () => {
        // Arrange
        const mockHealthResponse: HealthResponse = {
          status: 'down',
          uptime: 1000,
          timestamp: new Date().toISOString(),
          message: 'Backend is running but database is disconnected',
          database: {
            status: 'disconnected',
            type: 'mysql',
          },
        };
        jest
          .spyOn(service, 'getHealth')
          .mockResolvedValueOnce(mockHealthResponse);

        // Act
        const result = await controller.checkHealth();

        // Assert
        expect(result.message).toContain('disconnected');
      });
    });
  });
});
