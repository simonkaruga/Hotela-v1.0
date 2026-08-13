import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}
