"use client";
import { useRef } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { useInView, motion } from "framer-motion";

export default function FeaturedSectionStats() {
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
    <section className="max-w-7xl mx-auto text-left py-8 px-4 md:px-8">
      <div className="px-4">
        {/* Header removed to avoid collision with Hero text */}

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-8">
          <div>
            <p className="text-3xl font-medium text-gray-900">AES-256</p>
            <p className="text-gray-500 text-md">Encryption Standard</p>
          </div>
          <div>
            <p className="text-3xl font-medium text-gray-900">100%</p>
            <p className="text-gray-500 text-md">User Data Control</p>
          </div>
          <div>
            <p className="text-3xl font-medium text-gray-900">HIPAA</p>
            <p className="text-gray-500 text-md">Compliance Ready</p>
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
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBlue)"
              isAnimationActive={false} // Disable Recharts animation
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
