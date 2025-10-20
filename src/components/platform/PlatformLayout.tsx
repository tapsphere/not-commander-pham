import { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut, Palette, Building2, Store, TestTube } from 'lucide-react';
import { toast } from 'sonner';

export const PlatformLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check for demo mode
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      const demoRole = localStorage.getItem('demoRole');
      
      if (isDemoMode && demoRole) {
        console.log('Demo mode active:', demoRole);
        setUserRole(demoRole);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user found, redirecting to auth');
        navigate('/auth');
        return;
      }

      console.log('User found:', user.id);

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (roleError) {
        console.error('Role fetch error:', roleError);
        toast.error('Failed to load user role');
        navigate('/auth');
        return;
      }

      if (!roleData) {
        console.log('No role found for user');
        toast.error('No role assigned. Please sign up again.');
        navigate('/auth');
        return;
      }

      console.log('Role found:', roleData.role);
      setUserRole(roleData.role);
    } catch (error) {
      console.error('Auth check failed:', error);
      toast.error('Authentication failed');
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    // Clear demo mode
    localStorage.removeItem('demoMode');
    localStorage.removeItem('demoRole');
    await supabase.auth.signOut();
    toast.success('Signed out');
    navigate('/auth');
  };

  const isCreator = userRole === 'creator';
  const isBrand = userRole === 'brand';

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-neon-green">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Nav */}
      <header className="border-b border-neon-green/30 bg-gray-900/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--neon-green))' }}>
              {isCreator ? 'Creator Studio' : 'Brand Hub'}
            </h1>
            
            <nav className="flex gap-4">
              {isCreator && (
                <>
                  <Button
                    variant={location.pathname === '/platform/creator' ? 'default' : 'ghost'}
                    onClick={() => navigate('/platform/creator')}
                    className="gap-2"
                  >
                    <Palette className="w-4 h-4" />
                    My Templates
                  </Button>
                  <Button
                    variant={location.pathname === '/platform/validator-test' ? 'default' : 'ghost'}
                    onClick={() => navigate('/platform/validator-test')}
                    className="gap-2"
                  >
                    <TestTube className="w-4 h-4" />
                    Test Validators
                  </Button>
                </>
              )}
              
              {isBrand && (
                <>
                  <Button
                    variant={location.pathname === '/platform/brand' ? 'default' : 'ghost'}
                    onClick={() => navigate('/platform/brand')}
                    className="gap-2"
                  >
                    <Building2 className="w-4 h-4" />
                    Dashboard
                  </Button>
                  <Button
                    variant={location.pathname === '/platform/marketplace' ? 'default' : 'ghost'}
                    onClick={() => navigate('/platform/marketplace')}
                    className="gap-2"
                  >
                    <Store className="w-4 h-4" />
                    Marketplace
                  </Button>
                </>
              )}
            </nav>
          </div>

          <Button variant="ghost" onClick={handleSignOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};
