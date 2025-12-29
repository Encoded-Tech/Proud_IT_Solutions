// // components/ui/ContinueShoppingLink.tsx
// "use client";

// import Link from "next/link";
// import { ArrowLeftIcon } from "lucide-react";

// interface ContinueShoppingLinkProps {
//   href?: string; // default can be '/shop'
//   className?: string; // allow custom styling if needed
// }

// export default function ContinueShoppingLink({
//   href = "/shop",
//   className = "",
// }: ContinueShoppingLinkProps) {
//   return (
//  <Link
//   href={href}
//   className={`inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:underline transition group ${className}`}
// >
//   <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
//   Continue shopping
// </Link>

//   );
// }


"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

interface ContinueShoppingLinkProps {
  href?: string; // default can be '/shop'
  className?: string; // allow extra styling if needed
}

export default function ContinueShoppingLink({
  href = "/shop",
  className = "",
}: ContinueShoppingLinkProps) {
  return (
    <Link
      href={href}
      className={`
        inline-flex items-center gap-2 px-4 py-2 
        bg-red-600 text-white font-medium text-sm
        rounded-full shadow-sm
        hover:bg-red-700 hover:shadow-md
        transition-all duration-200 ease-in-out
        group ${className}
      `}
    >
      <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
      Continue shopping
    </Link>
  );
}
