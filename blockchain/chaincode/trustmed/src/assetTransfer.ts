import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';

type AccessRequestStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'REVOKED'
  | 'EXPIRED';

interface AccessRequest {
  requestId: string;
  patientId: string;
  doctorId: string;
  hospitalId: string;
  purpose: string;
  requestedAt: string;
  status: AccessRequestStatus;
  approvedAt?: string;
  rejectedAt?: string;
  revokedAt?: string;
  expiresAt?: string;
}

export interface BlockchainAuditLog {
  auditId: string;
  eventType: string;
  actorId: string;
  patientId?: string;
  targetResource?: string;
  ipAddress?: string;
  additionalData?: string;
  timestamp: string;
}

@Info({ title: 'TrustMedContract', description: 'TrustMed access request contract' })
export class TrustMedContract extends Contract {
  private getTxTimestampIsoString(ctx: Context): string {
    const ts = ctx.stub.getTxTimestamp();
    const millis =
      Number(ts.seconds.low ?? ts.seconds) * 1000 +
      Math.floor(ts.nanos / 1_000_000);

    return new Date(millis).toISOString();
  }

  @Transaction()
  public async CreateAccessRequest(
    ctx: Context,
    requestId: string,
    patientId: string,
    doctorId: string,
    hospitalId: string,
    purpose: string,
  ): Promise<void> {
    const exists = await this.AssetExists(ctx, requestId);
    if (exists) {
      throw new Error(`Access request ${requestId} already exists`);
    }

    const request: AccessRequest = {
      requestId,
      patientId,
      doctorId,
      hospitalId,
      purpose,
      requestedAt: this.getTxTimestampIsoString(ctx),
      status: 'REQUESTED',
    };

    await ctx.stub.putState(requestId, Buffer.from(JSON.stringify(request)));
  }

  @Transaction()
  public async ApproveAccessRequest(
    ctx: Context,
    requestId: string,
    expiresAt: string,
  ): Promise<void> {
    const request = await this.GetRequest(ctx, requestId);

    if (request.status !== 'REQUESTED') {
      throw new Error(
        `Only REQUESTED access requests can be approved. Current status: ${request.status}`,
      );
    }

    request.status = 'APPROVED';
    request.approvedAt = this.getTxTimestampIsoString(ctx);
    request.expiresAt = expiresAt;

    await ctx.stub.putState(requestId, Buffer.from(JSON.stringify(request)));
  }

  @Transaction()
  public async RejectAccessRequest(ctx: Context, requestId: string): Promise<void> {
    const request = await this.GetRequest(ctx, requestId);

    if (request.status !== 'REQUESTED') {
      throw new Error(
        `Only REQUESTED access requests can be rejected. Current status: ${request.status}`,
      );
    }

    request.status = 'REJECTED';
    request.rejectedAt = this.getTxTimestampIsoString(ctx);

    await ctx.stub.putState(requestId, Buffer.from(JSON.stringify(request)));
  }

  @Transaction()
  public async RevokeAccessRequest(ctx: Context, requestId: string): Promise<void> {
    const request = await this.GetRequest(ctx, requestId);

    if (request.status !== 'APPROVED') {
      throw new Error(
        `Only APPROVED access requests can be revoked. Current status: ${request.status}`,
      );
    }

    request.status = 'REVOKED';
    request.revokedAt = this.getTxTimestampIsoString(ctx);

    await ctx.stub.putState(requestId, Buffer.from(JSON.stringify(request)));
  }

  @Transaction(false)
  @Returns('string')
  public async ReadAccessRequest(ctx: Context, requestId: string): Promise<string> {
    const request = await this.GetRequest(ctx, requestId);
    return JSON.stringify(request);
  }

  @Transaction(false)
  @Returns('string')
  public async CheckAccess(ctx: Context, requestId: string): Promise<string> {
    const request = await this.GetRequest(ctx, requestId);

    let allowed = false;
    let reason = 'Access not approved';

    if (request.status === 'APPROVED') {
      if (request.expiresAt) {
        const now = new Date();
        const expiry = new Date(request.expiresAt);

        if (now <= expiry) {
          allowed = true;
          reason = 'Access approved and valid';
        } else {
          reason = 'Access approval expired';
        }
      } else {
        allowed = true;
        reason = 'Access approved';
      }
    } else if (request.status === 'REVOKED') {
      reason = 'Access was revoked';
    } else if (request.status === 'REJECTED') {
      reason = 'Access was rejected';
    }

    return JSON.stringify({
      requestId: request.requestId,
      patientId: request.patientId,
      doctorId: request.doctorId,
      hospitalId: request.hospitalId,
      status: request.status,
      allowed,
      reason,
      expiresAt: request.expiresAt ?? null,
    });
  }

  @Transaction(false)
  @Returns('boolean')
  public async AssetExists(ctx: Context, id: string): Promise<boolean> {
    const data = await ctx.stub.getState(id);
    return !!data && data.length > 0;
  }

  @Transaction()
  public async LogAuditEvent(
    ctx: Context,
    auditId: string,
    eventType: string,
    actorId: string,
    patientId: string,
    targetResource: string,
    ipAddress: string,
    additionalData: string,
  ): Promise<void> {
    const exists = await this.AssetExists(ctx, auditId);
    if (exists) {
      throw new Error(`Audit log ${auditId} already exists`);
    }

    const log: BlockchainAuditLog = {
      auditId,
      eventType,
      actorId,
      patientId: patientId || undefined,
      targetResource: targetResource || undefined,
      ipAddress: ipAddress || undefined,
      additionalData: additionalData || undefined,
      timestamp: this.getTxTimestampIsoString(ctx),
    };

    await ctx.stub.putState(auditId, Buffer.from(JSON.stringify(log)));
    
    if (patientId) {
       const indexName = 'patient~auditId';
       const indexKey = ctx.stub.createCompositeKey(indexName, [patientId, auditId]);
       await ctx.stub.putState(indexKey, Buffer.from('\u0000'));
    }
  }

  @Transaction(false)
  @Returns('string')
  public async GetAuditHistory(ctx: Context, patientId: string): Promise<string> {
    const results = [];
    const iterator = await ctx.stub.getStateByPartialCompositeKey('patient~auditId', [patientId]);
    
    let result = await iterator.next();
    while (!result.done) {
      const { value } = result;
      if (value && value.key) {
        const keyParts = ctx.stub.splitCompositeKey(value.key);
        const auditId = keyParts.attributes[1];
        
        const logBytes = await ctx.stub.getState(auditId);
        if (logBytes && logBytes.length > 0) {
          results.push(JSON.parse(logBytes.toString()));
        }
      }
      result = await iterator.next();
    }
    
    await iterator.close();
    return JSON.stringify(results);
  }

  private async GetRequest(ctx: Context, requestId: string): Promise<AccessRequest> {
    const data = await ctx.stub.getState(requestId);

    if (!data || data.length === 0) {
      throw new Error(`Access request ${requestId} does not exist`);
    }

    return JSON.parse(data.toString()) as AccessRequest;
  }
}