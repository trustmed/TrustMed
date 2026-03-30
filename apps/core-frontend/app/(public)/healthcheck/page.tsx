"use client";
import {
  useGetBlockchainHealth,
  useGetHealth,
} from "../../../services/api/health/health";
import { 
  AlertCircle, 
  Activity, 
  Database, 
  Cpu, 
  Globe,
  Clock,
  ShieldCheck,
  Link2,
  type LucideIcon
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatusBadgeProps {
  readonly status?: string;
}

function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) return null;
  const normalizedStatus = status.toUpperCase();
  const isUp = ["UP", "OK", "CONNECTED"].includes(normalizedStatus);
  const isDegraded = ["DEGRADED"].includes(normalizedStatus);

  let colorClasses = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
  let dotClass = "bg-rose-500";

  if (isUp) {
    colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
    dotClass = "bg-emerald-500 animate-pulse";
  } else if (isDegraded) {
    colorClasses = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
    dotClass = "bg-amber-500";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all uppercase tracking-wider",
        colorClasses
      )}
    >
      <div className={cn("w-1 h-1 rounded-full", dotClass)} />
      {status}
    </span>
  );
}

interface InfoLineProps {
  readonly label: string;
  readonly value?: string | number;
  readonly icon: LucideIcon;
}

function InfoLine({ label, value, icon: Icon }: InfoLineProps) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between text-xs py-1">
      <div className="flex items-center gap-2 text-muted-foreground line-clamp-1">
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span>{label}:</span>
      </div>
      <span className="font-mono font-medium text-foreground text-right ml-4 break-all max-w-[200px]">{value}</span>
    </div>
  );
}

export default function HealthCheckPage() {
  const {
    data: healthCheckData,
    error: healthCheckError,
    isLoading: healthCheckLoading,
  } = useGetHealth();

  const { data: blockchainHealthData, isLoading: bcLoading, error: bcHookError } = useGetBlockchainHealth();
  
  const error = healthCheckError instanceof Error ? healthCheckError.message : String(healthCheckError || "");
  const bcError = bcHookError instanceof Error ? bcHookError.message : String(bcHookError || "");

  const backendStatus = healthCheckData?.status?.toUpperCase();
  const blockchainStatus = blockchainHealthData?.status?.toUpperCase();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12 transition-colors duration-500">
      <div className="text-center space-y-3 mb-12">
        <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl uppercase">System Health</h1>
        <div className="h-1 w-20 bg-emerald-500 mx-auto rounded-full" />
        <p className="text-muted-foreground text-lg max-w-md mx-auto italic">Real-time telemetry for TrustMed platform services.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl items-stretch">
        {/* Backend Card */}
        <div className="flex flex-col p-8 rounded-3xl shadow-xl border border-border bg-white dark:bg-zinc-900 transition-all hover:shadow-emerald-500/5 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl shadow-inner shadow-emerald-500/10">
                <Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Core Backend</h2>
            </div>
            {healthCheckLoading ? (
              <Activity className="w-4 h-4 text-muted-foreground animate-spin" />
            ) : (
              <StatusBadge status={backendStatus} />
            )}
          </div>

          <div className="flex-1 space-y-4 flex flex-col justify-center">
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400">
                <div className="flex items-center gap-2 mb-2 font-bold text-xs uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4" />
                  <span>Node Disconnected</span>
                </div>
                <pre className="text-[10px] opacity-70 overflow-x-auto whitespace-pre-wrap">{error}</pre>
              </div>
            )}

            {healthCheckData && (
              <div className="space-y-1 w-full">
                <InfoLine label="Uptime" value={healthCheckData.uptime ? `${Math.floor(healthCheckData.uptime)}s` : undefined} icon={Clock} />
                <InfoLine label="Timestamp" value={healthCheckData.timestamp} icon={Globe} />
                <div className="py-2.5 px-3 my-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 text-[10px] italic border border-border/30 text-muted-foreground flex items-center gap-2">
                   <Activity className="w-3 h-3 text-muted-foreground/50" />
                   <span>{healthCheckData.message}</span>
                </div>
                {healthCheckData.database && (
                  <div className="mt-auto pt-6 border-t border-border/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground px-1">
                        <Database className="w-4 h-4 opacity-50" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Main Database</span>
                      </div>
                      <StatusBadge status={healthCheckData.database.status?.toUpperCase()} />
                    </div>
                    <InfoLine label="Driver System" value={healthCheckData.database.type?.toUpperCase()} icon={Link2} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Blockchain Card */}
        <div className="flex flex-col p-8 rounded-3xl shadow-xl border border-border bg-white dark:bg-zinc-900 transition-all hover:shadow-blue-500/5 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-500/10 rounded-xl shadow-inner shadow-blue-500/10">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Hyperledger</h2>
            </div>
            {bcLoading ? (
              <Activity className="w-4 h-4 text-muted-foreground animate-spin" />
            ) : (
              <StatusBadge status={blockchainStatus} />
            )}
          </div>

          <div className="flex-1 space-y-6">
            {(bcError || (!bcLoading && !blockchainHealthData)) && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 text-amber-700 dark:text-amber-400">
                <div className="flex items-center gap-2 mb-2 font-bold text-xs uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4" />
                  <span>Network Unavailable</span>
                </div>
                <pre className="text-[10px] opacity-70 overflow-x-auto whitespace-pre-wrap">{bcError || "Gateway service is unreachable."}</pre>
              </div>
            )}

            {blockchainHealthData && (
              <div className="space-y-6">
                {/* Network Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Fabric Network</span>
                    <StatusBadge status={blockchainHealthData.network?.status?.toUpperCase()} />
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-2xl space-y-1 border border-border/30">
                    <InfoLine label="MSP ID" value={blockchainHealthData?.network?.mspId} icon={ShieldCheck} />
                    <InfoLine label="Chaincode" value={blockchainHealthData?.network?.chaincode} icon={Cpu} />
                    <InfoLine label="Channel" value={blockchainHealthData?.network?.channel} icon={Globe} />
                    <InfoLine 
                      label="Last Check" 
                      value={blockchainHealthData?.network?.timestamp ? new Date(blockchainHealthData?.network?.timestamp).toLocaleTimeString() : undefined} 
                      icon={Clock} 
                    />
                    {blockchainHealthData?.network?.details && (
                      <div className="mt-2 pt-2 border-t border-border/20 text-[9px] text-muted-foreground italic truncate">
                        {blockchainHealthData?.network?.details}
                      </div>
                    )}
                  </div>
                </div>

                {/* Gateway Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Gateway Node</span>
                    <StatusBadge status={blockchainHealthData.gateway.status?.toUpperCase()} />
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-2xl space-y-1 border border-border/30">
                    <InfoLine label="Protocol ID" value={blockchainHealthData.gateway.mspId} icon={ShieldCheck} />
                    <InfoLine 
                      label="Response Time" 
                      value={blockchainHealthData.gateway.timestamp ? new Date(blockchainHealthData.gateway.timestamp).toLocaleTimeString() : undefined} 
                      icon={Clock} 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="mt-12 text-center opacity-60 hover:opacity-100 transition-opacity">
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white dark:bg-zinc-900 border border-border shadow-soft">
          <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monitoring active session</span>
        </div>
      </footer>
    </div>
  );
}
