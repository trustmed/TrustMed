'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileImage, FileText, File, X, AlertCircle } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { RecordCategory, CATEGORY_LABELS } from '@/types/medical-records';

interface Props {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File, category: RecordCategory, notes: string, doctorName: string, hospitalName: string, recordDate: string) => Promise<void>;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

function formatBytes(b: number) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ type }: { type: string }) {
  if (type.startsWith('image/')) return <FileImage className="h-8 w-8 text-purple-500" />;
  if (type === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />;
  return <File className="h-8 w-8 text-neutral-400" />;
}

export function UploadRecordModal({ open, onClose, onUpload }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<RecordCategory | ''>('');
  const [notes, setNotes] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [recordDate, setRecordDate] = useState('');
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (f: File): string => {
    if (!ALLOWED_TYPES.includes(f.type)) return 'Invalid file type. Only PDF, JPG, and PNG are allowed.';
    if (f.size > MAX_SIZE) return 'File too large. Maximum size is 5 MB.';
    return '';
  };

  const handleFile = (f: File) => {
    const err = validate(f);
    if (err) { setError(err); return; }
    setError('');
    setFile(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleSubmit = async () => {
    if (!file || !category || !recordDate) {
      setError('Please select a file, category, and date.');
      return;
    }
    setUploading(true);
    try {
      await onUpload(file, category, notes, doctorName, hospitalName, recordDate);
      handleClose();
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null); setCategory(''); setNotes('');
    setDoctorName(''); setHospitalName(''); setRecordDate('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" /> Upload Medical Record
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              'relative border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-200 text-center',
              dragging
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-primary/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
              file && 'border-green-400 dark:border-green-600 bg-green-50/50 dark:bg-green-900/10',
            )}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {file ? (
              <div className="flex items-center gap-3">
                <FileIcon type={file.type} />
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-neutral-500">{formatBytes(file.size)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-neutral-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Drop your file here or <span className="text-primary">browse</span>
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">PDF, JPG, PNG · Max 5 MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Category <span className="text-red-500">*</span></Label>
            <Select value={category} onValueChange={(v) => setCategory(v as RecordCategory)}>
              <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
              <SelectContent>
                {(Object.entries(CATEGORY_LABELS) as [RecordCategory, string][]).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label>Date of Record <span className="text-red-500">*</span></Label>
            <Input
              type="date"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
            />
          </div>

          {/* Doctor Name */}
          <div className="space-y-1.5">
            <Label>Doctor Name <span className="text-neutral-400 font-normal">(optional)</span></Label>
            <Input
              placeholder="e.g. Dr. Malik Perera"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
            />
          </div>

          {/* Hospital Name */}
          <div className="space-y-1.5">
            <Label>Hospital Name <span className="text-neutral-400 font-normal">(optional)</span></Label>
            <Input
              placeholder="e.g. City General Hospital"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notes <span className="text-neutral-400 font-normal">(optional)</span></Label>
            <Textarea
              placeholder="Add any relevant notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none h-20"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={uploading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!file || !category || !recordDate || uploading}>
            {uploading
              ? <span className="flex items-center gap-2"><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Uploading...</span>
              : <span className="flex items-center gap-2"><Upload className="h-4 w-4" />Upload Record</span>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}