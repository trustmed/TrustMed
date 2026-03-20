// src/patientContract.ts
import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';

// Define the structure of our Patient data
export class Patient {
    public docType?: string;
    public ID: string;
    public Name: string;
    public Diagnosis: string;
    public AccessGrantedTo: string[]; // e.g., ['InsuranceMSP', 'Hospital2MSP']
}

@Info({title: 'PatientContract', description: 'Smart contract for TrustMed patient data'})
export class PatientContract extends Contract {

    // 1. Initialize the Ledger with some dummy data (optional but good for testing)
    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const patients: Patient[] = [
            {
                ID: 'patient1',
                Name: 'John Doe',
                Diagnosis: 'Hypertension',
                AccessGrantedTo: ['Hospital1MSP'],
                docType: 'patient'
            }
        ];

        for (const patient of patients) {
            patient.docType = 'patient';
            // Buffer.from converts our JSON object into bytes, which is what Fabric stores
            await ctx.stub.putState(patient.ID, Buffer.from(JSON.stringify(patient)));
            console.info(`Patient ${patient.ID} initialized`);
        }
    }

    // 2. Create a new Patient Record
    @Transaction()
    public async CreatePatient(ctx: Context, id: string, name: string, diagnosis: string): Promise<void> {
        const exists = await this.PatientExists(ctx, id);
        if (exists) {
            throw new Error(`The patient ${id} already exists`);
        }

        const clientMSPID = ctx.clientIdentity.getMSPID();

        const patient: Patient = {
            ID: id,
            Name: name,
            Diagnosis: diagnosis,
            // The organization that creates the record gets access by default
            AccessGrantedTo: [clientMSPID],
            docType: 'patient',
        };

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(patient)));
    }

    // 3. Read a Patient Record
    @Transaction(false)
    @Returns('string')
    public async ReadPatient(ctx: Context, id: string): Promise<string> {
        const patientJSON = await ctx.stub.getState(id);
        if (!patientJSON || patientJSON.length === 0) {
            throw new Error(`The patient ${id} does not exist`);
        }
        return patientJSON.toString();
    }

    // Helper function to check if a record exists
    @Transaction(false)
    @Returns('boolean')
    public async PatientExists(ctx: Context, id: string): Promise<boolean> {
        const patientJSON = await ctx.stub.getState(id);
        return patientJSON && patientJSON.length > 0;
    }
}