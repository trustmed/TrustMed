import { IsNotEmpty, IsString } from 'class-validator';

export class ApproveAccessRequestDto {
  @IsString()
  @IsNotEmpty()
  expiresAt!: string;
}
