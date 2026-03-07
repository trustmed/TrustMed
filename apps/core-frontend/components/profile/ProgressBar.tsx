"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProgressBarProps {
    steps: { label: string; id: string }[];
    currentStep: number;
}

export function ProgressBar({ steps, currentStep }: ProgressBarProps) {
    const progress = ((currentStep + 1) / steps.length) * 100;

    return (
        <div className="w-full space-y-4">
            <div className="flex justify-between text-sm font-medium text-muted-foreground">
                {steps.map((step, index) => (
                    <span
                        key={step.id}
                        className={cn(
                            "transition-colors duration-300",
                            index <= currentStep ? "text-primary" : ""
                        )}
                    >
                        {step.label}
                    </span>
                ))}
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />
            </div>
        </div>
    );
}
