"use client";

import { getAuthUser } from "@/utils/auth";
import { SidebarNav } from "@/components/portal/sidebar";
import { PORTAL_LINKS, USER_PROFILE } from "@/config/portal-navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const user = getAuthUser();
  const userName = user
    ? user.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : user.email?.split("@")[0] || "User"
    : "User";
  const userEmail = user?.email || "";

  const dynamicUserProfile = {
    ...USER_PROFILE,
    label: userName,
    email: userEmail,
  };

  return (
    <SidebarNav links={PORTAL_LINKS} userProfile={dynamicUserProfile}>
      {children}
    </SidebarNav>
  );
}