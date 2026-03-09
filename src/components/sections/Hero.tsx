"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { MacosWindow } from "@/components/ui/MacosWindow";

export function Hero() {
  return (
    <header className="relative pt-32 pb-8 min-h-[90vh] flex items-center">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/subdivision.webp"
          alt="Aerial view of a modern Philippine residential subdivision"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 hero-gradient" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-5xl md:text-6xl font-bold mb-4 leading-[1.1] max-w-4xl mx-auto bg-gradient-to-b from-white via-white/90 to-white/70 bg-clip-text text-transparent"
        >
          The Digital Heart of <br />
          Your Community
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="text-xl md:text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Centralize management, secure your neighborhood, and stay informed with
          the Philippines&apos; leading platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        >
          <Button
            variant="glass-primary"
            size="lg"
            className="hover:-translate-y-1"
          >
            Empower Your Subdivision
          </Button>
        </motion.div>

        {/* macOS dashboard window — bridges hero into stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="mt-14"
        >
          <MacosWindow
            src="/Dashboard Centro.png"
            alt="Centro resident dashboard overview"
            url="centro.io/dashboard"
            className="max-w-5xl mx-auto"
          />
        </motion.div>
      </div>
    </header>
  );
}
