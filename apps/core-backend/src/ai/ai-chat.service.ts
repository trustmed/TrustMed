import { Injectable } from '@nestjs/common';
import { streamText, convertToModelMessages, UIMessage } from 'ai';

@Injectable()
export class AiChatService {
  async streamChat(messages: UIMessage[]): Promise<any> {
    // Handles multi-message (streaming) chat
    return streamText({
      model: 'anthropic/claude-sonnet-4.5',
      system: 'You are a helpful assistant.',
      messages: await convertToModelMessages(messages),
    });
  }

  async singleChat(text: string) {
    // Handles single-message chat
    const result = streamText({
      model: 'anthropic/claude-sonnet-4.5',
      system: 'You are a helpful assistant.',
      messages: [{ role: 'user', content: text }],
    });
    const reply = await result.text;
    return { reply, status: 'success' };
  }
}
