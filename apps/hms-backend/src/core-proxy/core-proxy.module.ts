import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CoreProxyService } from './core-proxy.service.js';

@Global()
@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
    }),
  ],
  providers: [CoreProxyService],
  exports: [CoreProxyService],
})
export class CoreProxyModule {}
