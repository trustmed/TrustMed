"use client";

import { useState } from "react";
import axios from "axios";
import api from "@/lib/api";
import {
  Search,
  FileText,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  User,
  Calendar,
  Building2,
  Stethoscope,
  Loader2,
} from "lucide-react";

interface PatientInfo {
  authUserId: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

interface MedicalRecord {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: string;
  notes?: string;
  doctorName?: string;
  hospitalName?: string;
  recordDate?: string;
  createdAt: string;
  requestStatus: {
    status: string | false;
    createdBy: string;
    createdAt: string;
    id?: string;
  };
}

interface SearchResult {
  patient: PatientInfo;
  records: MedicalRecord[];
}

export default function PatientSearchPage() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [error, setError] = useState("");
  const [requestingIds, setRequestingIds] = useState<Set<string>>(new Set());
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setError("");
    setResults(null);
    setSearching(true);
    setRequestedIds(new Set());

    try {
      const { data } = await api.get(
        `/patients/search?query=${encodeURIComponent(query.trim())}`
      );
      setResults(data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setError("No patients found matching this query.");
      } else {
        setError("An error occurred while searching. Please try again.");
      }
    } finally {
      setSearching(false);
    }
  };

  const handleRequestAccess = async (recordId: string) => {
    setRequestingIds((prev) => new Set(prev).add(recordId));

    try {
      await api.post(`/consent-requests/${recordId}`);
      setRequestedIds((prev) => new Set(prev).add(recordId));

      // Refresh search results to update status
      if (query.trim()) {
        const { data } = await api.get(
          `/patients/search?query=${encodeURIComponent(query.trim())}`
        );
        setResults(data);
      }
    } catch (err: unknown) {
      console.log('error:', err);
      setRequestedIds((prev) => new Set(prev).add(recordId));
    } finally {
      setRequestingIds((prev) => {
        const next = new Set(prev);
        next.delete(recordId);
        return next;
      });
    }
  };

  const formatCategory = (cat: string) =>
    cat
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusInfo = (record: MedicalRecord) => {
    const status = record.requestStatus?.status;
    if (status === "PENDING")
      return { label: "Pending", icon: Clock, style: "bg-warning/10 text-warning border-warning/20" };
    if (status === "ACCEPTED")
      return { label: "Accepted", icon: CheckCircle2, style: "bg-success/10 text-success border-success/20" };
    if (status === "REJECTED")
      return { label: "Rejected", icon: XCircle, style: "bg-destructive/10 text-destructive border-destructive/20" };
    return null;
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Patient Search</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search for a patient by name or email to view and request access to their
          medical records
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter patient name or email..."
            className="w-full rounded-xl border border-border bg-input pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
        <button
          type="submit"
          disabled={searching || !query.trim()}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed glow-primary"
        >
          {searching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Search
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="glass rounded-xl border-destructive/20 px-5 py-4 text-sm text-destructive animate-fade-in">
          {error}
        </div>
      )}

      {/* Results */}
      {results && results.length > 0 && (
        <div className="space-y-12 animate-slide-up">
          {results.map((result) => (
            <div key={result.patient.authUserId} className="space-y-6">
              {/* Patient Info Card */}
              <div className="glass rounded-2xl p-5 glow-primary">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
                    <User className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {result.patient.firstName || result.patient.lastName
                        ? `${result.patient.firstName || ""} ${result.patient.lastName || ""}`.trim()
                        : "Patient"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {result.patient.email}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-primary">
                      {result.records.length} record
                      {result.records.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Records */}
              {result.records.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                  <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    This patient has no medical records.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground">
                    Medical Records
                  </h3>
                  {result.records.map((record, j) => {
                    const statusInfo = getStatusInfo(record);
                    const isRequesting = requestingIds.has(record.id);
                    const justRequested = requestedIds.has(record.id);
                    const hasExistingRequest = statusInfo !== null;

                    return (
                      <div
                        key={record.id}
                        className="glass rounded-xl p-5 transition-all hover:bg-muted/20 animate-slide-up"
                        style={{ animationDelay: `${j * 60}ms` }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 min-w-0">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-card">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {record.fileName || "Untitled Record"}
                              </p>
                              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {formatCategory(record.category)}
                                </span>
                                {record.recordDate && (
                                  <span className="inline-flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(record.recordDate)}
                                  </span>
                                )}
                                {record.doctorName && (
                                  <span className="inline-flex items-center gap-1">
                                    <Stethoscope className="h-3 w-3" />
                                    {record.doctorName}
                                  </span>
                                )}
                                {record.hospitalName && (
                                  <span className="inline-flex items-center gap-1">
                                    <Building2 className="h-3 w-3" />
                                    {record.hospitalName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action / Status */}
                          <div className="shrink-0">
                            {hasExistingRequest && statusInfo ? (
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusInfo.style}`}
                              >
                                <statusInfo.icon className="h-3 w-3" />
                                {statusInfo.label}
                              </span>
                            ) : justRequested ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/20 bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                                <Clock className="h-3 w-3" />
                                Requested
                              </span>
                            ) : (
                              <button
                                onClick={() => handleRequestAccess(record.id)}
                                disabled={isRequesting}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50 glow-primary"
                              >
                                {isRequesting ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Send className="h-3 w-3" />
                                )}
                                Request Access
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
          ))}
        </div>
      )}

      {/* Empty State */}
      {!results && !error && !searching && (
        <div className="glass rounded-2xl p-16 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground/20" />
          <p className="text-base font-medium text-muted-foreground/60">
            Enter a patient&apos;s name or email to search
          </p>
          <p className="mt-1 text-sm text-muted-foreground/40">
            You&apos;ll be able to view their records and request consent-based
            access
          </p>
        </div>
      )}
    </div>
  );
}
