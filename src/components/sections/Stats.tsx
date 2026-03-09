"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "100%", label: "Transparent Dues" },
  { value: "Real-time", label: "Announcements" },
  { value: "24/7", label: "Emergency Response" },
];

export function Stats() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-12 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white rounded-[20px] shadow-xl shadow-slate-200/50 p-8 md:p-12 flex flex-col md:flex-row justify-around items-center gap-8 text-center border border-slate-50"
      >
        {stats.map((stat, i) => (
          <div key={stat.label} className="flex items-center gap-8 md:gap-0 flex-col md:flex-row">
            {i > 0 && (
              <div className="hidden md:block w-px h-12 bg-slate-100 mr-8" />
            )}
            <div>
              <div className="text-3xl font-bold text-secondary mb-1">{stat.value}</div>
              <div className="text-slate-500 font-medium">{stat.label}</div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
