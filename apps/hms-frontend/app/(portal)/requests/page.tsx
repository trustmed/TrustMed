"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  Loader2,
  Inbox,
  RefreshCw,
} from "lucide-react";

interface ConsentRequest {
  id: string;
  requesterId: string;
  patientId: string;
  recordId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  expiresAt: string | null;
  createdAt: string;
  updatedAt?: string;
  record?: {
    id: string;
    originalFileName?: string;
    fileName?: string;
    category?: string;
  };
  patient?: {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<ConsentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"all" | "PENDING" | "ACCEPTED" | "REJECTED">("all");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/consent-requests/me/sent");
      setRequests(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error(err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (recordId: string) => {
    setDownloadingIds((prev) => new Set(prev).add(recordId));
    try {
      const response = await api.get(`/consent-requests/${recordId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `record-${recordId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window?.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setDownloadingIds((prev) => {
        const next = new Set(prev);
        next.delete(recordId);
        return next;
      });
    }
  };


  const filteredRequests =
    activeTab === "all"
      ? requests
      : requests.filter((r) => r.status === activeTab);

  const tabs = [
    { key: "all" as const, label: "All", count: requests.length },
    {
      key: "PENDING" as const,
      label: "Pending",
      count: requests.filter((r) => r.status === "PENDING").length,
    },
    {
      key: "ACCEPTED" as const,
      label: "Accepted",
      count: requests.filter((r) => r.status === "ACCEPTED").length,
    },
    {
      key: "REJECTED" as const,
      label: "Rejected",
      count: requests.filter((r) => r.status === "REJECTED").length,
    },
  ];

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track all consent requests you&apos;ve sent to patients
          </p>
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-accent disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted/50 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === tab.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === tab.key
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
                }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <Inbox className="mx-auto mb-4 h-12 w-12 text-muted-foreground/20" />
          <p className="text-base font-medium text-muted-foreground/60">
            {activeTab === "all"
              ? "No requests sent yet"
              : `No ${activeTab.toLowerCase()} requests`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((req, i) => {
            const expired =
              req.status === "ACCEPTED" && isExpired(req.expiresAt);
            const canDownload =
              req.status === "ACCEPTED" && !expired;

            return (
              <div
                key={req.id}
                className="glass rounded-xl p-5 transition-all hover:bg-muted/20 animate-slide-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${req.status === "ACCEPTED"
                          ? "bg-success/10"
                          : req.status === "REJECTED"
                            ? "bg-destructive/10"
                            : "bg-warning/10"
                        }`}
                    >
                      {req.status === "ACCEPTED" ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : req.status === "REJECTED" ? (
                        <XCircle className="h-5 w-5 text-destructive" />
                      ) : (
                        <Clock className="h-5 w-5 text-warning" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {req.record?.originalFileName ||
                          req.record?.fileName ||
                          `Record ${req.recordId.slice(0, 8)}...`}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          Patient:{" "}
                          {req.patient
                            ? `${req.patient.firstName || ""} ${req.patient.lastName || ""}`.trim() ||
                            req.patient.email
                            : req.patientId.slice(0, 8) + "..."}
                        </span>
                        <span>•</span>
                        <span>{formatDate(req.createdAt)}</span>
                        {req.status === "ACCEPTED" && req.expiresAt && (
                          <>
                            <span>•</span>
                            <span
                              className={
                                expired
                                  ? "text-destructive"
                                  : "text-success"
                              }
                            >
                              {expired
                                ? "Expired"
                                : `Expires ${formatDate(req.expiresAt)}`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Status Badge */}
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${req.status === "ACCEPTED"
                          ? expired
                            ? "bg-muted text-muted-foreground border-border"
                            : "bg-success/10 text-success border-success/20"
                          : req.status === "REJECTED"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-warning/10 text-warning border-warning/20"
                        }`}
                    >
                      {expired ? "Expired" : req.status}
                    </span>

                    {/* Download Button */}
                    {canDownload && (
                      <button
                        onClick={() => handleDownload(req.recordId)}
                        disabled={downloadingIds.has(req.recordId)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-success/15 px-3 py-2 text-xs font-semibold text-success transition-all hover:bg-success/25 disabled:opacity-50"
                      >
                        {downloadingIds.has(req.recordId) ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Download className="h-3 w-3" />
                        )}
                        Download
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
