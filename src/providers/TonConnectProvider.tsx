import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { ReactNode, useEffect } from 'react';

// Use origin for development to support any port dynamically
const manifestUrl = window.location.origin + '/tonconnect-manifest.json';

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
