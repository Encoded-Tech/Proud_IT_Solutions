// "use client";

// import { motion, AnimatePresence } from "framer-motion";
// import { ShoppingBag, Sparkles, MousePointer2, X } from "lucide-react";
// import Link from "next/link";
// import { useState } from "react";

// export default function LaunchNotice() {
//   const [isVisible, setIsVisible] = useState(true);

//   if (!isVisible) return null;

//   return (
//     <AnimatePresence>
//       {isVisible && (
//         <motion.div
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
//           transition={{
//             duration: 0.5,
//             ease: [0.22, 1, 0.36, 1],
//           }}
//           className="relative w-full bg-gradient-to-r from-red-700 via-red-600 to-red-700"
//         >
//           {/* Ambient glow */}
//           <motion.div
//             aria-hidden
//             className="pointer-events-none absolute inset-0"
//             animate={{ opacity: [0.2, 0.4, 0.2] }}
//             transition={{
//               duration: 4,
//               repeat: Infinity,
//               ease: "easeInOut",
//             }}
//             style={{
//               background:
//                 "radial-gradient(55% 55% at 50% 0%, rgba(239,68,68,0.3), transparent)",
//             }}
//           />

//           {/* Close Button - Positioned on outer container */}
//           <motion.button
//             onClick={() => setIsVisible(false)}
//             whileHover={{ scale: 1.1, rotate: 90 }}
//             whileTap={{ scale: 0.9 }}
//             className="
//               absolute right-2 top-2 sm:right-4 sm:top-4 z-10
//               flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center
//               rounded-full
//               bg-white/95
//               text-red-600
//               shadow-lg shadow-black/20
//               ring-2 ring-white/50
//               backdrop-blur-sm
//               transition-all
//               hover:bg-white hover:shadow-xl hover:ring-red-200
//             "
//             aria-label="Close announcement"
//           >
//             <X className="h-4 w-4 sm:h-5 sm:w-5" />
//           </motion.button>

//           <div className="relative mx-auto max-w-7xl px-3 sm:px-4 py-3 sm:py-4">
//             <motion.div
//               initial={{ scale: 0.98 }}
//               animate={{ scale: 1 }}
//               transition={{
//                 delay: 0.1,
//                 duration: 0.4,
//                 ease: [0.22, 1, 0.36, 1],
//               }}
//               className="
//                 relative overflow-visible rounded-xl sm:rounded-2xl
//                 border border-white/40
//                 bg-white/95
//                 px-3 sm:px-6 py-3 sm:py-4
//                 shadow-lg
//                 backdrop-blur-sm
//               "
//             >
//               <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-100/30 to-transparent rounded-xl sm:rounded-2xl" />

//               <div className="relative flex flex-col items-center gap-3 sm:gap-4 sm:flex-row">
//                 {/* Icon */}
//                 <motion.div
//                   initial={{ y: -4 }}
//                   animate={{ y: [-4, 1, 0] }}
//                   transition={{
//                     duration: 0.5,
//                     ease: [0.22, 1, 0.36, 1],
//                   }}
//                   className="flex-shrink-0"
//                 >
//                   <div
//                     className="relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl 
//                     bg-gradient-to-br from-emerald-500 to-emerald-700 
//                     shadow-md shadow-emerald-500/30"
//                   >
//                     <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-sm" />
//                   </div>
//                 </motion.div>

//                 {/* Text */}
//                 <div className="flex-1 text-center sm:text-left px-2 sm:px-0">
//                   <h1 className="text-sm sm:text-base md:text-lg font-extrabold tracking-tight text-red-900">
//                     🎉 WE ARE LIVE — START SHOPPING NOW
//                   </h1>

//                   <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs md:text-base font-semibold leading-relaxed text-red-700">
//                     Online store is officially open!{" "}
//                     <span className="text-red-900">Exclusive launch offers</span> are
//                     live — <span className="text-red-900">grab deals before they&apos;re gone</span>.
//                   </p>
//                 </div>

//                 {/* CTA with Animated Cursors */}
//                 <div className="relative flex-shrink-0">
//                   {/* Animated Cursor Pointer 1 - Pointing DOWN from top */}
//                   <motion.div
//                     className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 sm:-left-10 sm:-top-6 sm:translate-x-0 z-10"
//                     animate={{
//                       y: [0, 8, 0],
//                       rotate: [180, 190, 180],
//                     }}
//                     transition={{
//                       duration: 1.5,
//                       repeat: Infinity,
//                       ease: "easeInOut",
//                     }}
//                   >
//                     <MousePointer2 className="h-7 w-7 sm:h-8 sm:w-8 fill-yellow-400 text-gray-900 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
//                     {/* Click ripple effect */}
//                     <motion.div
//                       className="absolute left-1/2 top-full -translate-x-1/2 h-3 w-3 rounded-full bg-yellow-400"
//                       animate={{
//                         scale: [1, 1.5, 1],
//                         opacity: [1, 0, 1],
//                       }}
//                       transition={{
//                         duration: 1.5,
//                         repeat: Infinity,
//                         ease: "easeInOut",
//                       }}
//                     />
//                   </motion.div>

