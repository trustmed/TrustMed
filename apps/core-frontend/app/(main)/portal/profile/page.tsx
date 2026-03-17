"use client";

import { useState, useEffect } from "react";
import { ProgressRing } from "@/components/profile/ProgressRing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Loader2 } from "lucide-react";
import { CoreIdentityForm } from "@/components/profile/forms/CoreIdentityForm";
import { EmergencyContactsForm } from "@/components/profile/forms/EmergencyContactsForm";
import { MedicalHistoryForm } from "@/components/profile/forms/MedicalHistoryForm";
import { InsuranceForm } from "@/components/profile/forms/InsuranceForm";
import { cn } from "@/lib/utils";
import { User, HeartPulse, ShieldAlert, FileText } from "lucide-react";
import { ProfileApi } from "@/lib/api/profile";
import { CoreIdentityValues, EmergencyContactValues, AllergyValues, MedicationValues, InsuranceValues } from "@/lib/schemas/profile";
import { format } from "date-fns";

const SECTIONS = [
    { id: "identity", label: "Personal & Physical", icon: User, description: "Baseline data for your health profile." },
    { id: "emergency", label: "Emergency Info", icon: ShieldAlert, description: "Contacts accessible in case of emergency." },
    { id: "medical", label: "Medical History", icon: HeartPulse, description: "Allergies, medications, and conditions." },
    { id: "insurance", label: "Insurance", icon: FileText, description: "Provider and policy details." },
];

// Track which sections have meaningful data for the progress ring
function computeProgress(sections: Record<string, boolean>) {
    const filled = Object.values(sections).filter(Boolean).length;
    return Math.round((filled / Object.keys(sections).length) * 100);
}

