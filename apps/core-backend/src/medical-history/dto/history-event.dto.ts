import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HistoryEventDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ description: 'Originating source: local | blockchain' })
    source: 'local' | 'blockchain';

    @ApiProperty({ description: 'Event type / action performed' })
    eventType: string;

    @ApiPropertyOptional({ description: 'UUID of the actor' })
    actorId?: string;

    @ApiPropertyOptional({ description: 'UUID of the target resource' })
    targetResource?: string;

    @ApiPropertyOptional({ description: 'Original filename of the document' })
    fileName?: string;

    @ApiPropertyOptional({ description: 'Document category' })
    category?: string;

    @ApiProperty({ description: 'When the event occurred' })
    timestamp: Date;

    @ApiPropertyOptional({ description: 'Human-readable summary' })
    description?: string;

    @ApiPropertyOptional({ description: 'Extra metadata' })
    additionalData?: Record<string, unknown>;
}

export class MedicalHistoryResponseDto {
    @ApiProperty({ type: [HistoryEventDto] })
    events: HistoryEventDto[];

    @ApiProperty()
    totalCount: number;
}
