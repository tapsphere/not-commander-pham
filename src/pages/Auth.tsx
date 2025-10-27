import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Palette, Building2, Mail, Eye, EyeOff } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password must be less than 128 characters'),
});

type UserRole = 'creator' | 'brand';

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('creator');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    // Check if this is a password recovery flow
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
    });
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    try {
      authSchema.parse({ email, password });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }
    
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

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('No user data returned from signup');
      }

      // Insert role - upsert to handle any race conditions gracefully
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: data.user.id, role: selectedRole })
        .select()
        .maybeSingle();

      // Handle role assignment errors gracefully
      if (roleError) {
        // Don't block signup for role errors - user can be assigned role later
        toast.warning('Account created, but role assignment needs attention');
      }

      // Wait for session to be established
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify session exists
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session not established. Please try signing in.');
      }

      toast.success('Account created! Redirecting...');
      
      // Small delay before navigation
      setTimeout(() => {
        navigate(selectedRole === 'creator' ? '/platform/creator' : '/platform/brand');
      }, 500);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    try {
      authSchema.parse({ email, password });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }
    
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get all user roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id);

      if (!rolesData || rolesData.length === 0) {
        // No roles assigned - they're just a player
        toast.success('Signed in as Player!');
        navigate('/lobby');
        return;
      }

      // If user has multiple roles, prioritize: brand > creator > player
      const roles = rolesData.map(r => r.role);
      let primaryRole = roles[0];
      
      if (roles.includes('brand')) primaryRole = 'brand';
      else if (roles.includes('creator')) primaryRole = 'creator';

      toast.success(`Signed in as ${primaryRole}!`);
      const route = primaryRole === 'creator' ? '/platform/creator' : '/platform/brand';
      navigate(route);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'azure') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/platform`,
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast.success('Password reset email sent! Check your inbox.');
      setShowForgotPassword(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Password updated successfully!');
      setIsPasswordRecovery(false);
      setNewPassword('');
      
      // Navigate to appropriate platform
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        const route = roleData?.role === 'creator' ? '/platform/creator' : '/platform/brand';
        navigate(route);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = async (role: 'creator' | 'brand') => {
    const DEMO_EMAIL = 'lian@tapsphere.io';
    const DEMO_PASSWORD = 'DemoTapSphere2024!';
    
    setLoading(true);
    try {
      // Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });

      if (signInError) {
        // If sign in fails, try to sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: 'TapSphere Demo Brand',
            }
          }
        });

        if (signUpError) throw signUpError;

        // Insert role for new user
        if (signUpData.user) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({ user_id: signUpData.user.id, role });

          if (roleError) throw roleError;

          // Update profile with demo data
          await supabase
            .from('profiles')
            .update({
              company_name: 'TapSphere',
              company_description: 'Demo brand account for platform demonstrations',
              full_name: 'TapSphere Demo Brand'
            })
            .eq('user_id', signUpData.user.id);
        }
      }

      localStorage.setItem('demoMode', 'true');
      localStorage.setItem('demoRole', role);
      
      toast.success(`Demo mode activated as ${role}!`);
      navigate(role === 'creator' ? '/platform/creator' : '/platform/brand');
    } catch (error: any) {
      toast.error(`Demo mode error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="w-full p-8 bg-gray-900 border-neon-green">
          <h1 className="text-2xl font-bold text-center mb-2" style={{ color: 'hsl(var(--neon-green))' }}>
            Creator & Brand Platform
          </h1>
          <p className="text-sm text-gray-400 text-center mb-6">
            {isPasswordRecovery ? 'Set your new password' : 'Sign in to manage templates & customizations'}
          </p>

          {/* Demo Mode Buttons */}
          {!isPasswordRecovery && (
            <div className="mb-6 space-y-2">
              <p className="text-xs text-gray-500 text-center mb-2">Quick Demo Access</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleDemoMode('brand')}
                  className="gap-2 border-neon-purple text-neon-purple hover:bg-neon-purple/10"
                >
                  <Building2 className="w-4 h-4" />
                  Demo as Brand
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDemoMode('creator')}
                  className="gap-2 border-neon-green text-neon-green hover:bg-neon-green/10"
                >
                  <Palette className="w-4 h-4" />
                  Demo as Creator
                </Button>
              </div>
              <Separator className="my-4" />
            </div>
          )}

        {isPasswordRecovery ? (
          <div className="space-y-4">
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <Label htmlFor="new-password" className="text-white">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-gray-800 border-gray-700 text-white pr-10"
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </div>
        ) : (
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            {!showForgotPassword ? (
              <>
                <div className="space-y-4 mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialSignIn('google')}
                    className="w-full gap-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialSignIn('azure')}
                    className="w-full gap-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none">
                      <path d="M0 0h10.931v10.931H0z" fill="#f25022"/>
                      <path d="M12.069 0H23v10.931H12.069z" fill="#7fba00"/>
                      <path d="M0 12.069h10.931V23H0z" fill="#00a4ef"/>
                      <path d="M12.069 12.069H23V23H12.069z" fill="#ffb900"/>
                    </svg>
                    Continue with Microsoft
                  </Button>
                </div>

                <Separator className="my-4" />

                <div className="text-center text-sm text-gray-400 mb-4">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Or continue with email
                </div>

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
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="signin-password" className="text-white">Password</Label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-xs text-neon-green hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-gray-800 border-gray-700 text-white pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Reset Password</h3>
                  <p className="text-sm text-gray-400">Enter your email to receive a password reset link</p>
                </div>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <Label htmlFor="reset-email" className="text-white">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full"
                  >
                    Back to Sign In
                  </Button>
                </form>
              </div>
            )}
          </TabsContent>

          <TabsContent value="signup">
            <div className="space-y-4 mb-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialSignIn('google')}
                className="w-full gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialSignIn('azure')}
                className="w-full gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none">
                  <path d="M0 0h10.931v10.931H0z" fill="#f25022"/>
                  <path d="M12.069 0H23v10.931H12.069z" fill="#7fba00"/>
                  <path d="M0 12.069h10.931V23H0z" fill="#00a4ef"/>
                  <path d="M12.069 12.069H23V23H12.069z" fill="#ffb900"/>
                </svg>
                Continue with Microsoft
              </Button>
            </div>

            <Separator className="my-4" />

            <div className="text-center text-sm text-gray-400 mb-4">
              <Mail className="w-4 h-4 inline mr-1" />
              Or sign up with email
            </div>

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
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showSignUpPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-gray-800 border-gray-700 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showSignUpPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        )}
        </Card>
      </div>
    </div>
  );
}
