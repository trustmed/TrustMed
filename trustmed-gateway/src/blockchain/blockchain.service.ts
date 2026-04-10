import { Injectable, OnModuleDestroy } from "@nestjs/common";
import * as grpc from "@grpc/grpc-js";
import {
  connect,
  Contract,
  Gateway,
  Identity,
  Network,
  Signer,
  signers,
  GatewayError,
} from "@hyperledger/fabric-gateway";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { createPrivateKey, KeyObject } from "node:crypto";
import { FABRIC } from "./blockchain.constants";

type CheckAccessResult = {
  requestId: string;
  patientId: string;
  doctorId: string;
  hospitalId: string;
  status: "REQUESTED" | "APPROVED" | "REJECTED" | "REVOKED" | "EXPIRED";
  allowed: boolean;
  reason: string;
  expiresAt: string | null;
};

type AccessRequestStatus =
  | "REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "REVOKED"
  | "EXPIRED";

type ReadAccessRequestResult = {
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
};

@Injectable()
export class BlockchainService implements OnModuleDestroy {
  private client?: grpc.Client;
  private gateway?: Gateway;
  private network?: Network;
  private contract?: Contract;

  // Close the connection when the module is destroyed
  async onModuleDestroy(): Promise<void> {
    this.gateway?.close();
    this.client?.close();
  }

  // Establish a gRPC connection 
  private async newGrpcConnection(): Promise<grpc.Client> {
    const tlsRootCert = await fs.readFile(FABRIC.tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);

    return new grpc.Client(FABRIC.peerEndpoint, tlsCredentials, {
      "grpc.ssl_target_name_override": FABRIC.peerHostAlias,
    });
  }

  // Get the user identity
  private async newIdentity(): Promise<Identity> {
    const credentials = await fs.readFile(FABRIC.certPath);
    return { mspId: FABRIC.mspId, credentials };
  }

  // Get the private key to sign a transaction
  // Sign the transaction with a priviate key to ensure the transaction is authentic
  private async newSigner(): Promise<Signer> {
    try {
      // Check if the directory exists first
      const files = await fs.readdir(FABRIC.keyDirPath);

      // Filter for the key file
      const keyFile = files.find((f) => f.endsWith("_sk") || f === "priv_sk");

      if (!keyFile) {
        throw new Error(
          `No private key file found in ${FABRIC.keyDirPath}. Files present: ${files.length > 0 ? files.join(", ") : "None"}`,
        );
      }

      const keyPath = path.join(FABRIC.keyDirPath, keyFile);
      const privateKeyPem = await fs.readFile(keyPath);
      const privateKey: KeyObject = createPrivateKey(privateKeyPem);

      return signers.newPrivateKeySigner(privateKey);
    } catch (error) {
      console.error(`[Fabric Service] newSigner error: ${error.message}`);
      throw error;
    }
  }

  // bundle gRPC connection,identity and signer into a session to access the blockchain
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

  // Create the access request (submits a transaction)
  async createAccessRequest(input: {
    requestId: string;
    patientId: string;
    doctorId: string;
    hospitalId: string;
    purpose: string;
  }) {
    const contract = await this.getContract();

    await contract.submitTransaction(
      "CreateAccessRequest",
      input.requestId,
      input.patientId,
      input.doctorId,
      input.hospitalId,
      input.purpose,
    );

    return {
      ok: true,
      message: "Access request created",
      requestId: input.requestId,
    };
  }

  async approveAccessRequest(requestId: string, expiresAt: string) {
    const contract = await this.getContract();

    await contract.submitTransaction(
      "ApproveAccessRequest",
      requestId,
      expiresAt,
    );

    return {
      ok: true,
      message: "Access request approved",
      requestId,
      expiresAt,
    };
  }

  async logAuditEvent(input: {
    auditId: string;
    eventType: string;
    actorId: string;
    patientId?: string;
    targetResource?: string;
    ipAddress?: string;
    additionalData?: string;
  }) {
    const contract = await this.getContract();

    await contract.submitTransaction(
      "LogAuditEvent",
      input.auditId,
      input.eventType,
      input.actorId,
      input.patientId || "",
      input.targetResource || "",
      input.ipAddress || "",
      input.additionalData || "",
    );

    return {
      ok: true,
      message: "Audit event logged",
      auditId: input.auditId,
    };
  }

  // Get the audit history (queries a transaction)
  async getAuditHistory(patientId: string): Promise<any[]> {
    const contract = await this.getContract();
    const result = await contract.evaluateTransaction(
      "GetAuditHistory",
      patientId,
    );
    const json = Buffer.from(result).toString("utf8");
    return JSON.parse(json);
  }

  async checkAccess(requestId: string): Promise<CheckAccessResult> {
    const contract = await this.getContract();
    const result = await contract.evaluateTransaction("CheckAccess", requestId);
    const json = Buffer.from(result).toString("utf8");
    return JSON.parse(json) as CheckAccessResult;
  }

  async readAccessRequest(requestId: string): Promise<ReadAccessRequestResult> {
    try {
      const contract = await this.getContract();
      const result = await contract.evaluateTransaction(
        "ReadAccessRequest",
        requestId,
      );

      const json = Buffer.from(result).toString("utf8");

      const parsed = JSON.parse(json) as ReadAccessRequestResult;
      return parsed;
    } catch (error) {
      console.error("Fabric readAccessRequest failed:", error);
      throw error;
    }
  }

  // Communicate wit the blockchain and check the system status
  async checkHealth(): Promise<{ status: string; gateway: any; network: any }> {
    const health = {
      status: "OK",
      gateway: {
        status: "UP",
        mspId: FABRIC.mspId,
        timestamp: new Date().toISOString(),
      },
      network: {
        status: "DOWN",
        channel: FABRIC.channelName,
        chaincode: FABRIC.chaincodeName,
      },
    };

    try {
      const contract = await this.getContract();

      // ping to verify the gRPC pipe and Chaincode availability
      await contract.evaluateTransaction("AssetExists", "health-check-ping");

      // if reached here, network is UP
      health.network.status = "UP";

    } catch (error: any) {

      const isNetworkIssue =
        error.code === grpc.status.UNAVAILABLE ||
        error.code === grpc.status.DEADLINE_EXCEEDED;

      const isConfigIssue = error.code === "ENOENT" || error.code === "EACCES";
      const isFabricLogicIssue = error instanceof GatewayError;

      if (isConfigIssue) {
        health.status = "ERROR";
        health.gateway.status = "DOWN";
        health.gateway["details"] =
          `FILESYSTEM_FAILURE: ${error.path || "Check paths"}`;
      } else if (isNetworkIssue) {
        health.status = "DEGRADED";
        health.network.status = "DOWN";
        health.network["details"] =
          "PEER_UNREACHABLE (Check Cloud Provider VCN/Security Lists)";
      } else if (isFabricLogicIssue) {
        health.status = "DEGRADED";
        health.network.status = "DOWN";
        health.network["details"] =
          `FABRIC_REJECTED: ${error.details[0]?.message || error.message}`;
      } else {
        health.status = "ERROR";
        health.gateway.status = "DOWN";
        health.gateway["details"] = `INTERNAL_CRASH: ${error.message}`;
      }
    }

    return health;
  }
}
