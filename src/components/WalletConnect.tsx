import { TonConnectButton, useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { useEffect } from 'react';
import { apiClient } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card } from './ui/card';

export function WalletConnect() {
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const linkWalletToProfile = async () => {
      try {
        if (!wallet) return;

        const walletAddress = wallet.account.address;

        if (!user) {
          // Auto-signup with wallet address
          const res = await apiClient.post('/api/auth/signup', {
            email: `${walletAddress}@ton.wallet`,
            password: crypto.randomUUID(), // Random password
          });

          const newUser = res.data;

          // Also update the profile with the wallet address
          await apiClient.put('/api/profiles/me', {
            wallet_address: walletAddress,
            full_name: `TON User ${walletAddress.slice(0, 6)}`,
          });

          toast({
            title: "Wallet Connected! 🎮",
            description: "Account created with your TON wallet",
          });
        } else {
          // Update existing user profile with wallet
          await apiClient.put('/api/profiles/me', {
            wallet_address: walletAddress
          });

          toast({
            title: "Wallet Linked! 🎮",
            description: "Your TON wallet is now connected",
          });
        }
      } catch (error) {
        // Handle errors silently
      }
    };

    linkWalletToProfile();
  }, [wallet, toast, user]);

  return (
    <Card className="p-6 bg-gray-900/50 border-neon-green/30">
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-white">Connect TON Wallet</h3>
          <p className="text-sm text-gray-400">
            {typeof window !== 'undefined' && window.innerWidth <= 768
              ? 'Connect your TON wallet to access the game grid'
              : 'Scan QR code with mobile wallet or install Tonkeeper extension'}
          </p>
        </div>

        <div className="flex justify-center">
          <TonConnectButton />
        </div>

        {!wallet && (
          <div className="text-xs text-gray-500 text-center space-y-2">
            <p>💻 Desktop: Scan QR code or install wallet extension</p>
            <p>📱 Mobile: Use Telegram Wallet or Tonkeeper app</p>
          </div>
        )}

        {wallet && (
          <div className="text-center">
            <p className="text-xs text-neon-green">
              ✓ Connected: {wallet.account.address.slice(0, 8)}...{wallet.account.address.slice(-6)}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
