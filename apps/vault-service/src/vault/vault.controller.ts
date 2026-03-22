import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { VaultService } from './vault.service';

interface UploadMetadata {
  category?: string;
  notes?: string;
  doctor_name?: string;
  hospital_name?: string;
  record_date?: string;
}

interface UploadFileRequest {
  content: Uint8Array;
  file_name: string;
  mime_type: string;
  patient_id: string;
  uploader_id: string;
  metadata?: UploadMetadata;
}

interface UploadFileResponse {
  object_key: string;
  s3_uri: string;
  document_hash: string;
  encrypted_aes_key: string;
}

interface DownloadFileRequest {
  object_key: string;
  encrypted_aes_key: string;
}

interface DownloadFileResponse {
  content: Uint8Array;
}

interface DeleteFileRequest {
  object_key: string;
}

interface DeleteFileResponse {
  success: boolean;
}

@Controller()
export class VaultController {
  private readonly logger = new Logger(VaultController.name);

  constructor(private readonly vaultService: VaultService) { }

  @GrpcMethod('VaultService', 'UploadFile')
  async uploadFile(data: UploadFileRequest): Promise<UploadFileResponse> {
    try {
      const result = await this.vaultService.uploadEncryptedFile(
        Buffer.from(data.content),
        data.file_name,
      );
      return {
        object_key: result.objectKey,
        s3_uri: result.s3Uri,
        document_hash: result.documentHash,
        encrypted_aes_key: result.sealedAesKey,
      };
    } catch (err) {
      this.logger.error('Failed to upload file to vault', err);
      throw err;
    }
  }

  @GrpcMethod('VaultService', 'DownloadFile')
  async downloadFile(data: DownloadFileRequest): Promise<DownloadFileResponse> {
    try {
      const content = await this.vaultService.downloadAndDecryptFile(
        data.object_key,
        data.encrypted_aes_key,
      );
      return {
        content: new Uint8Array(content),
      };
    } catch (err) {
      this.logger.error('Failed to download file from vault', err);
      throw err;
    }
  }

  @GrpcMethod('VaultService', 'DeleteFile')
  async deleteFile(data: DeleteFileRequest): Promise<DeleteFileResponse> {
    await this.vaultService.deleteFile(data.object_key);
    return {
      success: true,
    };
  }
}
