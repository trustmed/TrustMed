import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CreateAccessRequestDto } from './dto/create-access-request.dto';

@Injectable()
export class AccessService {
  constructor(private readonly blockchainService: BlockchainService) {}

  createRequest(dto: CreateAccessRequestDto) {
    return this.blockchainService.createAccessRequest(dto);
  }

  approveRequest(requestId: string, expiresAt: string) {
    return this.blockchainService.approveAccessRequest(requestId, expiresAt);
  }

  getRequest(requestId: string) {
    return this.blockchainService.readAccessRequest(requestId);
  }

  checkAccess(requestId: string) {
    return this.blockchainService.checkAccess(requestId);
  }
}
