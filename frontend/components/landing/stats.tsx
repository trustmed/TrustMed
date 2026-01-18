"use client";
import { useRef } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useInView, motion } from "framer-motion";

export default function Stats() {
  const data = [
    { name: "Jan", value: 20 },
    { name: "Feb", value: 40 },
    { name: "Mar", value: 60 },
    { name: "Apr", value: 80 },
    { name: "May", value: 100 },
    { name: "Jun", value: 130 },
    { name: "Jul", value: 160 },
  ];

  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-50px" }); // Trigger when slightly in view

  return (
    <section className="max-w-7xl mx-auto text-center py-8 px-4 md:px-8">
      <div className="px-4">
        {/* Header removed to avoid collision with Hero text */}

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8">
          <div>
            <p className="text-3xl font-medium text-foreground">AES-256</p>
            <p className="text-muted-foreground text-md">Encryption Standard</p>
          </div>
          <div>
            <p className="text-3xl font-medium text-foreground">100%</p>
            <p className="text-muted-foreground text-md">User Data Control</p>
          </div>
          <div>
            <p className="text-3xl font-medium text-foreground">HIPAA</p>
            <p className="text-muted-foreground text-md">Compliance Ready</p>
          </div>
        </div>
      </div>

      {/* Area Chart */}
      <div ref={ref} className="w-full h-48 mt-8 relative">
        {/* Curtain Reveal Overlay */}
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: isInView ? "0%" : "100%" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute top-0 right-0 h-full bg-background z-10 block"
        />

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--primary)"
                  stopOpacity={0.4}
                />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="#003366"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBlue)"
              isAnimationActive={false} // Disable Recharts animation
              activeDot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
