"use client";


import { useEffect, useState } from "react";

interface HealthResponse {
  status: "up" | "down";
  uptime: number;
  timestamp: string;
  message: string;
  database?: {
    status: "connected" | "disconnected";
    type: string;
  };
}

export default function HealthCheckPage() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      Promise.resolve().then(() => {
        setError("NEXT_PUBLIC_API_URL environment variable is not set. Please define it in your .env file.");
        setLoading(false);
      });
      return;
    }
    fetch(`${apiUrl}/health`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-xl p-8 rounded-xl shadow-lg border border-border bg-white dark:bg-zinc-900 dark:border-zinc-800 transition-colors">
        <h1 className="text-3xl font-bold mb-6 text-center text-foreground">Backend Health Check</h1>
        {loading && <p className="text-center text-muted-foreground">Checking backend connection...</p>}
        {error && (
          <div className="text-red-600 dark:text-red-400 text-center">
            <p>Backend is <b>not connected</b>.</p>
            <pre className="bg-red-100 dark:bg-red-900/40 p-2 mt-2 rounded text-xs overflow-x-auto inline-block text-left">{error}</pre>
          </div>
        )}
        {data && (
          <div className="text-green-700 dark:text-green-400 text-center">
            <p>Backend is <b>connected</b>!</p>
            <div className="mt-4 text-sm space-y-1 text-left inline-block">
              <div><b>Status:</b> {data.status}</div>
              <div><b>Uptime:</b> {Math.floor(data.uptime)}s</div>
              <div><b>Timestamp:</b> {data.timestamp}</div>
              <div><b>Message:</b> {data.message}</div>
              {data.database && (
                <div className="mt-2">
                  <b>Database:</b> {data.database.status} ({data.database.type})
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
