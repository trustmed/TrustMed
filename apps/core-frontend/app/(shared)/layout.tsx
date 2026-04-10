"use client";

import { useState } from "react";
import { FileText, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarBody, useSidebar } from "@/components/ui/sidebar";

function SharedMedicalRecordsNavItem() {
  const { open, animate } = useSidebar();

  return (
    <div className="flex items-center justify-start gap-3 py-2.5 px-3 rounded-xl bg-blue-50 dark:bg-blue-900/25 text-blue-700 dark:text-blue-400 font-semibold">
      <span className="shrink-0 text-blue-600 dark:text-blue-400">
        <FileText className="h-5 w-5" />
      </span>
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-sm whitespace-pre inline-block"
      >
        Medical Records
      </motion.span>
    </div>
  );
}

export default function SharedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed inset-0 flex flex-col md:flex-row bg-[#F8FAFC] dark:bg-neutral-900 w-full overflow-hidden">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="flex flex-col gap-0 pb-6">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <div
              className={cn(
                "flex items-center pt-2",
                open ? "justify-between" : "justify-center",
              )}
            >
              {open && (
                <span className="font-medium text-black dark:text-white text-sm">
                  TrustMed
                </span>
              )}
              <button
                type="button"
                onClick={() => setOpen((value) => !value)}
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

            <div className="mt-8 flex flex-col gap-1.5">
              <SharedMedicalRecordsNavItem />
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
