import { BulkEncryptService } from "../../abstractions/bulk-encrypt.service";
import { EncryptService } from "../../abstractions/encrypt.service";
import { Decryptable } from "../../interfaces/decryptable.interface";
import { InitializerMetadata } from "../../interfaces/initializer-metadata.interface";
import { SymmetricCryptoKey } from "../../models/domain/symmetric-crypto-key";

/**
 * @deprecated For the feature flag from PM-4154, remove once feature is rolled out
 */
export class FallbackBulkEncryptServiceImplementation implements BulkEncryptService {
  constructor(protected encryptService: EncryptService) {}

  /**
   * Decrypts items using a web worker if the environment supports it.
   * Will fall back to the main thread if the window object is not available.
   */
  async decryptItems<T extends InitializerMetadata>(
    items: Decryptable<T>[],
    key: SymmetricCryptoKey,
  ): Promise<T[]> {
    return await this.encryptService.decryptItems(items, key);
  }
}
