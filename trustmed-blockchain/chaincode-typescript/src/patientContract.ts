import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';

@Info({title: 'PatientContract', description: 'Smart contract for TrustMed patient records'})
export class PatientContract extends Contract {

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        console.log('TrustMed Ledger Initialized Successfully');
    }

    // Create a new patient record
    @Transaction()
    public async CreatePatient(ctx: Context, id: string, name: string, bloodType: string, diagnosis: string): Promise<void> {
        const exists = await this.PatientExists(ctx, id);
        if (exists) {
            throw new Error(`The patient ${id} already exists`);
        }

        const patient = {
            id,
            name,
            bloodType,
            diagnosis,
            docType: 'patient', // Used for CouchDB rich queries later
        };

        // Convert the JSON object to a Buffer and put it on the blockchain
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(patient)));
    }

    // Read an existing patient record
    @Transaction(false)
    @Returns('string')
    public async ReadPatient(ctx: Context, id: string): Promise<string> {
        const patientJSON = await ctx.stub.getState(id);
        if (!patientJSON || patientJSON.length === 0) {
            throw new Error(`The patient ${id} does not exist`);
        }
        return patientJSON.toString();
    }

    // Helper function to check existence
    @Transaction(false)
    @Returns('boolean')
    public async PatientExists(ctx: Context, id: string): Promise<boolean> {
        const patientJSON = await ctx.stub.getState(id);
        return patientJSON && patientJSON.length > 0;
    }
}
