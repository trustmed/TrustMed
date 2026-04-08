import { Controller, Post, Body, Get, Param } from "@nestjs/common";
import { BlockchainService } from "./blockchain.service";

@Controller("audit-logs")
export class AuditController {
  constructor(private readonly service: BlockchainService) {}

  @Post()
  log(@Body() body: any) {
    return this.service.logAuditEvent(body);
  }

  @Get(":patientId")
  getHistory(@Param("patientId") patientId: string) {
    return this.service.getAuditHistory(patientId);
  }
}
