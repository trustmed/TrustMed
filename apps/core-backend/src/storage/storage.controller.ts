import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Query,
  Res,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '../auth/public.decorator';
import { StorageService } from './storage.service';

@ApiTags('storage')
@Controller('storage')
@Public()
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  private parseNestedDirectories(
    nestedDirectories: string | string[] | undefined,
  ): string[] {
    if (Array.isArray(nestedDirectories)) {
      return nestedDirectories.map((segment) => segment.trim()).filter(Boolean);
    }

    if (typeof nestedDirectories === 'string') {
      return nestedDirectories
        .split(',')
        .map((segment) => segment.trim())
        .filter(Boolean);
    }

    return [];
  }

  @Post('save-file')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Save file to storage endpoint' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        customFileName: {
          type: 'string',
          example: 'example',
        },
        nestedDirectories: {
          type: 'array',
          items: { type: 'string' },
          example: ['medical-records', 'uploads'],
        },
      },
      required: ['file', 'customFileName', 'nestedDirectories'],
    },
  })
  saveFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('customFileName') customFileName: string,
    @Body('nestedDirectories') nestedDirectories: string[],
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (typeof customFileName !== 'string' || !customFileName.trim()) {
      throw new BadRequestException('customFileName is required');
    }

    const hasValidArrayNestedDirectories =
      Array.isArray(nestedDirectories) && nestedDirectories.length > 0;

    if (!hasValidArrayNestedDirectories) {
      throw new BadRequestException('nestedDirectories is required');
    }

    return this.storageService.upload({
      file,
      customFileName,
      nestedDirectories,
    });
  }

  @Get('view-file')
  @ApiOperation({ summary: 'View a file from local storage' })
  viewFile(
    @Query('fileName') fileName: string,
    @Query('nestedDirectories') nestedDirectories: string | string[],
    @Res() res: Response,
  ): void {
    if (typeof fileName !== 'string' || !fileName.trim()) {
      throw new BadRequestException('fileName is required');
    }

    const parsedNestedDirectories =
      this.parseNestedDirectories(nestedDirectories);

    if (parsedNestedDirectories.length === 0) {
      throw new BadRequestException('nestedDirectories is required');
    }

    const viewedFile = this.storageService.view({
      fileName,
      nestedDirectories: parsedNestedDirectories,
    });
    const { buffer, mimeType, fileName: resolvedFileName } = viewedFile;

    res.setHeader('Content-Type', mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${resolvedFileName.replace(/["\\]/g, '_')}"`,
    );
    res.setHeader('Content-Length', buffer.length.toString());
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.send(buffer);
  }
}
