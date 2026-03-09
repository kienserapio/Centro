"use client";

import { Megaphone, Receipt, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { motion, type Variants } from "framer-motion";

const features = [
  {
    icon: <Megaphone className="w-7 h-7" />,
    title: "Announcements",
    description:
      "Instantly reach every home with digital circulars, meeting invites, and community updates.",
  },
  {
    icon: <Receipt className="w-7 h-7" />,
    title: "Dues & Payments",
    description:
      "Automated billing and secure digital payments. Track community funds with total transparency.",
  },
  {
    icon: <ShieldAlert className="w-7 h-7" />,
    title: "Emergency Alerts",
    description:
      "One-tap panic button for residents linked directly to subdivision security and first responders.",
  },
];

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function Features() {
  return (
    <section
      id="features"
      className="py-32 max-w-7xl mx-auto px-6 lg:px-12"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-20"
      >
        <Badge variant="primary" className="mb-4">
          Capabilities
        </Badge>
        <h2 className="text-4xl font-bold text-secondary mt-4">
          Community Essentials
        </h2>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {features.map((feature) => (
          <motion.div key={feature.title} variants={cardVariants}>
            <Card
              variant="glass"
              className="p-10 hover:shadow-2xl hover:shadow-secondary/10 transition-all h-full"
            >
              <div className="w-14 h-14 bg-secondary text-white rounded-xl flex items-center justify-center mb-8">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-secondary mb-4">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
