import { ReactNode } from "react";

interface MobileViewportProps {
  children: ReactNode;
}

/**
 * MobileViewport Component
 * Provides a mobile-first responsive container with proper scrolling
 * FIX: Added overflow-y-auto to enable vertical scrolling when content exceeds viewport
 */
export function MobileViewport({ children }: MobileViewportProps) {
  return (
    <div className="min-h-screen bg-background flex items-start justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md mx-auto">
        {children}
      </div>
    </div>
  );
}
