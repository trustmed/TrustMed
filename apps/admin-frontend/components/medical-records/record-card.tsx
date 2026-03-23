'use client';

import { FileText, FileImage, File, Pencil, Trash2, Download, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MedicalRecord, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/medical-records';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Props {
  record: MedicalRecord;
  onEdit: (record: MedicalRecord) => void;
  onDelete: (record: MedicalRecord) => void;
  onDownload: (record: MedicalRecord) => void;
  onAcceptRequest?: (record: MedicalRecord) => void;
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
  if (type?.startsWith('image/')) return <FileImage className="h-5 w-5" />;
  if (type === 'application/pdf') return <FileText className="h-5 w-5" />;
  return <File className="h-5 w-5" />;
}

export function RecordCard({ record, onEdit, onDelete, onDownload, onAcceptRequest }: Props) {
  const primaryTitle = record.doctorName || record.hospitalName || "—";
  const isPending = record.requestStatus?.status === 'PENDING';

  return (
    <div className={cn(
      "group flex flex-col md:flex-row md:items-center gap-3 md:gap-0 p-3 md:p-3 md:px-4 rounded-lg bg-white dark:bg-neutral-900/20 border border-neutral-200/50 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors duration-200",
      isPending && "bg-red-50/10 dark:bg-red-900/10 border-red-200/50 dark:border-red-800/20"
    )}>
      
      {/* 1. Icon & Record Name */}
      <div className="flex items-center gap-3 w-full md:w-[35%] min-w-0 pr-4">
        <div className={cn("h-9 w-9 rounded-md flex items-center justify-center shrink-0 bg-opacity-20", CATEGORY_COLORS[record.category])}>
          <FileTypeIcon type={record.fileType} />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate" title={record.fileName}>
              {record.fileName}
            </h3>
            {isPending && (
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" title="Pending access request" />
            )}
          </div>
          <span className="text-[11px] text-neutral-500 truncate md:hidden mt-0.5">
            {formatDate(record.createdAt)} · {formatBytes(record.fileSize)}
          </span>
        </div>
      </div>

      {/* 2. Category Pill */}
      <div className="hidden md:flex w-[20%] items-center min-w-0 pr-4">
        <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium tracking-wide', CATEGORY_COLORS[record.category])}>
          {CATEGORY_LABELS[record.category]}
        </span>
      </div>

      {/* 3. Doctor / Hospital */}
      <div className="hidden md:flex w-[20%] items-center min-w-0 pr-4">
        <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate" title={primaryTitle}>
          {primaryTitle}
        </p>
      </div>

      {/* 4. Date & Size */}
      <div className="hidden md:flex flex-col items-end w-[15%] min-w-0 pr-4">
        <span className="text-sm text-neutral-700 dark:text-neutral-300">
          {formatDate(record.createdAt)}
        </span>
        <span className="text-[11px] text-neutral-400">
          {formatBytes(record.fileSize)}
        </span>
      </div>

      {/* 5. Desktop Actions (Ellipsis Menu) */}
      <div className="hidden md:flex items-center justify-end w-auto shrink-0 gap-2 relative z-10">
        {isPending && onAcceptRequest && (
          <Button 
            size="sm" 
            className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white font-medium relative z-20" 
            onClick={(e) => {
              e.stopPropagation();
              onAcceptRequest(record);
            }}
          >
            Requested
          </Button>
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 data-[state=open]:bg-neutral-100 dark:data-[state=open]:bg-neutral-800">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-1 hidden sm:block" align="end" sideOffset={5}>
            <button onClick={() => onDownload(record)} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md text-neutral-700 dark:text-neutral-200 transition-colors">
              <Download className="h-4 w-4 text-neutral-500" /> Download
            </button>
            <button onClick={() => onEdit(record)} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md text-neutral-700 dark:text-neutral-200 transition-colors">
              <Pencil className="h-4 w-4 text-neutral-500" /> Edit Details
            </button>
            <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-1 mx-1" />
            <button onClick={() => onDelete(record)} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md transition-colors">
              <Trash2 className="h-4 w-4" /> Delete Record
            </button>
          </PopoverContent>
        </Popover>
      </div>

      {/* Mobile Actions Overlay (Direct Buttons) */}
      <div className="flex md:hidden items-center justify-end gap-1 mt-2 border-t border-neutral-100 dark:border-neutral-800 pt-2 relative z-10">
         {isPending && onAcceptRequest && (
           <Button 
            variant="default" 
            size="sm" 
            className="h-8 px-3 text-xs bg-red-600 hover:bg-red-700 text-white font-medium mr-auto relative z-20" 
            onClick={(e) => {
              e.stopPropagation();
              onAcceptRequest(record);
            }}
           >
             Requested
           </Button>
         )}
         <Button variant="ghost" size="sm" className="h-8 px-2 text-neutral-500" onClick={() => onDownload(record)}>
           <Download className="h-4 w-4 mr-1" /> Download
         </Button>
         <Button variant="ghost" size="sm" className="h-8 px-2 text-neutral-500" onClick={() => onEdit(record)}>
           <Pencil className="h-4 w-4 mr-1" /> Edit
         </Button>
         <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500" onClick={() => onDelete(record)}>
           <Trash2 className="h-4 w-4 mr-1" /> Delete
         </Button>
      </div>

    </div>
  );
}
