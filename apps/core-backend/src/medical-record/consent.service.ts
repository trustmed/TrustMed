import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { MedicalRecord } from '../entities/medical-record.entity';
import { Person } from '../entities/person.entity';
import {
  ConsentRequest,
  ConsentRequestStatus,
} from '../entities/consent-request.entity';

@Injectable()
export class ConsentService {
  private readonly logger = new Logger(ConsentService.name);

  constructor(
    @InjectRepository(ConsentRequest)
    private readonly consentRequestRepo: Repository<ConsentRequest>,
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordRepo: Repository<MedicalRecord>,
    @InjectRepository(Person)
    private readonly personRepo: Repository<Person>,
  ) {}

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

    // Check if there is an ACCEPTED consent request that hasn't expired
    const activeConsent = await this.consentRequestRepo.findOne({
      where: {
        recordId: record.id,
        requesterId: requesterId,
        status: ConsentRequestStatus.ACCEPTED,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (activeConsent) {
      return true;
    }

    this.logger.warn(
      `Consent denied or expired: requester=${requesterId}, record=${record.id}`,
    );

    return false;
  }

  async getRequestByRecordAndRequester(
    requesterId: string,
    recordId: string,
  ): Promise<ConsentRequest | null> {
    return this.consentRequestRepo.findOne({
      where: { recordId, requesterId },
      order: { createdAt: 'DESC' },
    });
  }

  async requestAccess(
    requesterId: string,
    recordId: string,
  ): Promise<ConsentRequest> {
    const record = await this.medicalRecordRepo.findOne({
      where: { id: recordId },
      relations: ['person'],
    });
    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    let authUserId = record.person?.authUserId;
    if (!authUserId) {
      // Fallback lookup if relation wasn't loaded properly
      const person = await this.personRepo.findOne({
        where: { id: record.patientId },
      });
      if (!person || !person.authUserId) {
        throw new NotFoundException('Patient authorization profile not found');
      }
      authUserId = person.authUserId;
    }

    // Don't create duplicate pending requests
    const existingPending = await this.consentRequestRepo.findOne({
      where: {
        recordId,
        requesterId,
        status: ConsentRequestStatus.PENDING,
      },
    });

    if (existingPending) {
      return existingPending;
    }

    const consentRequest = this.consentRequestRepo.create({
      requesterId,
      patientId: authUserId, // Store the AuthUser ID to satisfy the FK constraint
      recordId,
      status: ConsentRequestStatus.PENDING,
    });

    return this.consentRequestRepo.save(consentRequest);
  }

  async getReceivedRequests(patientId: string): Promise<ConsentRequest[]> {
    return this.consentRequestRepo.find({
      where: { patientId },
      relations: ['requester', 'record'],
      order: { createdAt: 'DESC' },
    });
  }

  async getSentRequests(requesterId: string): Promise<ConsentRequest[]> {
    return this.consentRequestRepo.find({
      where: { requesterId },
      relations: ['patient', 'record'],
      order: { createdAt: 'DESC' },
    });
  }

  private parseDuration(duration: string): number {
    const value = parseInt(duration.slice(0, -1), 10);
    const unit = duration.slice(-1);

    if (isNaN(value)) {
      throw new BadRequestException('Invalid duration format');
    }

    switch (unit) {
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      default:
        throw new BadRequestException('Unsupported duration unit');
    }
  }

  async acceptRequest(
    requestId: string,
    patientId: string,
    duration: string,
  ): Promise<ConsentRequest> {
    const request = await this.consentRequestRepo.findOne({
      where: { id: requestId },
    });
    if (!request) {
      throw new NotFoundException('Consent request not found');
    }

    if (request.patientId !== patientId) {
      throw new ForbiddenException('Not authorized to accept this request');
    }

    const durationMs = this.parseDuration(duration);

    request.status = ConsentRequestStatus.ACCEPTED;
    request.expiresAt = new Date(Date.now() + durationMs);

    return this.consentRequestRepo.save(request);
  }

  async rejectRequest(
    requestId: string,
    patientId: string,
  ): Promise<ConsentRequest> {
    const request = await this.consentRequestRepo.findOne({
      where: { id: requestId },
    });
    if (!request) {
      throw new NotFoundException('Consent request not found');
    }

    if (request.patientId !== patientId) {
      throw new ForbiddenException('Not authorized to reject this request');
    }

    request.status = ConsentRequestStatus.REJECTED;

    return this.consentRequestRepo.save(request);
  }
}
