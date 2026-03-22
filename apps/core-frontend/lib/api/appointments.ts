import type { Appointment } from "@/lib/appointments/types";

export async function fetchAppointmentsByAuthUserId(authUserId: string): Promise<{ records: Appointment[] }> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const url = `${baseUrl}/api/appointments?authUserId=${encodeURIComponent(authUserId)}`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch appointments");
  return res.json();
}
export interface CreateAppointmentPayload {
  date: string;
  doctor: string;
  type: string;
  location: string;
  status: 'pending' | 'accepted' | 'cancelled';
  patientId: string;
}

export async function createAppointment(payload: CreateAppointmentPayload) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const url = `${baseUrl}/api/appointments`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to create appointment");
  return res.json();
}
