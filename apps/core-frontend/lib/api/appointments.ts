import { Appointment } from "@/components/appointments/appointments-data";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_URL = `${BASE_URL}/api`;

const jsonHeaders = { "Content-Type": "application/json" };

export type AppointmentPayload = {
  patientName?: string;
  date?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  doctor?: string;
  appointmentType?: string;
  hospitalLocation?: string;
};

export const AppointmentsApi = {
  list: async (): Promise<Appointment[]> => {
    const res = await fetch(`${API_URL}/appointments`, {
      method: "GET",
      headers: jsonHeaders,
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("Failed to fetch appointments");
    }
    return res.json();
  },

  create: async (payload: AppointmentPayload): Promise<Appointment> => {
    const res = await fetch(`${API_URL}/appointments`, {
      method: "POST",
      headers: jsonHeaders,
      credentials: "include",
      body: JSON.stringify({
        patientName: payload.patientName,
        doctorName: payload.doctor,
        appointmentType: payload.appointmentType,
        hospitalLocation: payload.hospitalLocation ?? payload.address,
        date: payload.date,
        address: payload.address,
        phoneNumber: payload.phoneNumber,
        email: payload.email,
      }),
    });
    if (!res.ok) {
      throw new Error("Failed to create appointment");
    }
    return res.json();
  },

  update: async (id: string, payload: AppointmentPayload): Promise<Appointment> => {
    const res = await fetch(`${API_URL}/appointments/${id}`, {
      method: "PATCH",
      headers: jsonHeaders,
      credentials: "include",
      body: JSON.stringify({
        patientName: payload.patientName,
        doctorName: payload.doctor,
        appointmentType: payload.appointmentType,
        hospitalLocation: payload.hospitalLocation ?? payload.address,
        date: payload.date,
        address: payload.address,
        phoneNumber: payload.phoneNumber,
        email: payload.email,
      }),
    });
    if (!res.ok) {
      throw new Error("Failed to update appointment");
    }
    return res.json();
  },

  remove: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/appointments/${id}`, {
      method: "DELETE",
      headers: jsonHeaders,
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("Failed to delete appointment");
    }
  },
};

