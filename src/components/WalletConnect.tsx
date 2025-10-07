import { TonConnectButton, useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card } from './ui/card';

export function WalletConnect() {
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const { toast } = useToast();

  useEffect(() => {
    console.log('TON Connect UI status:', tonConnectUI.connected);
    console.log('Wallet:', wallet);
  }, [tonConnectUI, wallet]);

  useEffect(() => {
    const linkWalletToProfile = async () => {
      if (!wallet) return;

      const walletAddress = wallet.account.address;
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Auto-signup with wallet address
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: `${walletAddress}@ton.wallet`,
          password: crypto.randomUUID(), // Random password
          options: {
            data: {
              wallet_address: walletAddress,
              full_name: `TON User ${walletAddress.slice(0, 6)}`,
            },
          },
        });

        if (signUpError) {
          console.error('Wallet signup error:', signUpError);
          toast({
            title: "Connection Failed",
            description: "Could not link wallet to account",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Wallet Connected! 🎮",
          description: "Account created with your TON wallet",
        });
      } else {
        // Update existing user profile with wallet
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ wallet_address: walletAddress })
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Wallet link error:', updateError);
        } else {
          toast({
            title: "Wallet Linked! 🎮",
            description: "Your TON wallet is now connected",
          });
        }
      }
    };

    linkWalletToProfile();
  }, [wallet, toast]);

  return (
    <Card className="p-6 bg-gray-900/50 border-neon-green/30">
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-white">Connect TON Wallet</h3>
          <p className="text-sm text-gray-400">
            Connect your TON wallet to access the game grid
          </p>
        </div>

        <div className="flex justify-center">
          <TonConnectButton />
        </div>

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
