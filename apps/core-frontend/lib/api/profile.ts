import {
    CoreIdentityValues,
    EmergencyContactValues,
    AllergyValues,
    MedicationValues,
    InsuranceValues,
} from "@/lib/schemas/profile";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const jsonHeaders = { "Content-Type": "application/json" };

export const ProfileApi = {
    getProfileByEmail: async (email: string) => {
        const response = await fetch(`${API_URL}/profile/email/${email}`, {
            method: "GET",
            headers: jsonHeaders,
        });
        if (!response.ok) throw new Error("Failed to fetch profile");
        return response.json();
    },

    updatePersonalDetails: async (
        personId: string,
        data: Partial<CoreIdentityValues> & {
            name?: string;
            email?: string;
            phone?: string;
            addressLine1?: string;
            addressLine2?: string;
            city?: string;
            zipCode?: string;
        },
    ) => {
        const response = await fetch(`${API_URL}/profile/${personId}/personal`, {
            method: "PATCH",
            headers: jsonHeaders,
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to update personal details");
        return response.json();
    },

    updateMedicalProfile: async (personId: string, data: {
        biologicalSex?: string;
        bloodType?: string;
        heightCm?: number;
        weightKg?: number;
        dob?: string;
        insuranceProvider?: string;
        insurancePolicyNo?: string;
        insuranceGroupNo?: string;
    }) => {
        const response = await fetch(`${API_URL}/profile/${personId}/medical`, {
            method: "PATCH",
            headers: jsonHeaders,
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to update medical profile");
        return response.json();
    },

    updateInsurance: async (personId: string, data: InsuranceValues) => {
        const response = await fetch(`${API_URL}/profile/${personId}/medical`, {
            method: "PATCH",
            headers: jsonHeaders,
            body: JSON.stringify({
                insuranceProvider: data.provider,
                insurancePolicyNo: data.policyNumber,
                insuranceGroupNo: data.groupNumber,
            }),
        });
        if (!response.ok) throw new Error("Failed to update insurance");
        return response.json();
    },

    // ── Emergency Contacts ──────────────────────────────────────────────────
    addEmergencyContact: async (personId: string, data: EmergencyContactValues) => {
        const response = await fetch(`${API_URL}/profile/${personId}/contacts`, {
            method: "POST",
            headers: jsonHeaders,
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to add emergency contact");
        return response.json();
    },

    deleteEmergencyContact: async (id: string) => {
        const response = await fetch(`${API_URL}/profile/contacts/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete emergency contact");
    },

    // ── Allergies ───────────────────────────────────────────────────────────
    addAllergy: async (personId: string, data: AllergyValues) => {
        const response = await fetch(`${API_URL}/profile/${personId}/allergies`, {
            method: "POST",
            headers: jsonHeaders,
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to add allergy");
        return response.json();
    },

    deleteAllergy: async (id: string) => {
        const response = await fetch(`${API_URL}/profile/allergies/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete allergy");
    },

    // ── Medications ─────────────────────────────────────────────────────────
    addMedication: async (personId: string, data: MedicationValues) => {
        const response = await fetch(`${API_URL}/profile/${personId}/medications`, {
            method: "POST",
            headers: jsonHeaders,
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to add medication");
        return response.json();
    },

    deleteMedication: async (id: string) => {
        const response = await fetch(`${API_URL}/profile/medications/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete medication");
    },
};
