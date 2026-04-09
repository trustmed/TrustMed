export interface Encryption {
  seal(plainKey: Buffer): string;

  unseal(sealedKey: string): Buffer;
}
