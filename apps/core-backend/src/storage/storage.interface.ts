export interface StorageUploadResult {
  message: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export interface StorageViewInput {
  fileName: string;
  nestedDirectories: string[];
}

export interface StorageViewResult {
  fileName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
}

export interface StorageFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface StorageUploadInput {
  file: StorageFile;
  customFileName: string;
  nestedDirectories: string[];
}

export interface Storage {
  upload(input: StorageUploadInput): StorageUploadResult;
  view(input: StorageViewInput): StorageViewResult;
}
