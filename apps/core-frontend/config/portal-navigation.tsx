import { LayoutDashboard, UserCog, Settings } from "lucide-react";
import Image from "next/image";

export const PORTAL_LINKS = [
    {
        label: "Dashboard",
        href: "#",
        icon: (
            <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
        ),
    },
    {
        label: "Profile",
        href: "#",
        icon: (
            <UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
        ),
    },
    {
        label: "Settings",
        href: "#",
        icon: (
            <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
        ),
    }

];

export const USER_PROFILE = {
    label: "Luke Skywalker",
    href: "#",
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
