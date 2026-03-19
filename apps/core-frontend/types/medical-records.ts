export interface MedicalRecord {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  category: RecordCategory;
  notes?: string;
  doctorName?: string;
  hospitalName?: string;
  recordDate?: string;
  personId: string;
  createdAt: string;
  updatedAt: string;
}

export enum RecordCategory {
  LAB_REPORT = 'lab_report',
  PRESCRIPTION = 'prescription',
  IMAGING = 'imaging',
  DISCHARGE_SUMMARY = 'discharge_summary',
  VACCINATION = 'vaccination',
  OTHER = 'other',
}

export const CATEGORY_LABELS: Record<RecordCategory, string> = {
  [RecordCategory.LAB_REPORT]: 'Lab Report',
  [RecordCategory.PRESCRIPTION]: 'Prescription',
  [RecordCategory.IMAGING]: 'Imaging',
  [RecordCategory.DISCHARGE_SUMMARY]: 'Discharge Summary',
  [RecordCategory.VACCINATION]: 'Vaccination',
  [RecordCategory.OTHER]: 'Other',
};

export const CATEGORY_COLORS: Record<RecordCategory, string> = {
  [RecordCategory.LAB_REPORT]: 'bg-blue-100 text-blue-700',
  [RecordCategory.PRESCRIPTION]: 'bg-green-100 text-green-700',
  [RecordCategory.IMAGING]: 'bg-purple-100 text-purple-700',
  [RecordCategory.DISCHARGE_SUMMARY]: 'bg-orange-100 text-orange-700',
  [RecordCategory.VACCINATION]: 'bg-teal-100 text-teal-700',
  [RecordCategory.OTHER]: 'bg-gray-100 text-gray-700',
};