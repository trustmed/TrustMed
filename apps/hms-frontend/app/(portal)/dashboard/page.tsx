"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface ConsentRequest {
  id: string;
  requesterId: string;
  patientId: string;
  recordId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  expiresAt: string | null;
  createdAt: string;
  record?: {
    id: string;
    originalFileName?: string;
    category?: string;
  };
  patient?: {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
}

export default function DashboardPage() {
  const [requests, setRequests] = useState<ConsentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get("/consent-requests/me/sent");
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      // fallback to empty
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "PENDING").length,
    accepted: requests.filter((r) => r.status === "ACCEPTED").length,
    rejected: requests.filter((r) => r.status === "REJECTED").length,
  };

  const recentRequests = requests.slice(0, 5);

  const statCards = [
    {
      label: "Total Requests",
      value: stats.total,
      icon: FileText,
      color: "text-primary",
      bg: "bg-primary/10",
      glow: "glow-primary",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-warning",
      bg: "bg-warning/10",
      glow: "",
    },
    {
      label: "Accepted",
      value: stats.accepted,
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10",
      glow: "glow-success",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
      glow: "",
    },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your patient record access requests
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`glass rounded-2xl p-5 transition-all hover:scale-[1.02] ${card.glow}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {card.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {loading ? "–" : card.value}
                  </p>
                </div>
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.bg}`}
                >
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Requests */}
      <div className="glass rounded-2xl p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Recent Requests</h2>
          </div>
          <Link
            href="/requests"
            className="flex items-center gap-1 text-sm text-primary transition-colors hover:text-primary/80"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          </div>
        ) : recentRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              No requests yet. Search for a patient to get started.
            </p>
            <Link
              href="/patients"
              className="mt-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Search Patients →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentRequests.map((req, i) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50 animate-slide-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-card">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {req.record?.originalFileName || req.recordId.slice(0, 8) + "..."}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {req.patient
                        ? `${req.patient.firstName || ""} ${req.patient.lastName || ""}`.trim() ||
                          req.patient.email
                        : req.patientId.slice(0, 8) + "..."}
                    </p>
                  </div>
                </div>

                <StatusBadge status={req.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING:
      "bg-warning/10 text-warning border-warning/20",
    ACCEPTED:
      "bg-success/10 text-success border-success/20",
    REJECTED:
      "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        styles[status] || styles.PENDING
      }`}
    >
      {status}
    </span>
  );
}
