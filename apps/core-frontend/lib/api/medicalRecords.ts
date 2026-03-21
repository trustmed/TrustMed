import { MedicalRecord, UploadMedicalRecordPayload, UpdateMedicalRecordPayload } from "@/types/medicalRecords";

// ─────────────────────────────────────────────────────────────
//  NOTE FOR BACKEND:
//  Base URL comes from your existing axios config.
//  Swap the mock data / TODO comments with real axios calls.
//  Endpoints:
//    GET    /api/v1/patient/records
//    POST   /api/v1/patient/records          (multipart/form-data)
//    PUT    /api/v1/patient/records/:id      (multipart/form-data)
//    DELETE /api/v1/patient/records/:id
// ─────────────────────────────────────────────────────────────

const MOCK_RECORDS: MedicalRecord[] = [
  {
    id: "sys-001",
    documentType: "Lab Report",
    dateOfRecord: "2025-11-10",
    doctorName: "Dr. Malik Perera",
    hospitalName: "City General Hospital",
    description: "Full blood count — annual checkup",
    fileName: "fbc_nov2025.pdf",
    fileUrl: "#",
    fileSize: 204800,
    fileType: "application/pdf",
    source: "system",
    createdAt: "2025-11-10T09:00:00Z",
    updatedAt: "2025-11-10T09:00:00Z",
  },
  {
    id: "sys-002",
    documentType: "Prescription",
    dateOfRecord: "2025-12-01",
    doctorName: "Dr. Nirosha Fernando",
    hospitalName: "City General Hospital",
    description: "Post-operative medication",
    fileName: "prescription_dec2025.pdf",
    fileUrl: "#",
    fileSize: 102400,
    fileType: "application/pdf",
    source: "system",
    createdAt: "2025-12-01T11:30:00Z",
    updatedAt: "2025-12-01T11:30:00Z",
  },
];

let mockUserRecords: MedicalRecord[] = [
  {
    id: "usr-001",
    documentType: "X-Ray",
    dateOfRecord: "2026-01-15",
    doctorName: "Dr. Kamala Silva",
    hospitalName: "Lanka Private Hospital",
    description: "Chest X-ray — private visit",
    fileName: "xray_jan2026.png",
    fileUrl: "#",
    fileSize: 1024000,
    fileType: "image/png",
    source: "user",
    createdAt: "2026-01-15T14:00:00Z",
    updatedAt: "2026-01-15T14:00:00Z",
  },
];

export const MedicalRecordsApi = {
  async getAll(): Promise<MedicalRecord[]> {
    // TODO: replace with → return axiosInstance.get("/api/v1/patient/records").then(r => r.data)
    await new Promise((r) => setTimeout(r, 600));
    return [...MOCK_RECORDS, ...mockUserRecords].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async upload(payload: UploadMedicalRecordPayload): Promise<MedicalRecord> {
    // TODO: replace with →
    // const form = new FormData();
    // Object.entries(payload).forEach(([k, v]) => form.append(k, v));
    // return axiosInstance.post("/api/v1/patient/records", form).then(r => r.data)
    await new Promise((r) => setTimeout(r, 800));
    const newRecord: MedicalRecord = {
      id: `usr-${Date.now()}`,
      documentType: payload.documentType,
      dateOfRecord: payload.dateOfRecord,
      doctorName: payload.doctorName,
      hospitalName: payload.hospitalName,
      description: payload.description ?? "",
      fileName: payload.file.name,
      fileUrl: URL.createObjectURL(payload.file),
      fileSize: payload.file.size,
      fileType: payload.file.type,
      source: "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockUserRecords = [newRecord, ...mockUserRecords];
    return newRecord;
  },

  async update(id: string, payload: UpdateMedicalRecordPayload): Promise<MedicalRecord> {
    // TODO: replace with →
    // const form = new FormData();
    // Object.entries(payload).forEach(([k, v]) => v && form.append(k, v));
    // return axiosInstance.put(`/api/v1/patient/records/${id}`, form).then(r => r.data)
    await new Promise((r) => setTimeout(r, 700));
    const idx = mockUserRecords.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Record not found");
    const updated: MedicalRecord = {
      ...mockUserRecords[idx],
      ...payload,
      fileName: payload.file ? payload.file.name : mockUserRecords[idx].fileName,
      fileUrl: payload.file ? URL.createObjectURL(payload.file) : mockUserRecords[idx].fileUrl,
      fileSize: payload.file ? payload.file.size : mockUserRecords[idx].fileSize,
      fileType: payload.file ? payload.file.type : mockUserRecords[idx].fileType,
      updatedAt: new Date().toISOString(),
    };
    mockUserRecords[idx] = updated;
    return updated;
  },

  async delete(id: string): Promise<void> {
    // TODO: replace with → axiosInstance.delete(`/api/v1/patient/records/${id}`)
    await new Promise((r) => setTimeout(r, 500));
    mockUserRecords = mockUserRecords.filter((r) => r.id !== id);
  },
};