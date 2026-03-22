'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { MedicalRecord } from '@/types/medical-records';

interface Props {
  record: MedicalRecord | null;
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
}

export function DeleteRecordModal({ record, open, onClose, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!record) return;
    setDeleting(true);
    try {
      await onDelete(record.id);
      onClose();
    } catch {
      setError('Failed to delete. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle>Delete Record</DialogTitle>
          </div>
        </DialogHeader>

        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Are you sure you want to delete{' '}
          <span className="font-medium text-neutral-800 dark:text-neutral-200">{record?.fileName}</span>?
          This action cannot be undone.
        </p>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">{error}</p>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={deleting}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting
              ? <span className="flex items-center gap-2"><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</span>
              : <span className="flex items-center gap-2"><Trash2 className="h-4 w-4" />Delete</span>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
