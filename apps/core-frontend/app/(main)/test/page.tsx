"use client";

import React, { useState } from "react";

interface TestResponse {
  status?: number;
  statusText?: string;
  endpoint?: string;
  method?: string;
  data?: unknown;
  error?: string;
  details?: string;
}

function TestPage() {
  const [requestId, setRequestId] = useState(
    "req" + Math.floor(Math.random() * 1000),
  );
  const [patientDid, setPatientDid] = useState("did:trustmed:patient1");
  const [response, setResponse] = useState<TestResponse | null>(null);
  const [loading, setLoading] = useState<"create" | "approve" | "check" | "audit" | null>(
    null,
  );

  const getApiUrl = (path: string) => `${process.env.NEXT_PUBLIC_API_URL}${path}`;

  const handleRequest = async (type: "create" | "approve" | "check") => {
    setLoading(type);
    setResponse(null);

    try {
      let url = "";
      let options: RequestInit = {};

      if (type === "create") {
        url = getApiUrl("/api/access-requests");
        options = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId,
            patientId: "patient1",
            doctorId: "doctor1",
            hospitalId: "hospitalA",
            purpose: "general-checkup",
          }),
        };
      } else if (type === "approve") {
        url = getApiUrl(`/api/access-requests/${requestId}/approve`);
        options = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
          }),
        };
      } else if (type === "audit") {
        url = getApiUrl(`/api/audit/blockchain/${patientDid}`);
        options = { method: "GET" };
      } else {
        url = getApiUrl(`/api/access-requests/${requestId}`);
        options = { method: "GET" };
      }

      const res = await fetch(url, options);
      const raw = await res.text();

      let data: unknown;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = raw;
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        endpoint: url,
        method: options.method || "GET",
        data,
      });
    } catch (error) {
      console.error("API Error:", error);
      setResponse({
        error: "Failed to fetch",
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto font-sans">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Blockchain Access Control Test
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Dev tool to interact with the TrustMed blockchain layer via the Core Backend.
        </p>
      </header>

      <section className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="space-y-2">
          <label 
            htmlFor="request-id-input"
            className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Target Request ID
          </label>
          <div className="flex gap-2">
            <input
              id="request-id-input"
              type="text"
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="e.g. req123"
            />
            <button
              onClick={() =>
                setRequestId("req" + Math.floor(Math.random() * 1000))
              }
              className="px-3 py-2 text-xs font-medium text-neutral-500 hover:text-indigo-600 transition-colors"
            >
              Generate New
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full pt-2">
          <button
            onClick={() => handleRequest("create")}
            disabled={!!loading}
            className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all group disabled:opacity-50"
          >
            <span className="text-indigo-600 dark:text-indigo-400 font-bold mb-1">
              1. Create
            </span>
            <span className="text-xs text-neutral-500 group-hover:text-indigo-600 transition-colors">
              {loading === "create" ? "Creating..." : "POST /access-requests"}
            </span>
          </button>

          <button
            onClick={() => handleRequest("approve")}
            disabled={!!loading}
            className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 transition-all group disabled:opacity-50"
          >
            <span className="text-emerald-600 dark:text-emerald-400 font-bold mb-1">
              2. Approve
            </span>
            <span className="text-xs text-neutral-500 group-hover:text-emerald-600 transition-colors">
              {loading === "approve" ? "Approving..." : "POST /:id/approve"}
            </span>
          </button>

          <button
            onClick={() => handleRequest("check")}
            disabled={!!loading}
            className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-500/5 transition-all group disabled:opacity-50"
          >
            <span className="text-amber-600 dark:text-amber-400 font-bold mb-1">
              3. Check Status
            </span>
            <span className="text-xs text-neutral-500 group-hover:text-amber-600 transition-colors">
              {loading === "check" ? "Checking..." : "GET /:id/check"}
            </span>
          </button>
        </div>

        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
          <div className="space-y-2">
            <label 
              htmlFor="audit-patient-did"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Audit Logs: Patient DID
            </label>
            <input
              id="audit-patient-did"
              type="text"
              value={patientDid}
              onChange={(e) => setPatientDid(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="did:trustmed:..."
            />
          </div>
          <button
            onClick={() => handleRequest("audit")}
            disabled={!!loading}
            className="w-full py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading === "audit" ? "Fetching Logs..." : "Fetch Blockchain Audit Logs"}
          </button>
        </div>
      </section>

      {response && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-md">
            <div
              className={`px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center ${
                (response.status ?? 0) >= 200 && (response.status ?? 0) < 300
                  ? "bg-green-50 dark:bg-green-900/10"
                  : "bg-red-50 dark:bg-red-900/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    response.method === "POST"
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30"
                  }`}
                >
                  {response.method}
                </span>
                <span className="text-xs font-mono text-neutral-500 truncate max-w-xs md:max-w-md">
                  {response.endpoint}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`text-xs font-bold ${
                    (response.status ?? 0) >= 200 && (response.status ?? 0) < 300
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  HTTP {response.status}
                </span>
                <button
                  onClick={() => setResponse(null)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[500px] bg-neutral-50/50 dark:bg-neutral-900/50">
              <pre className="text-sm font-mono text-neutral-800 dark:text-neutral-300">
                {JSON.stringify(response.data || response, null, 2)}
              </pre>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default TestPage;