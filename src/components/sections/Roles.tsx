"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type RoleKey = "resident" | "admin" | "guard";

interface Role {
  key: RoleKey;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

const roles: Role[] = [
  {
    key: "resident",
    title: "Resident Dashboard",
    description:
      "Pay dues, view announcements, and register guests from your mobile phone.",
    image:
      "/Resident Dashboard.png",
    imageAlt: "Centro Resident Dashboard showing dues and announcements",
  },
  {
    key: "admin",
    title: "Admin Management",
    description:
      "Full control over accounting, resident lists, and community-wide broadcasts.",
    image:
      "/Admin Dashboard.png",  
    imageAlt: "Centro Admin Dashboard showing accounting and resident lists",
  },
  {
    key: "guard",
    title: "Guard Portal",
    description:
      "Quickly verify visitors via QR codes and manage vehicle entry logs in real-time.",
    image:
      "/Security Dashboard.png",
    imageAlt: "Centro Guard Portal showing QR visitor verification",
  },
];

export function Roles() {
  const [activeKey, setActiveKey] = useState<RoleKey>("resident");
  const activeRole = roles.find((r) => r.key === activeKey)!;

  return (
    <section id="dashboard" className="bg-white py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left: Role selector */}
          <div className="w-full lg:w-1/2">
            <motion.h2
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-secondary mb-8"
            >
              Tailored for every role.
            </motion.h2>

            <div className="space-y-4">
              {roles.map((role) => {
                const isActive = role.key === activeKey;
                return (
                  <motion.button
                    key={role.key}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setActiveKey(role.key)}
                    className={cn(
                      "w-full text-left p-6 rounded-r-custom transition-all duration-200 border-l-4",
                      isActive
                        ? "bg-sage border-secondary"
                        : "bg-white border-transparent border border-slate-100 hover:border-secondary/20"
                    )}
                  >
                    <h4
                      className={cn(
                        "font-bold mb-2 transition-colors",
                        isActive ? "text-secondary" : "text-slate-400"
                      )}
                    >
                      {role.title}
                    </h4>
                    <p
                      className={cn(
                        "text-[15px] transition-colors",
                        isActive ? "text-slate-700" : "text-slate-400"
                      )}
                    >
                      {role.description}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Right: Dashboard image */}
          <div className="w-full lg:w-1/2 relative">
            <div className="bg-slate-50 rounded-2xl p-4 shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={activeRole.image}
                    alt={activeRole.imageAlt}
                    width={700}
                    height={460}
                    className="rounded-custom border border-slate-200 shadow-inner w-full h-auto"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
