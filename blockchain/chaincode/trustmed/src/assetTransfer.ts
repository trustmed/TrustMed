import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';

type ConsentStatus = 'REQUESTED' | 'GRANTED' | 'REVOKED';

interface Consent {
  consentId: string;
  patientId: string;
  hospitalId: string;
  insurerId: string;
  purpose: string;
  status: ConsentStatus;
  createdAt: string;
  grantedAt?: string;
}

@Info({ title: 'TrustMedContract', description: 'TrustMed consent smart contract' })
export class TrustMedContract extends Contract {
  @Transaction()
  public async CreateConsentRequest(
    ctx: Context,
    consentId: string,
    patientId: string,
    hospitalId: string,
    insurerId: string,
    purpose: string
  ): Promise<void> {
    const exists = await this.AssetExists(ctx, consentId);
    if (exists) {
      throw new Error(`Consent ${consentId} already exists`);
    }

    const consent: Consent = {
      consentId,
      patientId,
      hospitalId,
      insurerId,
      purpose,
      status: 'REQUESTED',
      createdAt: new Date().toISOString(),
    };

    await ctx.stub.putState(consentId, Buffer.from(JSON.stringify(consent)));
  }

  @Transaction()
  public async GrantConsent(ctx: Context, consentId: string): Promise<void> {
    const data = await ctx.stub.getState(consentId);
    if (!data || data.length === 0) {
      throw new Error(`Consent ${consentId} does not exist`);
    }

    const consent = JSON.parse(data.toString()) as Consent;
    consent.status = 'GRANTED';
    consent.grantedAt = new Date().toISOString();

    await ctx.stub.putState(consentId, Buffer.from(JSON.stringify(consent)));
  }

  @Transaction(false)
  @Returns('string')
  public async VerifyConsent(ctx: Context, consentId: string): Promise<string> {
    const data = await ctx.stub.getState(consentId);
    if (!data || data.length === 0) {
      throw new Error(`Consent ${consentId} does not exist`);
    }

    const consent = JSON.parse(data.toString()) as Consent;

    return JSON.stringify({
      consentId: consent.consentId,
      patientId: consent.patientId,
      hospitalId: consent.hospitalId,
      insurerId: consent.insurerId,
      purpose: consent.purpose,
      status: consent.status,
      granted: consent.status === 'GRANTED',
      createdAt: consent.createdAt,
      grantedAt: consent.grantedAt ?? null
    });
  }

  @Transaction(false)
  @Returns('boolean')
  public async AssetExists(ctx: Context, consentId: string): Promise<boolean> {
    const data = await ctx.stub.getState(consentId);
    return !!data && data.length > 0;
  }

  @Transaction(false)
  @Returns('string')
  public async ReadConsent(ctx: Context, consentId: string): Promise<string> {
    const data = await ctx.stub.getState(consentId);
    if (!data || data.length === 0) {
      throw new Error(`Consent ${consentId} does not exist`);
    }

    return data.toString();
  }
}
