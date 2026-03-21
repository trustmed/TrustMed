"use client";
import {
  useGetBlockchainHealth,
  useGetHealth,
} from "../../../services/api/health/health";

export default function HealthCheckPage() {
  const {
    data: healthCheckData,
    error: healthCheckError,
    isLoading: healthCheckLoading,
  } = useGetHealth();

  const {
    data: blockchainHealthData
  } = useGetBlockchainHealth();
  const error =
    (healthCheckError as Error)?.message || healthCheckError?.toString();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-xl p-8 rounded-xl shadow-lg border border-border bg-white dark:bg-zinc-900 dark:border-zinc-800 transition-colors">
        <h1 className="text-3xl font-bold mb-6 text-center text-foreground">
          Backend Health Check
        </h1>
        {healthCheckLoading && (
          <p className="text-center text-muted-foreground">
            Checking backend connection...
          </p>
        )}
        {error && (
          <div className="text-red-600 dark:text-red-400 text-center">
            <p>
              Backend is <b>not connected</b>.
            </p>
            <pre className="bg-red-100 dark:bg-red-900/40 p-2 mt-2 rounded text-xs overflow-x-auto inline-block text-left">
              {error}
            </pre>
          </div>
        )}
        {healthCheckData && (
          <div className="text-green-700 dark:text-green-400 text-center">
            <p>
              Backend is <b>connected</b>!
            </p>
            <div className="mt-4 text-sm space-y-1 text-left inline-block">
              <div>
                <b>Status:</b> {healthCheckData.status}
              </div>
              <div>
                <b>Uptime:</b> {Math.floor(healthCheckData.uptime)}s
              </div>
              <div>
                <b>Timestamp:</b> {healthCheckData.timestamp}
              </div>
              <div>
                <b>Message:</b> {healthCheckData.message}
              </div>
              {healthCheckData.database && (
                <div className="mt-2">
                  <b>Database:</b> {healthCheckData.database.status} (
                  {healthCheckData.database.type})
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-xl p-8 rounded-xl shadow-lg border border-border bg-white dark:bg-zinc-900 dark:border-zinc-800 transition-colors">
        <h1 className="text-3xl font-bold mb-6 text-center text-foreground">
          Blockchain Health Check
        </h1>
        {healthCheckLoading && (
          <p className="text-center text-muted-foreground">
            Checking blockchain connection...
          </p>
        )}
        {error && (
          <div className="text-red-600 dark:text-red-400 text-center">
            <p>
              Blockchain is <b>not connected</b>.
            </p>
            <pre className="bg-red-100 dark:bg-red-900/40 p-2 mt-2 rounded text-xs overflow-x-auto inline-block text-left">
              {error}
            </pre>
          </div>
        )}
        {healthCheckData && (
          <div className="text-green-700 dark:text-green-400 text-center">
            <p>
              Blockchain is <b>connected</b>!
            </p>
            <div className="mt-4 text-sm space-y-1 text-left inline-block">
              <div>
                <b>Status:</b> {blockchainHealthData?.message}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
