"use client";
import { useSyncAuthToken } from "./useSyncAuthToken";

export function AuthTokenProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  useSyncAuthToken();
  return <>{children}</>;
}
