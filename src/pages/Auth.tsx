import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Palette, Building2 } from 'lucide-react';

type UserRole = 'creator' | 'brand';

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('creator');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/platform`,
          data: { role: selectedRole }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Insert role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: data.user.id, role: selectedRole });

        if (roleError) throw roleError;

        toast.success('Account created! Redirecting...');
        navigate(selectedRole === 'creator' ? '/platform/creator' : '/platform/brand');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      toast.success('Signed in!');
      const route = roleData?.role === 'creator' ? '/platform/creator' : '/platform/brand';
      navigate(route);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-gray-900 border-neon-green">
        <h1 className="text-3xl font-bold text-center mb-6" style={{ color: 'hsl(var(--neon-green))' }}>
          Platform Access
        </h1>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="signin-email" className="text-white">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="signin-password" className="text-white">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label className="text-white mb-3 block">I am a...</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Card
                    className={`p-4 cursor-pointer transition-all ${
                      selectedRole === 'creator'
                        ? 'border-neon-green bg-neon-green/10'
                        : 'border-gray-700 bg-gray-800'
                    }`}
                    onClick={() => setSelectedRole('creator')}
                  >
                    <Palette className="w-8 h-8 mb-2" style={{ color: 'hsl(var(--neon-green))' }} />
                    <h3 className="font-semibold text-white">Creator</h3>
                    <p className="text-xs text-gray-400 mt-1">Build game templates</p>
                  </Card>
                  <Card
                    className={`p-4 cursor-pointer transition-all ${
                      selectedRole === 'brand'
                        ? 'border-neon-green bg-neon-green/10'
                        : 'border-gray-700 bg-gray-800'
                    }`}
                    onClick={() => setSelectedRole('brand')}
                  >
                    <Building2 className="w-8 h-8 mb-2" style={{ color: 'hsl(var(--neon-green))' }} />
                    <h3 className="font-semibold text-white">Brand</h3>
                    <p className="text-xs text-gray-400 mt-1">Customize & deploy</p>
                  </Card>
                </div>
              </div>
              <div>
                <Label htmlFor="signup-email" className="text-white">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="signup-password" className="text-white">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
