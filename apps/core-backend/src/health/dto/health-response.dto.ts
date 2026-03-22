import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class DatabaseHealth {
  @ApiProperty({
    enum: ['connected', 'disconnected'],
    example: 'connected',
  })
  status: 'connected' | 'disconnected';

  @ApiProperty({
    example: 'postgres',
    description: 'The type of database currently in use',
  })
  type: string;
}

export class HealthResponseDto {
  @ApiProperty({
    enum: ['up', 'down'],
    example: 'up',
  })
  status: 'up' | 'down';

  @ApiProperty({
    example: 3600,
    description: 'Application uptime in seconds',
  })
  uptime: number;

  @ApiProperty({
    example: '2026-03-07T12:00:00.000Z',
    description: 'ISO timestamp of the health check',
  })
  timestamp: string;

  @ApiProperty({
    example: 'Backend is running and database is connected',
  })
  message: string;

  @ApiPropertyOptional({
    type: DatabaseHealth,
  })
  database?: DatabaseHealth;
}

class SubStatusDto {
  @ApiProperty({ enum: ['UP', 'DOWN', 'DEGRADED'], example: 'UP' })
  status: string;

  @ApiProperty({ example: 'Org1MSP', required: false })
  mspId?: string;

  @ApiProperty({ example: '2026-03-22T05:30:41.076Z', required: false })
  timestamp?: string;

  @ApiProperty({ example: 'PEER_UNREACHABLE', required: false })
  details?: string;
}

class NetworkStatusDto extends SubStatusDto {
  @ApiProperty({ example: 'mychannel' })
  channel: string;

  @ApiProperty({ example: 'trustmed' })
  chaincode: string;
}

export class BlockchainHealthResponseDto {
  @ApiProperty({ enum: ['OK', 'ERROR', 'DEGRADED'], example: 'OK' })
  status: string;

  @ApiProperty({ type: SubStatusDto })
  gateway: SubStatusDto;

  @ApiProperty({ type: NetworkStatusDto })
  network: NetworkStatusDto;
}