//                   {/* Animated Cursor Pointer 2 - Pointing UP from bottom */}
//                   <motion.div
//                     className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 sm:-bottom-8 sm:-right-10 sm:left-auto sm:translate-x-0 z-10"
//                     animate={{
//                       y: [0, -8, 0],
//                       rotate: [0, -10, 0],
//                     }}
//                     transition={{
//                       duration: 1.8,
//                       repeat: Infinity,
//                       ease: "easeInOut",
//                       delay: 0.4,
//                     }}
//                   >
//                     <MousePointer2 className="h-7 w-7 sm:h-8 sm:w-8 fill-amber-400 text-gray-800 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
//                     <motion.div
//                       className="absolute left-1/2 -top-1 -translate-x-1/2 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-amber-400"
//                       animate={{
//                         scale: [1, 1.4, 1],
//                         opacity: [1, 0, 1],
//                       }}
//                       transition={{
//                         duration: 1.8,
//                         repeat: Infinity,
//                         ease: "easeInOut",
//                         delay: 0.4,
//                       }}
//                     />
//                   </motion.div>

//                   {/* Pulsing ring around button */}
//                   <motion.div
//                     className="pointer-events-none absolute inset-0 rounded-full"
//                     animate={{
//                       scale: [1, 1.15, 1],
//                       opacity: [0.5, 0, 0.5],
//                     }}
//                     transition={{
//                       duration: 2,
//                       repeat: Infinity,
//                       ease: "easeInOut",
//                     }}
//                   >
//                     <div className="h-full w-full rounded-full border-2 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)]" />
//                   </motion.div>

//                   {/* The actual button */}
//                   <motion.div
//                     whileHover={{ scale: 1.06 }}
//                     whileTap={{ scale: 0.97 }}
//                   >
//                     <Link
//                       href="/shop"
//                       className="
//                         relative
//                         inline-flex items-center gap-1.5 sm:gap-2
//                         rounded-full
//                         bg-gradient-to-r from-emerald-500 to-emerald-700
//                         px-4 py-2 sm:px-6 sm:py-2.5
//                         text-[11px] sm:text-xs md:text-sm
//                         font-extrabold
//                         tracking-wide
//                         text-white
//                         shadow-lg shadow-emerald-600/30
//                         ring-1 ring-emerald-400/40
//                         transition-all
//                         hover:shadow-xl hover:shadow-emerald-600/40
//                       "
//                     >
//                       <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
//                       <span className="whitespace-nowrap">START SHOPPING</span>

//                       {/* Shine effect on hover */}
//                       <motion.div
//                         className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
//                         initial={{ x: "-100%" }}
//                         whileHover={{ x: "100%" }}
//                         transition={{ duration: 0.6 }}
//                       />
//                     </Link>
//                   </motion.div>
//                 </div>
//               </div>

//               {/* Promo strip */}
//               <motion.div
//                 animate={{ opacity: [0.6, 1, 0.6] }}
//                 transition={{ duration: 2.5, repeat: Infinity }}
//                 className="mt-2 sm:mt-3 text-center text-[9px] sm:text-[10px] md:text-xs font-bold tracking-wide text-red-800"
//               >
//                 🚀 LAUNCH OFFER AHEAD — LIMITED STOCK · LIMITED TIME
//               </motion.div>
//             </motion.div>
//           </div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }


"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Sparkles, MousePointer2, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LaunchNotice() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
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

          {/* Close Button - Properly positioned for all screens */}
          <motion.button
            onClick={() => setIsVisible(false)}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="
              absolute right-2 top-2 md:right-3 md:top-3 lg:right-4 lg:top-4 z-10
              flex h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 items-center justify-center
              rounded-full
              bg-white/95
              text-red-600
              shadow-lg shadow-black/20
              ring-1 ring-white/50
              backdrop-blur-sm
              transition-all
              hover:bg-white hover:shadow-xl hover:ring-red-200
            "
            aria-label="Close announcement"
          >
            <X className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5" />
          </motion.button>

          <div className="relative mx-auto max-w-7xl px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4">
            <motion.div
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.1,
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                relative overflow-visible rounded-lg sm:rounded-xl md:rounded-2xl
                border border-white/40
                bg-white/95
                px-2.5 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4
                shadow-lg
                backdrop-blur-sm
              "
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-100/30 to-transparent rounded-lg sm:rounded-xl md:rounded-2xl" />

              <div className="relative flex flex-col items-center gap-2 sm:gap-3 md:gap-4 lg:flex-row">
                {/* Icon - Scales properly on mobile */}
                <motion.div
                  initial={{ y: -4 }}
                  animate={{ y: [-4, 1, 0] }}
                  transition={{
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex-shrink-0"
                >
                  <div
                    className="relative flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 items-center justify-center rounded-lg md:rounded-xl 
                    bg-gradient-to-br from-emerald-500 to-emerald-700 
                    shadow-md shadow-emerald-500/30"
                  >
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white drop-shadow-sm" />
                  </div>
                </motion.div>

                {/* Text - Better hierarchy on mobile */}
                <div className="flex-1 text-center lg:text-left px-1 sm:px-2 md:px-0">
                  <h1 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold tracking-tight text-red-900 leading-tight">
                    WE ARE LIVE — START SHOPPING NOW 🎉 
                  </h1>

                  <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm lg:text-base font-semibold leading-snug sm:leading-relaxed text-red-700">
                    Online store is officially open!{" "}
                    <span className="text-red-900">Exclusive launch offers</span> are
                    live — <span className="text-red-900 whitespace-nowrap">grab deals before they&apos;re gone</span>.
                  </p>
                </div>

                {/* CTA with Animated Cursors - Responsive positioning */}
                <div className="relative flex-shrink-0 my-4 md:my-4 lg:my-0 lg:mt-auto">
                  {/* Animated Cursor Pointer 1 - Hidden on very small screens, adjusted for larger */}
                  <motion.div
                    className="pointer-events-none absolute -top-4 -left-1 md:-top-7 md:-left-1 -translate-x-1/2 lg:-left-6 lg:-top-7 lg:translate-x-0 z-10"
                    animate={{
                      y: [0, 8, 0],
                      rotate: [180, 190, 180],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <MousePointer2 className="h-4 w-4  sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 fill-yellow-400 text-gray-900 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                    {/* Click ripple effect */}
                    <motion.div
                      className="absolute left-1/2 top-full -translate-x-1/2 h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-yellow-400"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [1, 0, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>

                  {/* Animated Cursor Pointer 2 - Hidden on very small screens */}
                  <motion.div
                    className="pointer-events-none absolute -bottom-4 -right-5 md:-bottom-6 md:-right-8 -translate-x-1/2  lg:-bottom-6 lg:-right-7 lg:left-auto lg:translate-x-0 z-10"
                    animate={{
                      y: [0, -8, 0],
                      rotate: [0, -10, 0],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.4,
                    }}
                  >
                    <MousePointer2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 fill-amber-400 text-gray-800 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                    <motion.div
                      className="absolute left-1/2 top-full -translate-x-1/2 h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-amber-400"
                      animate={{
                        scale: [1, 1.4, 1],
                        opacity: [1, 0, 1],
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.4,
                      }}
                    />
                  </motion.div>

                  {/* Pulsing ring around button - Scaled for mobile */}
                  <motion.div
                    className="pointer-events-none absolute inset-0 rounded-full"
                    animate={{
                      scale: [1, 1.12, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="h-full w-full rounded-full border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)] md:shadow-[0_0_20px_rgba(250,204,21,0.6)]" />
                  </motion.div>

                  {/* The actual button - Properly sized for all screens */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Link
                      href="/shop"
                      className="
                        relative
                        inline-flex items-center gap-1.5 sm:gap-2
                        rounded-full
                        bg-gradient-to-r from-emerald-500 to-emerald-700
                        px-3.5 py-1.5 sm:px-5 sm:py-2 md:px-6 md:py-2.5
                        text-[10px] sm:text-xs md:text-sm
                        font-extrabold
                        tracking-wide
                        text-white
                        shadow-lg shadow-emerald-600/30
                        ring-1 ring-emerald-400/40
                        transition-all
                        hover:shadow-xl hover:shadow-emerald-600/40
                      "
                    >
                      <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-white flex-shrink-0" />
                      <span className="whitespace-nowrap">START SHOPPING</span>

                      {/* Shine effect on hover */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6 }}
                      />
                    </Link>
                  </motion.div>
                </div>
              </div>

              {/* Promo strip - Better sizing for mobile */}
              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="mt-1.5 sm:mt-2 md:mt-3 text-center text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-bold tracking-wide text-red-800"
              >
                🚀 LAUNCH OFFER AHEAD — LIMITED STOCK · LIMITED TIME
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}