export default function ProfilePage() {
    const [activeSection, setActiveSection] = useState("identity");
    const [personId, setPersonId] = useState<string | null>(null);

    // Per-section data
    const [personalData, setPersonalData] = useState<Partial<CoreIdentityValues> | undefined>(undefined);
    const [emergencyData, setEmergencyData] = useState<(EmergencyContactValues & { id?: string })[]>([]);
    const [medicalData, setMedicalData] = useState<{ allergies: (AllergyValues & { id?: string })[]; medications: (MedicationValues & { id?: string })[] }>({ allergies: [], medications: [] });
    const [insuranceData, setInsuranceData] = useState<Partial<InsuranceValues> | undefined>(undefined);

    // Which sections are "done" for the progress ring
    const [sectionsDone, setSectionsDone] = useState({
        identity: false,
        emergency: false,
        medical: false,
        insurance: false,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedMsg, setSavedMsg] = useState("");
    const [hasChanges, setHasChanges] = useState(false);

    // ── Fetch profile ────────────────────────────────────────────────────────
    useEffect(() => {
        async function fetchProfile() {
            try {
                // /api/profile/me uses the JWT cookie to resolve the logged-in user
                const data = await ProfileApi.getMyProfile();
                setPersonId(data.id);

                // firstName and lastName come from the joined authUser relation
                const firstName: string = data.authUser?.firstName ?? "";
                const lastName: string | undefined = data.authUser?.lastName ?? undefined;

                // Personal & physical
                const mapped: Partial<CoreIdentityValues> = {
                    firstName,
                    lastName: lastName ?? undefined,
                    email: data.email,
                    phone: data.phone ?? "",
                    addressLine1: data.addressLine1 ?? "",
                    addressLine2: data.addressLine2 ?? "",
                    city: data.city ?? "",
                    zipCode: data.zipCode ?? "",
                    dob: data.dob ? new Date(data.dob) : undefined,
                    biologicalSex: (data.gender || undefined) as CoreIdentityValues['biologicalSex'] | undefined,
                };

                if (data.medicalProfile) {
                    mapped.bloodType = data.medicalProfile.bloodType;
                    mapped.heightCm = Number(data.medicalProfile.heightCm || 0);
                    mapped.weightKg = Number(data.medicalProfile.weightKg || 0);
                }
                setPersonalData(mapped);

                // Emergency contacts
                setEmergencyData(data.emergencyContacts ?? []);

                // Allergies + medications
                setMedicalData({
                    allergies: data.allergies ?? [],
                    medications: data.medications ?? [],
                });

                // Insurance (lives on medicalProfile)
                if (data.medicalProfile) {
                    setInsuranceData({
                        provider: data.medicalProfile.insuranceProvider ?? "",
                        policyNumber: data.medicalProfile.insurancePolicyNo ?? "",
                        groupNumber: data.medicalProfile.insuranceGroupNo ?? "",
                    });
                }

                // Compute initial progress
                setSectionsDone({
                    identity: !!(firstName && data.email),
                    emergency: (data.emergencyContacts ?? []).length > 0,
                    medical:
                        (data.allergies ?? []).length > 0 ||
                        (data.medications ?? []).length > 0 ||
                        !!data.medicalProfile?.bloodType,
                    insurance: !!(data.medicalProfile?.insuranceProvider && data.medicalProfile?.insurancePolicyNo),
                });
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    // ── Save handlers ────────────────────────────────────────────────────────

    const triggerSave = async () => {
        setSaving(true);
        setSavedMsg("");
        try {
            (document.getElementById("profile-form-submit") as HTMLButtonElement)?.click();
            await new Promise((r) => setTimeout(r, 1200));
            setSavedMsg("Saved!");
            setHasChanges(false);
            setTimeout(() => setSavedMsg(""), 3000);
        } finally {
            setSaving(false);
        }
    };

    const handleSavePersonal = async (data: CoreIdentityValues) => {
        if (!personId) return;
        await ProfileApi.updatePersonalDetails(personId, {
            phone: data.phone,
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2,
            city: data.city,
            zipCode: data.zipCode,
        });
        await ProfileApi.updateMedicalProfile(personId, {
            biologicalSex: data.biologicalSex,
            bloodType: data.bloodType,
            heightCm: data.heightCm,
            weightKg: data.weightKg,
            dob: data.dob ? format(data.dob, "yyyy-MM-dd") : undefined,
        });
        setSectionsDone((prev) => ({ ...prev, identity: true }));
    };

    const handleSaveEmergency = async (contacts: (EmergencyContactValues & { id?: string })[]) => {
        if (!personId) return;

        // Delete contacts that were removed (existed in DB but not in the new list)
        const existingIds = new Set(contacts.filter((c) => c.id).map((c) => c.id));
        const toDelete = emergencyData.filter((c) => !existingIds.has(c.id));
        await Promise.all(toDelete.map((c) => ProfileApi.deleteEmergencyContact(c.id!)));

        // Add contacts that are new (no id)
        const toAdd = contacts.filter((c) => !c.id);
        const added = await Promise.all(toAdd.map((c) => ProfileApi.addEmergencyContact(personId, c)));

        // Update local state
        const kept = contacts.filter((c) => c.id);
        setEmergencyData([...kept, ...added]);
        setSectionsDone((prev) => ({ ...prev, emergency: contacts.length > 0 }));
    };

    const handleSaveMedical = async ({
        allergies,
        medications,
    }: {
        allergies: (AllergyValues & { id?: string })[];
        medications: (MedicationValues & { id?: string })[];
    }) => {
        if (!personId) return;

        // Allergies sync
        const existingAllergyIds = new Set(allergies.filter((a) => a.id).map((a) => a.id));
        const allergiesToDelete = medicalData.allergies.filter((a) => !existingAllergyIds.has(a.id));
        await Promise.all(allergiesToDelete.map((a) => ProfileApi.deleteAllergy(a.id!)));
        const newAllergies = allergies.filter((a) => !a.id);
        const addedAllergies = await Promise.all(newAllergies.map((a) => ProfileApi.addAllergy(personId, a)));

        // Medications sync
        const existingMedIds = new Set(medications.filter((m) => m.id).map((m) => m.id));
        const medsToDelete = medicalData.medications.filter((m) => !existingMedIds.has(m.id));
        await Promise.all(medsToDelete.map((m) => ProfileApi.deleteMedication(m.id!)));
        const newMeds = medications.filter((m) => !m.id);
        const addedMeds = await Promise.all(newMeds.map((m) => ProfileApi.addMedication(personId, m)));

        // Update local state
        setMedicalData({
            allergies: [...allergies.filter((a) => a.id), ...addedAllergies],
            medications: [...medications.filter((m) => m.id), ...addedMeds],
        });
        setSectionsDone((prev) => ({
            ...prev,
            medical: allergies.length > 0 || medications.length > 0,
        }));
    };

    const handleSaveInsurance = async (data: InsuranceValues) => {
        if (!personId) return;
        await ProfileApi.updateInsurance(personId, data);
        setInsuranceData(data);
        setSectionsDone((prev) => ({ ...prev, insurance: !!(data.provider && data.policyNumber) }));
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading profile...</div>;
    }

    const progress = computeProgress(sectionsDone);
    const displayName = personalData
        ? [personalData.firstName, personalData.lastName].filter(Boolean).join(" ")
        : "";

    return (
        <div className="container mx-auto max-w-6xl py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">
                    {displayName ? `${displayName}'s Health Profile` : "Your Health Profile"}
                </h1>
                <p className="text-muted-foreground mt-2">
                    Complete your profile to ensure you get the best personalized care.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Progress & Navigation */}
                <div className="lg:col-span-4 space-y-6">
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
                            <ProgressRing progress={progress} size={160} />
                            <div className="mt-4">
                                <h3 className="font-semibold text-lg">Profile Completion</h3>
                                <p className="text-sm text-muted-foreground">
                                    {progress < 100 ? "Keep going, you're almost there!" : "Profile complete!"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-2">
                        {SECTIONS.map((section) => {
                            const Icon = section.icon;
                            const done = sectionsDone[section.id as keyof typeof sectionsDone];
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => { setActiveSection(section.id); setHasChanges(false); setSavedMsg(""); }}
                                    className={cn(
                                        "w-full flex items-center p-3 rounded-lg text-left transition-colors border",
                                        activeSection === section.id
                                            ? "bg-primary/10 border-primary text-primary"
                                            : "bg-white dark:bg-card hover:bg-neutral-100 dark:hover:bg-neutral-800 border-transparent"
                                    )}
                                >
                                    <div className={cn("p-2 rounded-full mr-3", activeSection === section.id ? "bg-primary/20" : "bg-neutral-100 dark:bg-neutral-800")}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium">{section.label}</div>
                                        <div className="text-xs text-muted-foreground line-clamp-1">{section.description}</div>
                                    </div>
                                    {done && (
                                        <span className="ml-2 text-xs font-medium text-green-600 dark:text-green-400">✓</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: Active Form */}
                <div className="lg:col-span-8">
                    <Card className="min-h-[500px]">
                        <CardHeader className="flex flex-row items-start justify-between gap-4">
                            <div>
                                <CardTitle>{SECTIONS.find(s => s.id === activeSection)?.label}</CardTitle>
                                <CardDescription>
                                    {SECTIONS.find(s => s.id === activeSection)?.description}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {savedMsg && (
                                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">{savedMsg}</span>
                                )}
                                {hasChanges && (
                                    <Button onClick={triggerSave} disabled={saving}>
                                        {saving ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                                        ) : (
                                            <><Save className="mr-2 h-4 w-4" />Save Changes</>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {activeSection === "identity" && (
                                <CoreIdentityForm
                                    onSave={handleSavePersonal}
                                    userData={personalData}
                                    onDirtyChange={setHasChanges}
                                />
                            )}
                            {activeSection === "emergency" && (
                                <EmergencyContactsForm
                                    onSave={handleSaveEmergency}
                                    initialData={emergencyData}
                                    onDirtyChange={setHasChanges}
                                />
                            )}
                            {activeSection === "medical" && (
                                <MedicalHistoryForm
                                    onSave={handleSaveMedical}
                                    initialData={medicalData}
                                    onDirtyChange={setHasChanges}
                                />
                            )}
                            {activeSection === "insurance" && (
                                <InsuranceForm
                                    onSave={handleSaveInsurance}
                                    initialData={insuranceData}
                                    onDirtyChange={setHasChanges}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
