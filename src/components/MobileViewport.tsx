import { ReactNode } from "react";

interface MobileViewportProps {
  children: ReactNode;
}

export function MobileViewport({ children }: MobileViewportProps) {
  return (
    <div className="min-h-screen bg-background flex items-start justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {children}
      </div>
    </div>
  );
}
