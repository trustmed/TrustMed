import { Injectable, Logger } from '@nestjs/common';
import { MedicalRecord } from '../entities/medical-record.entity';

/**
 * Consent verification stub.
 *
 * Currently grants access only to the record owner (patient or uploader).
 * When Hyperledger Fabric is integrated, {@link verifyAccess} will query the
 * chaincode consent ledger to determine if the requester has been
 * explicitly granted time-limited access by the patient.
 */
@Injectable()
export class ConsentService {
  private readonly logger = new Logger(ConsentService.name);

  /**
   * Checks whether `requesterId` is allowed to access the given record.
   *
   * @param requesterId  The `AuthUser.id` UUID of the requesting user.
   * @param record       The medical record being accessed.
   * @returns `true` if access is permitted.
   */
  async verifyAccess(
    requesterId: string,
    record: MedicalRecord,
  ): Promise<boolean> {
    // Owner always has access (patient or uploader)
    if (record.patientId === requesterId || record.uploaderId === requesterId) {
      return true;
    }

    // TODO: Query Hyperledger Fabric chaincode for consent state.
    // The chaincode should:
    //   1. Look up ConsentRecord { patientId, granteeId, recordId, expiresAt }
    //   2. Verify that the consent has not expired
    //   3. Return true/false
    this.logger.warn(
      `Consent denied: requester=${requesterId}, record=${record.id} (Fabric not yet integrated)`,
    );

    return false;
  }
}
