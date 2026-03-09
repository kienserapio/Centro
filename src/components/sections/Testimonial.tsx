"use client";

import { motion } from "framer-motion";

export function Testimonial() {
  return (
    <section className="bg-sage py-24">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.blockquote
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-3xl md:text-5xl font-bold text-secondary leading-tight italic">
            &ldquo;Centro is the modern standard for Philippine neighborhoods,
            bringing trust and technology to the heart of every home.&rdquo;
          </p>
        </motion.blockquote>
      </div>
    </section>
  );
}
