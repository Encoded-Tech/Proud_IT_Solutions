"use client";

import type { CSSProperties } from "react";

export function getAdminRowReveal(index: number): CSSProperties {
  return {
    animation: `adminTableRowReveal 0.3s ease-in-out ${index * 0.05}s both`,
  };
}

export function AdminTableRevealStyles() {
  return (
    <style jsx global>{`
      @keyframes adminTableRowReveal {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `}</style>
  );
}
