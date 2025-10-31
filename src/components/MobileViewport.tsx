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
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-[430px] h-[932px] bg-white rounded-[3rem] shadow-2xl border-[14px] border-gray-800 overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-800 rounded-b-3xl z-10"></div>
        <div className="w-full h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
