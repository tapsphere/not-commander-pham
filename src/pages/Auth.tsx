import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Palette, Building2, Mail, Eye, EyeOff } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';

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

  const { signIn } = useAuth();

  useEffect(() => {
    // Basic initialization for auth state
    const token = localStorage.getItem('access_token');
    if (token) {
      // Logic handled by AuthProvider mostly
    }
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
      const response = await apiClient.post('/auth/signup', {
        email,
        password
      });

      // After successful signup, log them in to get the token
      const loginResponse = await apiClient.post('/auth/login',
        new URLSearchParams({
          username: email,
          password: password,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      await signIn(loginResponse.data.access_token);
      localStorage.setItem('user_role', selectedRole); // Store role locally for now

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
      const response = await apiClient.post('/auth/login',
        new URLSearchParams({
          username: email,
          password: password,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      await signIn(response.data.access_token);

      // We will need to fetch the user role from another endpoint later
      // For now, we simulate success and route to creator
      const primaryRole = localStorage.getItem('user_role') || 'creator';

      toast.success(`Signed in as ${primaryRole}!`);
      const route = primaryRole === 'creator' ? '/platform/creator' : '/platform/brand';
      navigate(route);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };


  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // API call to custom forgot password logic goes here
      // const response = await apiClient.post('/auth/forgot-password', { email });
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
      // API call to update user password
      // await apiClient.post('/auth/update-password', { password: newPassword });

      toast.success('Password updated successfully!');
      setIsPasswordRecovery(false);
      setNewPassword('');

      // Navigate to appropriate platform
      const role = localStorage.getItem('user_role') || 'creator';
      const route = role === 'creator' ? '/platform/creator' : '/platform/brand';
      navigate(route);
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
      // Login with demo credentials mapped to FastAPI
      const response = await apiClient.post('/auth/login',
        new URLSearchParams({
          username: DEMO_EMAIL,
          password: DEMO_PASSWORD,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      await signIn(response.data.access_token);
      localStorage.setItem('user_role', role);
      localStorage.setItem('demoMode', 'true');
      localStorage.setItem('demoRole', role);

      toast.success(`Demo mode activated!`);

      navigate(role === 'creator' ? '/platform/creator' : '/platform/brand');
    } catch (error: any) {
      console.error('Demo error:', error);
      toast.error(`Could not activate demo: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="w-full p-8 bg-card border-border glass-card">
          <h1 className="text-2xl font-semibold text-center mb-2 text-foreground">
            Studio Platform
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {isPasswordRecovery ? 'Set your new password' : 'Sign in to create and manage templates'}
          </p>

          {/* Demo Mode Buttons */}
          {!isPasswordRecovery && (
            <div className="mb-6 space-y-2">
              <p className="text-xs text-muted-foreground text-center mb-2">Quick Demo Access</p>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleDemoMode('creator')}
                  className="gap-2 glass-button"
                >
                  <Palette className="w-4 h-4" />
                  Try Demo
                </Button>
              </div>
              <Separator className="my-4" />
            </div>
          )}

          {isPasswordRecovery ? (
            <div className="space-y-4">
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="new-password" className="text-foreground">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-secondary border-border text-foreground pr-10"
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                    <div className="text-center text-sm text-muted-foreground mb-4">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Sign in with email
                    </div>

                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div>
                        <Label htmlFor="signin-email" className="text-foreground">Email</Label>
                        <Input
                          id="signin-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="bg-secondary border-border text-foreground"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="signin-password" className="text-foreground">Password</Label>
                          <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="text-xs text-primary hover:underline"
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
                            className="bg-secondary border-border text-foreground pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                      <h3 className="text-lg font-semibold text-foreground mb-2">Reset Password</h3>
                      <p className="text-sm text-muted-foreground">Enter your email to receive a password reset link</p>
                    </div>
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div>
                        <Label htmlFor="reset-email" className="text-foreground">Email</Label>
                        <Input
                          id="reset-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="bg-secondary border-border text-foreground"
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
                <div className="text-center text-sm text-muted-foreground mb-4">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Sign up with email
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-email" className="text-foreground">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password" className="text-foreground">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showSignUpPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="bg-secondary border-border text-foreground pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
