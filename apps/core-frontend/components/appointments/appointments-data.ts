export type AppointmentStatus = "accepted" | "pending" | "cancelled";

export type Appointment = {
  id: string;
  appointmentNo: string;
  appointmentType: string;
  doctorName: string;
  date: string; // ISO date string: YYYY-MM-DD
  hospitalLocation: string;
  status: AppointmentStatus;
};

export const DUMMY_APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    appointmentNo: "D001",
    appointmentType: "Psychiatric",
    doctorName: "Dr. S. Sumanaweera",
    date: "2026-01-04",
    hospitalLocation: "Maharagama",
    status: "accepted",
  },
  {
    id: "2",
    appointmentNo: "D002",
    appointmentType: "Dermatology",
    doctorName: "Dr. J. Karunaratne",
    date: "2025-12-04",
    hospitalLocation: "Nugegoda",
    status: "cancelled",
  },
  {
    id: "3",
    appointmentNo: "D003",
    appointmentType: "Counselling",
    doctorName: "Dr. D. Dayawansha",
    date: "2025-11-30",
    hospitalLocation: "Homagama",
    status: "cancelled",
  },
  {
    id: "4",
    appointmentNo: "D004",
    appointmentType: "General Practitioner",
    doctorName: "Dr. K. Jayasinghe",
    date: "2024-11-20",
    hospitalLocation: "Nugegoda",
    status: "accepted",
  },
  {
    id: "5",
    appointmentNo: "D005",
    appointmentType: "Pediatrics",
    doctorName: "Dr. Jayani Kalupahana",
    date: "2024-10-01",
    hospitalLocation: "Maharagama",
    status: "pending",
  },
  {
    id: "6",
    appointmentNo: "D006",
    appointmentType: "General Practitioner",
    doctorName: "Dr. K. Jayasinghe",
    date: "2024-09-05",
    hospitalLocation: "Colombo Fort",
    status: "pending",
  },
  {
    id: "7",
    appointmentNo: "D007",
    appointmentType: "Dental",
    doctorName: "Dr. Saman Kumara",
    date: "2024-08-25",
    hospitalLocation: "Nugegoda",
    status: "accepted",
  },
  {
    id: "8",
    appointmentNo: "D008",
    appointmentType: "General Practitioner",
    doctorName: "Dr. R. Jayasinghe",
    date: "2025-08-27",
    hospitalLocation: "Maharagama",
    status: "cancelled",
  },
];

