'use client';

import { useState, useEffect } from 'react';
import { Pencil, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { MedicalRecord, RecordCategory, CATEGORY_LABELS } from '@/types/medical-records';

interface Props {
  record: MedicalRecord | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, updates: { category: RecordCategory; notes: string; doctorName: string; hospitalName: string; recordDate: string }) => Promise<void>;
}

export function EditRecordModal({ record, open, onClose, onSave }: Props) {
  const [category, setCategory] = useState<RecordCategory>(RecordCategory.OTHER);
  const [notes, setNotes] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [recordDate, setRecordDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (record) {
      setCategory(record.category);
      setNotes(record.notes ?? '');
      setDoctorName(record.doctorName ?? '');
      setHospitalName(record.hospitalName ?? '');
      setRecordDate(record.recordDate ? record.recordDate.slice(0, 10) : '');
      setError('');
    }
  }, [record]);

  const handleSave = async () => {
    if (!record) return;
    setSaving(true);
    try {
      await onSave(record.id, { category, notes, doctorName, hospitalName, recordDate });
      onClose();
    } catch {
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" /> Edit Record
          </DialogTitle>
        </DialogHeader>

        {record && (
          <div className="space-y-4">
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
              <p className="text-sm font-medium truncate">{record.fileName}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{record.fileType}</p>
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as RecordCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(CATEGORY_LABELS) as [RecordCategory, string][]).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Date of Record</Label>
              <Input
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Doctor Name <span className="text-neutral-400 font-normal">(optional)</span></Label>
              <Input
                placeholder="e.g. Dr. Malik Perera"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Hospital Name <span className="text-neutral-400 font-normal">(optional)</span></Label>
              <Input
                placeholder="e.g. City General Hospital"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea
                placeholder="Add notes about this record..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none h-24"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 shrink-0" />{error}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving
              ? <span className="flex items-center gap-2"><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</span>
              : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}