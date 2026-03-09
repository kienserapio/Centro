"use client";

import { motion, type Variants } from "framer-motion";

const steps = [
  {
    number: "1",
    title: "Digitize",
    description: "Import your resident data and historical ledgers securely.",
  },
  {
    number: "2",
    title: "Connect",
    description: "Invite residents to download the app and join the digital circle.",
  },
  {
    number: "3",
    title: "Thrive",
    description: "Enjoy seamless management and a safer, unified neighborhood.",
  },
];

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.2 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function Onboarding() {
  return (
    <section id="how-it-works" className="py-32 max-w-7xl mx-auto px-6 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-20"
      >
        <h2 className="text-4xl font-bold text-secondary">Simple 1-2-3 Onboarding</h2>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-12 relative"
      >
        {/* Connector line */}
        <div className="hidden md:block absolute top-10 left-0 w-full h-0.5 bg-slate-100 -z-10" />

        {steps.map((step) => (
          <motion.div key={step.number} variants={itemVariants} className="text-center">
            <div className="w-20 h-20 bg-white border-2 border-primary text-primary text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-6 shadow-md shadow-primary/10">
              {step.number}
            </div>
            <h3 className="text-xl font-bold text-secondary mb-3">{step.title}</h3>
            <p className="text-slate-600">{step.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
