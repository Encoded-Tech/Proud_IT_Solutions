"use client";

import { motion } from "framer-motion";
import { Construction } from "lucide-react";

export default function LaunchNotice() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative w-full bg-gradient-to-r from-red-700 via-red-600 to-red-700"
    >
      {/* Ambient glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(55% 55% at 50% 0%, rgba(239,68,68,0.3), transparent)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-4">
        <motion.div
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.1,
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            relative overflow-hidden rounded-2xl
            border border-white/40
            bg-white/95
            px-6 py-4
            shadow-lg
            backdrop-blur-sm
          "
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-100/30 to-transparent" />

          <div className="relative flex flex-col items-center gap-4 sm:flex-row">
            
            {/* Icon */}
            <motion.div
              initial={{ y: -4 }}
              animate={{ y: [-4, 1, 0] }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex-shrink-0"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-700 shadow-sm">
                <Construction className="h-6 w-6 text-white" />
              </div>
            </motion.div>

            {/* Text */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-base md:text-lg font-extrabold tracking-tight text-red-900">
                PLATFORM UNDER CONSTRUCTION
              </h1>

              <p className="mt-1 text-xs md:text-lg font-bold leading-relaxed text-red-700">
                Preparing for{" "}
                <span className="text-red-900">business operations</span> and{" "}
                <span className="text-red-900">online sales</span>. Launching{" "}
                <span className="text-red-900">very soon</span>.
              </p>
            </div>

            {/* Badge */}
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0 rgba(239,68,68,0)",
                  "0 0 14px rgba(239,68,68,0.4)",
                  "0 0 0 rgba(239,68,68,0)",
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex-shrink-0 rounded-full"
            >
              <span
                className="
                  inline-flex items-center
                  rounded-full
                  bg-gradient-to-r from-red-600 to-red-700
                  px-4 py-1.5
                  text-[10px] md:text-xs
                  font-extrabold
                  tracking-widest
                  text-white
                "
              >
                COMING SOON
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
