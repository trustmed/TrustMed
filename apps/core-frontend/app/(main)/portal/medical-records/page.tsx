'use client';

import { useState, useEffect } from 'react';
import { Upload, Search, FolderOpen, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { UploadRecordModal } from '@/components/medical-records/upload-record-modal';
import { EditRecordModal } from '@/components/medical-records/edit-record-modal';
import { DeleteRecordModal } from '@/components/medical-records/delete-record-modal';
import { RecordCard } from '@/components/medical-records/record-card';
import { MedicalRecord, RecordCategory, CATEGORY_LABELS } from '@/types/medical-records';
import { MedicalRecordsApi } from '@/lib/api/medical-records';
import { ProfileApi } from '@/lib/api/profile';

type ModalState = 'upload' | 'edit' | 'delete' | null;

export default function MedicalRecordsPage() {
  const [personId, setPersonId] = useState<string | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<RecordCategory | 'all'>('all');
  const [modal, setModal] = useState<ModalState>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const profile = await ProfileApi.getProfileByEmail(
          'pramodmaneesha26@gmail.com',
        );
        setPersonId(profile.id);
        const data = await MedicalRecordsApi.getRecords(profile.id);
        setRecords(data);
      } catch (err) {
        console.error('Failed to load medical records:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const filtered = records.filter((r) => {
    const matchSearch =
      r.fileName.toLowerCase().includes(search.toLowerCase()) ||
      r.notes?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'all' || r.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const handleUpload = async (file: File, category: RecordCategory, notes: string) => {
    if (!personId) return;
    const newRecord = await MedicalRecordsApi.uploadRecord(personId, file, category, notes);
    setRecords((prev) => [newRecord, ...prev]);
  };

  const handleEdit = async (id: string, updates: { category: RecordCategory; notes: string }) => {
    if (!personId) return;
    const updated = await MedicalRecordsApi.updateRecord(personId, id, updates);
    setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };

  const handleDelete = async (id: string) => {
    if (!personId) return;
    await MedicalRecordsApi.deleteRecord(personId, id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDownload = async (record: MedicalRecord) => {
    if (!personId) return;
    try {
      const url = await MedicalRecordsApi.getDownloadUrl(personId, record.id);
      window.open(url, '_blank');
    } catch {
      console.error('Failed to get download URL');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            Medical Records
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {records.length} record{records.length !== 1 ? 's' : ''} stored securely
          </p>
        </div>
        <Button onClick={() => setModal('upload')} className="gap-2 shrink-0">
          <Upload className="h-4 w-4" /> Upload Record
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
          <Input
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as RecordCategory | 'all')}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2 text-neutral-400" />
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {(Object.entries(CATEGORY_LABELS) as [RecordCategory, string][]).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filtered.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              onEdit={(r) => { setSelectedRecord(r); setModal('edit'); }}
              onDelete={(r) => { setSelectedRecord(r); setModal('delete'); }}
              onDownload={handleDownload}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-14 w-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
            <FolderOpen className="h-7 w-7 text-neutral-400" />
          </div>
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {search || filterCategory !== 'all' ? 'No records match your search' : 'No records yet'}
          </h3>
          <p className="text-sm text-neutral-400 mt-1">
            {search || filterCategory !== 'all'
              ? 'Try adjusting your filters'
              : 'Upload your first medical record to get started'}
          </p>
          {!search && filterCategory === 'all' && (
            <Button variant="outline" className="mt-4 gap-2" onClick={() => setModal('upload')}>
              <Upload className="h-4 w-4" /> Upload Record
            </Button>
          )}
        </div>
      )}

      <UploadRecordModal
        open={modal === 'upload'}
        onClose={() => setModal(null)}
        onUpload={handleUpload}
      />
      <EditRecordModal
        record={selectedRecord}
        open={modal === 'edit'}
        onClose={() => { setModal(null); setSelectedRecord(null); }}
        onSave={handleEdit}
      />
      <DeleteRecordModal
        record={selectedRecord}
        open={modal === 'delete'}
        onClose={() => { setModal(null); setSelectedRecord(null); }}
        onDelete={handleDelete}
      />
    </div>
  );
}