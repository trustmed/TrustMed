import React from "react";
import { Checkbox } from "@/components/ui/checkbox";

export interface MedicalRecord {
  id: number;
  patientName: string;
  recordType: string;
  date: string;
  doctor: string;
}

interface MedicalRecordsTableProps {
  records: MedicalRecord[];
  selectedIds: number[];
  onSelect: (id: number, checked: boolean) => void;
}

export const MedicalRecordsTable: React.FC<MedicalRecordsTableProps> = ({ records, selectedIds, onSelect }) => (
  <div className="overflow-x-auto w-full">
    <table className="min-w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-neutral-200 dark:border-neutral-800">
          <th className="px-4 py-2 text-left font-semibold text-neutral-500 w-8"></th>
          <th className="px-4 py-2 text-left font-semibold text-neutral-500">ID</th>
          <th className="px-4 py-2 text-left font-semibold text-neutral-500">Patient</th>
          <th className="px-4 py-2 text-left font-semibold text-neutral-500">Type</th>
          <th className="px-4 py-2 text-left font-semibold text-neutral-500">Date</th>
          <th className="px-4 py-2 text-left font-semibold text-neutral-500">Doctor</th>
        </tr>
      </thead>
      <tbody>
        {records.map((rec) => (
          <tr key={rec.id} className="border-b border-neutral-100 dark:border-neutral-800">
            <td className="px-4 py-2">
              <Checkbox checked={selectedIds.includes(rec.id)} onCheckedChange={checked => onSelect(rec.id, !!checked)} />
            </td>
            <td className="px-4 py-2">{rec.id}</td>
            <td className="px-4 py-2">{rec.patientName}</td>
            <td className="px-4 py-2">{rec.recordType}</td>
            <td className="px-4 py-2">{rec.date}</td>
            <td className="px-4 py-2">{rec.doctor}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
