export interface StorageUploadResult {
  message: string;
  fileName: string;
  mimeType: string;
  size: number;
  documentHash?: string;
  encryptedAesKey?: string;
  storageUri?: string;
}

export interface StorageViewInput {
  fileName: string;
  nestedDirectories: string[];
  encryptedAesKey?: string;
  storageUri?: string;
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
  encrypt?: boolean;
}

export interface StorageDeleteInput {
  nestedDirectories: string[];
  fileName: string;
  /** Direct storage URI override (for files stored via vault pattern). */
  storageUri?: string;
}

export interface Storage {
  upload(input: StorageUploadInput): Promise<StorageUploadResult>;
  view(input: StorageViewInput): Promise<StorageViewResult>;
  delete(input: StorageDeleteInput): Promise<void>;
}
