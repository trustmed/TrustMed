import { Controller, Get, Param, Post, Body } from "@nestjs/common";
import { BlockchainService } from "./blockchain.service";

@Controller("access-requests")
export class BlockchainController {
  constructor(private readonly service: BlockchainService) {}

  @Get("health")
  async getHealth() {
    return await this.service.checkHealth();
  }

  @Post()
  create(@Body() body: any) {
    return this.service.createAccessRequest(body);
  }

  @Post(":id/approve")
  approve(@Param("id") id: string, @Body() body: any) {
    return this.service.approveAccessRequest(id, body.expiresAt);
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.service.readAccessRequest(id);
  }

  @Get(":id/check")
  check(@Param("id") id: string) {
    return this.service.checkAccess(id);
  }
}
