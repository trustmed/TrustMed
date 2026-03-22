'use client';

import { FileText, FileImage, File, Pencil, Trash2, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MedicalRecord, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/medical-records';
import { cn } from '@/lib/utils';

interface Props {
  record: MedicalRecord;
  onEdit: (record: MedicalRecord) => void;
  onDelete: (record: MedicalRecord) => void;
  onDownload: (record: MedicalRecord) => void;
}

function formatBytes(b: number) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function FileTypeIcon({ type }: { type: string }) {
  if (type?.startsWith('image/')) return <FileImage className="h-5 w-5 text-purple-500" />;
  if (type === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />;
  return <File className="h-5 w-5 text-neutral-400" />;
}

export function RecordCard({ record, onEdit, onDelete, onDownload }: Props) {
  return (
    <div className="group flex items-start gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-sm transition-all duration-200">
      <div className="h-10 w-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
        <FileTypeIcon type={record.fileType} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
            {record.fileName}
          </p>
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDownload(record)} title="Download">
              <Download className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(record)} title="Edit">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost" size="icon"
              className="h-7 w-7 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => onDelete(record)} title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', CATEGORY_COLORS[record.category])}>
            {CATEGORY_LABELS[record.category]}
          </span>
          <span className="text-xs text-neutral-400">{formatBytes(record.fileSize)}</span>
          <span className="text-neutral-300 dark:text-neutral-600">·</span>
          <span className="flex items-center gap-1 text-xs text-neutral-400">
            <Calendar className="h-3 w-3" />{formatDate(record.createdAt)}
          </span>
        </div>

        {record.notes && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-1">{record.notes}</p>
        )}
      </div>
    </div>
  );
}
