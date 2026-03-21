export type AppointmentStatus = "accepted" | "cancelled" | "pending";

export interface Appointment {
    id: string;
    appointmentNo: string;
    appointmentType: string;
    doctorName: string;
    /** ISO date string YYYY-MM-DD */
    date: string;
    hospitalLocation: string;
    status: AppointmentStatus;
    address: string;
    phone: string;
    email: string;
}
