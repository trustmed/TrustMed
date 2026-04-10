import { Controller, Post, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AiChatService } from './ai-chat.service';

@Controller('ai-chat')
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post()
  async chat(@Body() body: any, @Res() res: Response) {
    // If body has 'messages', treat as multi-message (streaming)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (Array.isArray(body.messages)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      const result: any = await this.aiChatService.streamChat(body.messages);
      res.setHeader('Content-Type', 'text/event-stream');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      for await (const chunk of result.toReadableStream()) {
        res.write(chunk);
      }
      res.end();
      return;
    }
    // If body has 'text', treat as single-message (simple reply)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (typeof body.text === 'string') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      const replyObj = await this.aiChatService.singleChat(body.text);
      res.json(replyObj);
      return;
    }
    // Invalid body
    res.status(400).json({ error: 'Invalid request body' });
  }
}
