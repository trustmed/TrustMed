"use client";
import { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "@/components/ui/sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { LogOut, PanelLeftClose, PanelLeftOpen, UserCog } from "lucide-react";
import { ThemeToggle } from "@/components/portal/theme-toggle";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useAuthControllerLogout } from "@/services/api/auth/auth";
import { toast } from "sonner";

interface LinkItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface UserProfile {
  label: string;
  href: string;
  icon: React.ReactNode;
  email?: string;
}

interface SidebarNavProps {
  children: React.ReactNode;
  links: LinkItem[];
  userProfile: UserProfile;
}

export function SidebarNav({ children, links, userProfile }: Readonly<SidebarNavProps>) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { mutate: logout } = useAuthControllerLogout({
    mutation: {
      onSuccess: () => {
        router.push("/signin");
        router.refresh();
      },
      onError: () => toast.error("Unable to logout. Please try again."),
    },
  });

  const handleLogout = () => logout();

  return (
    <div className="fixed inset-0 flex flex-col md:flex-row bg-[#F8FAFC] dark:bg-neutral-900 w-full overflow-hidden">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="flex flex-col gap-0 pb-6">
          {/* ── TOP: scrollable nav area ── */}
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {/* Header row: more top breathing room */}
            <div className={cn(
              "flex items-center pt-2",
              open ? "justify-between" : "justify-center"
            )}>
              {open && <Logo />}
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                title={open ? "Collapse sidebar" : "Expand sidebar"}
                aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
              >
                {open ? (
                  <PanelLeftClose size={18} className="text-neutral-500" />
                ) : (
                  <PanelLeftOpen size={18} className="text-neutral-500" />
                )}
              </button>
            </div>

            {/* Nav links */}
            <div className="mt-8 flex flex-col gap-1.5">
              {links.map((link) => (
                <SidebarLink key={link.href} link={link} />
              ))}
            </div>
          </div>

          {/* ── BOTTOM: profile popover only ── */}
          <div className="flex flex-col gap-0">
            <Popover>
              <PopoverTrigger asChild>
                <div className="w-full cursor-pointer">
                  <UserProfileTrigger link={userProfile} />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4 flex flex-col gap-4" side="top" align="start" sideOffset={10}>
                {/* Profile info at top with theme button on right */}
                <div className="flex items-center gap-3 border-b pb-3 mb-2 justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0 ring-2 ring-slate-100 dark:ring-neutral-800 rounded-full">
                      {userProfile.icon}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100 truncate">{userProfile.label}</span>
                      {userProfile.email && (
                        <span className="text-xs text-neutral-400 tracking-wide truncate">{userProfile.email}</span>
                      )}
                    </div>
                  </div>
                  <div className="ml-2">
                    <ThemeToggle />
                  </div>
                </div>
                {/* Profile button */}
                <Button
                  variant="outline"
                  onClick={() => router.push(userProfile.href)}
                  className="w-full justify-start gap-2 mb-2"
                >
                  <UserCog size={16} />
                  Profile
                </Button>
                {/* Logout button at bottom */}
                <Button
                  variant="secondary"
                  onClick={handleLogout}
                  className="w-full justify-start gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Main content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

const UserProfileTrigger = ({ link }: { link: UserProfile }) => {
  const { open, animate } = useSidebar();
  return (
    <div className="flex items-center justify-start gap-3 group/sidebar py-2 px-1 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
      {/* Avatar — ring-slate-100 gives a seated, floated look */}
      <div className="shrink-0 ring-2 ring-slate-100 dark:ring-neutral-800 rounded-full">
        {link.icon}
      </div>
      <motion.div
        animate={{
          display: animate ? (open ? "flex" : "none") : "flex",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="flex flex-col min-w-0"
      >
        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
          {link.label}
        </span>
        {link.email && (
          <span className="text-[10px] text-neutral-400 tracking-wide truncate">
            {link.email}
          </span>
        )}
      </motion.div>
    </div>
  );
};

export const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="relative h-7 w-7 shrink-0">
        <Image
          src="/logo-black.png"
          alt="Logo"
          fill
          className="object-contain rounded-full"
        />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        TrustMed
      </motion.span>
    </Link>
  );
};
