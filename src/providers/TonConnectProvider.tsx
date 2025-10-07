import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { ReactNode } from 'react';

// Use hardcoded published URL for Telegram Mini App compatibility
const manifestUrl = 'https://86589c2d-84a5-4b0a-9c24-5f5a77fb6135.lovableproject.com/tonconnect-manifest.json';

interface TonConnectProviderProps {
  children: ReactNode;
}

export function TonConnectProvider({ children }: TonConnectProviderProps) {
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      {children}
    </TonConnectUIProvider>
  );
}
