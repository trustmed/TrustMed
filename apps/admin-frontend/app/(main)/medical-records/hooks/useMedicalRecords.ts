import { useState, useCallback } from "react";

import { MedicalRecord, RecordCategory } from "@/types/medical-records";
import { getAuthUser } from "@/utils/auth";
import { MedicalRecordsApi } from "@/lib/api/medicalRecords";
import { ConsentRequestsApi } from "@/lib/api/consentRequests";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import {
  useMedicalRecordControllerGetAllByAuthUserId,
  useMedicalRecordControllerCreate,
  useMedicalRecordControllerUpdate,
  useMedicalRecordControllerDeleteById,
  getMedicalRecordControllerGetAllByAuthUserIdQueryKey,
} from "@/services/api/medical-records/medical-records";
import {
  CreateMedicalRecordRequestDto,
  UpdateMedicalRecordRequestDto,
} from "@/services/interfaces";

type ModalState = "upload" | "edit" | "delete" | "accept_request" | null;
type Toast = { id: number; message: string; type: "success" | "error" };

export default function useMedicalRecords() {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<RecordCategory | "all">(
    "all",
  );
  const [modal, setModal] = useState<ModalState>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null,
  );
  const [toasts, setToasts] = useState<Toast[]>([]);

  const createMutation = useMedicalRecordControllerCreate();
  const updateMutation = useMedicalRecordControllerUpdate();
  const deleteMutation = useMedicalRecordControllerDeleteById();

  const authUser = getAuthUser();
  const AUTHUSER_ID = authUser?.sub || "";
  const queryClient = useQueryClient();

  // Queries and Mutations
  const { data: recordsData, refetch: refetchRecords } = useMedicalRecordControllerGetAllByAuthUserId(
    AUTHUSER_ID,
    {
      query: {
        enabled: !!AUTHUSER_ID,
      },
    },
  );
  const records = (recordsData?.records as MedicalRecord[]) || [];

  const { data: consentRequests = [], refetch: refetchConsentRequests } = useQuery({
    queryKey: ['consentRequests', 'received'],
    queryFn: () => ConsentRequestsApi.getReceivedRequests(),
    enabled: !!AUTHUSER_ID,
  });

  const showToast = useCallback(
    (message: string, type: "success" | "error") => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        3000,
      );
    },
    [],
  );

  // handle medical record upload
  const handleUpload = useCallback(
    async (props: CreateMedicalRecordRequestDto) => {
      if (!AUTHUSER_ID) return;
      try {
        const formData = new FormData();
        formData.append("file", props.file);
        formData.append("personId", AUTHUSER_ID);
        formData.append("category", props.category);
        if (props.notes) formData.append("notes", props.notes);
        if (props.doctorName) formData.append("doctorName", props.doctorName);
        if (props.hospitalName)
          formData.append("hospitalName", props.hospitalName);
        if (props.recordDate) formData.append("recordDate", props.recordDate);

        await createMutation.mutateAsync({
          data: formData as unknown as CreateMedicalRecordRequestDto 
        });

        queryClient.invalidateQueries({
          queryKey:
            getMedicalRecordControllerGetAllByAuthUserIdQueryKey(AUTHUSER_ID),
        });
        showToast("Record added successfully", "success");
        setModal(null);
      } catch (err) {
        console.log("err:", err);

        showToast(
          "Failed to upload record: " +
            (err instanceof Error ? err.message : String(err)),
          "error",
        );
      }
    },
    [AUTHUSER_ID, createMutation, queryClient, showToast],
  );

  // handle medical record edit
  const handleEdit = useCallback(
    async (id: string, updates: UpdateMedicalRecordRequestDto) => {
      if (!AUTHUSER_ID) return;
      try {
        await updateMutation.mutateAsync({
          authuserId: AUTHUSER_ID,
          recordId: id,
          data: updates,
        });
        queryClient.invalidateQueries({
          queryKey:
            getMedicalRecordControllerGetAllByAuthUserIdQueryKey(AUTHUSER_ID),
        });
        showToast("Record updated successfully", "success");
        setModal(null);
        setSelectedRecord(null);
      } catch (err) {
        console.log("err:", err);

        showToast("Failed to update record", "error");
      }
    },
    [AUTHUSER_ID, updateMutation, queryClient, showToast],
  );

  // handle medical record delete
  const handleDelete = useCallback(
    async (id: string) => {
      if (!AUTHUSER_ID) return;
      try {
        await deleteMutation.mutateAsync({
          authuserId: AUTHUSER_ID,
          recordId: id,
        });
        queryClient.invalidateQueries({
          queryKey:
            getMedicalRecordControllerGetAllByAuthUserIdQueryKey(AUTHUSER_ID),
        });
        showToast("Record deleted successfully", "success");
        setModal(null);
        setSelectedRecord(null);
      } catch (err) {
        console.log("err:", err);
        showToast("Failed to delete record", "error");
      }
    },
    [AUTHUSER_ID, deleteMutation, queryClient, showToast],
  );

  // handle medical record download
  const handleDownload = useCallback(
    async (record: MedicalRecord) => {
      if (!AUTHUSER_ID) return;
      try {
        const url = await MedicalRecordsApi.getDownloadUrl(
          AUTHUSER_ID,
          record.id,
        );
        window.open(url, "_blank");
      } catch {
        showToast("Failed to get download URL", "error");
      }
    },
    [AUTHUSER_ID, showToast],
  );

  //handle medical record filtering
  const filtered = records.filter((r) => {
    const matchSearch =
      r.fileName?.toLowerCase().includes(search.toLowerCase()) ||
      r.notes?.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      filterCategory === "all" || r.category === filterCategory;
    return matchSearch && matchCategory;
  });

  return {
    createMutation,
    handleUpload,
    handleEdit,
    handleDelete,
    handleDownload,
    search,
    setSearch,
    filterCategory,
    setFilterCategory,
    modal,
    setModal,
    selectedRecord,
    setSelectedRecord,
    toasts,
    setToasts,
    showToast,
    records,
    filtered,
    consentRequests,
    refetchConsentRequests,
    refetchRecords,
  };
}
