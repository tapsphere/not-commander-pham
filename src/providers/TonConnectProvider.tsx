import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { ReactNode, useEffect } from 'react';

// Use hardcoded published URL for Telegram Mini App compatibility
const manifestUrl = 'https://86589c2d-84a5-4b0a-9c24-5f5a77fb6135.lovableproject.com/tonconnect-manifest.json';

interface TonConnectProviderProps {
  children: ReactNode;
}

export function TonConnectProvider({ children }: TonConnectProviderProps) {
  useEffect(() => {
    console.log('TON Connect manifest URL:', manifestUrl);
    // Test if manifest is accessible
    fetch(manifestUrl)
      .then(res => {
        console.log('Manifest fetch status:', res.status);
        return res.json();
      })
      .then(data => console.log('Manifest data:', data))
      .catch(err => console.error('Manifest fetch error:', err));
  }, []);

  return (
    <TonConnectUIProvider 
      manifestUrl={manifestUrl}
      actionsConfiguration={{
        twaReturnUrl: 'https://t.me/PlayOpsBot'
      }}
    >
      {children}
    </TonConnectUIProvider>
  );
}
