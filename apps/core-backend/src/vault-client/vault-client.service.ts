import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs';

interface UploadFileRequest {
  content: Uint8Array;
  file_name: string;
  mime_type: string;
  patient_id: string;
  uploader_id: string;
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

interface VaultService {
  uploadFile(data: UploadFileRequest): Observable<UploadFileResponse>;
  downloadFile(data: DownloadFileRequest): Observable<DownloadFileResponse>;
  deleteFile(data: DeleteFileRequest): Observable<DeleteFileResponse>;
}

@Injectable()
export class VaultClientService implements OnModuleInit {
  private vaultService: VaultService;

  constructor(@Inject('VAULT_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.vaultService = this.client.getService<VaultService>('VaultService');
  }

  async uploadFile(
    content: Buffer,
    fileName: string,
    mimeType: string,
    patientId: string,
    uploaderId: string,
  ): Promise<UploadFileResponse> {
    return lastValueFrom(
      this.vaultService.uploadFile({
        content: new Uint8Array(content),
        file_name: fileName,
        mime_type: mimeType,
        patient_id: patientId,
        uploader_id: uploaderId,
      }),
    );
  }

  async downloadFile(
    objectKey: string,
    encryptedAesKey: string,
  ): Promise<Buffer> {
    const response = await lastValueFrom(
      this.vaultService.downloadFile({
        object_key: objectKey,
        encrypted_aes_key: encryptedAesKey,
      }),
    );
    return Buffer.from(response.content);
  }

  async deleteFile(objectKey: string): Promise<boolean> {
    const response = await lastValueFrom(
      this.vaultService.deleteFile({
        object_key: objectKey,
      }),
    );
    return response.success;
  }
}
