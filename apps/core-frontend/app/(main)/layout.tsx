"use client";

import { useState } from "react"; // No more useEffect needed
import { SidebarNav } from "@/components/portal/sidebar";
import { PORTAL_LINKS, USER_PROFILE } from "@/config/portal-navigation";
import { getAuthUser } from "@/utils/auth";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [userName] = useState(() => {
    if (typeof window === "undefined") return "User"; 

    const user = getAuthUser();
    if (user) {
      return user.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : user.email?.split("@")[0] || "User";
    }
    return "User";
  });

  const dynamicUserProfile = {
    ...USER_PROFILE,
    label: userName,
  };

  return (
    <SidebarNav links={PORTAL_LINKS} userProfile={dynamicUserProfile}>
      {children}
    </SidebarNav>
  );
}