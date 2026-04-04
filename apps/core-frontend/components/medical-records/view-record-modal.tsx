'use client';

import { useEffect, useMemo, useState } from 'react';
import { Eye, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/config/api-config/axios';
import { config } from '@/config/config';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { MedicalRecord } from '@/types/medical-records';

interface Props {
  record: MedicalRecord | null;
  open: boolean;
  onClose: () => void;
}

function buildViewUrl(record: MedicalRecord): string {
  return `/api/medical-records/${record.id}/view`;
}

export function ViewRecordModal({ record, open, onClose }: Props) {
  const viewUrl = useMemo(() => (record ? buildViewUrl(record) : ''), [record]);
  const backendViewUrl = useMemo(
    () => (record ? `${config.backendUrl}${buildViewUrl(record)}` : ''),
    [record],
  );
  const [blobUrl, setBlobUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const lowerFileName = (record?.fileName || '').toLowerCase();
  const isImage =
    record?.fileType?.startsWith('image/') ||
    ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'].some((ext) =>
      lowerFileName.endsWith(ext),
    );
  const isPdf =
    record?.fileType === 'application/pdf' || lowerFileName.endsWith('.pdf');

  useEffect(() => {
    let objectUrl = '';

    async function loadRecord() {
      if (!open || !record) {
        setBlobUrl('');
        setLoadError('');
        return;
      }

      setLoading(true);
      setLoadError('');

      try {
        const response = await axiosInstance.get<Blob>(viewUrl, {
          responseType: 'blob',
          params: { t: Date.now() },
        });

        objectUrl = URL.createObjectURL(response.data);
        setBlobUrl(objectUrl);
      } catch {
        setBlobUrl('');
        setLoadError('Failed to load record preview');
      } finally {
        setLoading(false);
      }
    }

    void loadRecord();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [open, record, viewUrl]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" /> View Record
          </DialogTitle>
        </DialogHeader>

        {record ? (
          <div className="flex-1 min-h-0 space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{record.fileName}</p>
                <p className="text-xs text-neutral-500 truncate">{record.fileType || 'Unknown type'}</p>
              </div>
              <a href={backendViewUrl} target="_blank" rel="noreferrer" className="shrink-0">
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="h-4 w-4" /> Open
                </Button>
              </a>
            </div>

            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden min-h-[60vh]">
              {loading ? (
                <div className="flex h-[60vh] items-center justify-center text-sm text-neutral-500">
                  Loading preview...
                </div>
              ) : loadError ? (
                <div className="flex h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-neutral-400" />
                  </div>
                  <p className="text-sm text-red-500">{loadError}</p>
                </div>
              ) : isImage ? (
                <img
                  src={blobUrl}
                  alt={record.fileName}
                  className="w-full h-full max-h-[60vh] object-contain bg-neutral-100 dark:bg-neutral-900"
                />
              ) : isPdf ? (
                <iframe
                  src={blobUrl}
                  title={record.fileName}
                  className="w-full h-[60vh] border-0"
                />
              ) : (
                <div className="relative h-[60vh]">
                  <iframe
                    src={blobUrl}
                    title={record.fileName}
                    className="w-full h-[60vh] border-0"
                  />
                  <div className="absolute bottom-3 left-3 right-3 rounded-md bg-white/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-xs text-neutral-600 dark:text-neutral-300 backdrop-blur-sm">
                    Preview fallback mode. If this file type does not render, use Open.
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        <DialogFooter className="pt-2">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}