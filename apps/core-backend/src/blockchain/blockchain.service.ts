import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as grpc from '@grpc/grpc-js';
import {
  connect,
  Contract,
  Gateway,
  Identity,
  Network,
  Signer,
  signers,
} from '@hyperledger/fabric-gateway';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createPrivateKey, KeyObject } from 'node:crypto';
import { FABRIC } from './blockchain.constants';

type CheckAccessResult = {
  requestId: string;
  patientId: string;
  doctorId: string;
  hospitalId: string;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'REVOKED' | 'EXPIRED';
  allowed: boolean;
  reason: string;
  expiresAt: string | null;
};

@Injectable()
export class BlockchainService implements OnModuleDestroy {
  private client?: grpc.Client;
  private gateway?: Gateway;
  private network?: Network;
  private contract?: Contract;

  async onModuleDestroy(): Promise<void> {
    this.gateway?.close();
    this.client?.close();
  }

  private async newGrpcConnection(): Promise<grpc.Client> {
    const tlsRootCert = await fs.readFile(FABRIC.tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);

    return new grpc.Client(FABRIC.peerEndpoint, tlsCredentials, {
      'grpc.ssl_target_name_override': FABRIC.peerHostAlias,
    });
  }

  private async newIdentity(): Promise<Identity> {
    const credentials = await fs.readFile(FABRIC.certPath);
    return { mspId: FABRIC.mspId, credentials };
  }

  private async newSigner(): Promise<Signer> {
    const files = await fs.readdir(FABRIC.keyDirPath);
    if (!files.length) {
      throw new Error('No private key found in Fabric keystore');
    }

    const keyPath = path.join(FABRIC.keyDirPath, files[0]);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey: KeyObject = createPrivateKey(privateKeyPem);

    return signers.newPrivateKeySigner(privateKey);
  }

  private async getContract(): Promise<Contract> {
    if (this.contract) return this.contract;

    this.client = await this.newGrpcConnection();
    const identity = await this.newIdentity();
    const signer = await this.newSigner();

    this.gateway = connect({
      client: this.client,
      identity,
      signer,
    });

    this.network = this.gateway.getNetwork(FABRIC.channelName);
    this.contract = this.network.getContract(FABRIC.chaincodeName);

    return this.contract;
  }

  async createAccessRequest(input: {
    requestId: string;
    patientId: string;
    doctorId: string;
    hospitalId: string;
    purpose: string;
  }) {
    const contract = await this.getContract();

    await contract.submitTransaction(
      'CreateAccessRequest',
      input.requestId,
      input.patientId,
      input.doctorId,
      input.hospitalId,
      input.purpose,
    );

    return {
      ok: true,
      message: 'Access request created',
      requestId: input.requestId,
    };
  }

  async approveAccessRequest(requestId: string, expiresAt: string) {
    const contract = await this.getContract();

    await contract.submitTransaction(
      'ApproveAccessRequest',
      requestId,
      expiresAt,
    );

    return {
      ok: true,
      message: 'Access request approved',
      requestId,
      expiresAt,
    };
  }

  async checkAccess(requestId: string): Promise<CheckAccessResult> {
    const contract = await this.getContract();
    const result = await contract.evaluateTransaction('CheckAccess', requestId);
    return JSON.parse(result.toString()) as CheckAccessResult;
  }
}
