"use client";

import { SidebarNav } from "@/components/portal/sidebar";
import { PORTAL_LINKS, USER_PROFILE } from "@/config/portal-navigation";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarNav links={PORTAL_LINKS} userProfile={USER_PROFILE}>
            {children}
        </SidebarNav>
    );
}
