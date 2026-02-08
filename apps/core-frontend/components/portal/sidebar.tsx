"use client";
import { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "@/components/ui/sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LinkItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface UserProfile {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarNavProps {
  children: React.ReactNode;
  links: LinkItem[];
  userProfile: UserProfile;
}

export function SidebarNav({ children, links, userProfile }: Readonly<SidebarNavProps>) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 overflow-hidden",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <div className="w-full cursor-pointer">
                  <UserProfileTrigger link={userProfile} />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" side="top" align="start" sideOffset={10}>
                <Button
                  variant="secondary"
                  onClick={() => console.log("Logout clicked")}
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
      <div className="flex flex-1">
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
    <div
      className={cn(
        "flex items-center justify-start gap-2 group/sidebar py-2"
      )}
    >
      {link.icon}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
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

export const LogoIcon = () => {
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
    </Link>
  );
};
