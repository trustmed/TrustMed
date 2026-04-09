import {
  CalendarClock,
  LayoutDashboard,
  UserCog,
  TestTube,
  FileText,
  FileClock,
  Send,
} from "lucide-react";
import Image from "next/image";

export const PORTAL_LINKS = [
  {
    label: "Dashboard",
    href: "/portal",
    icon: (
      <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
    ),
  },
  {
    label: "Medical History",
    href: "/medical-history",
    icon: (
      <FileClock className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
    ),
  },
  {
    label: "Access Logs",
    href: "/medical-records",
    icon: (
      <FileText className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
    ),
  },
  {
    label: "Share Record",
    href: "/share-record",
    icon: (
      <Send className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
    ),
  },
  {
    label: "Upcoming Appointments",
    href: "/appointments",
    icon: (
      <CalendarClock className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
    ),
  },
  {
    label: "Profile",
    href: "/portal/profile",
    icon: (
      <UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
    ),
  },

  {
    label: "Test",
    href: "/test",
    icon: (
      <TestTube className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
    ),
  },
];

export const USER_PROFILE = {
  label: "Luke Skywalker",
  href: "/portal/profile",
  icon: (
    <Image
      src="/profile.png"
      className="h-7 w-7 shrink-0 rounded-full"
      width={50}
      height={50}
      alt="Avatar"
    />
  ),
};
