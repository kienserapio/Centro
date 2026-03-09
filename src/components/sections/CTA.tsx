"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function CTA() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-primary rounded-[32px] p-12 md:p-24 text-center text-white shadow-2xl shadow-primary/30"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            Ready to modernize your community?
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            Join hundreds of Philippine subdivisions that have upgraded to a
            more efficient management style.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button variant="white" size="xl">
              Schedule a Demo
            </Button>
            <Button variant="secondary" size="xl">
              Contact Sales
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
