import { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut, Palette, Building2, Store, TestTube, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const PlatformLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [activeRole, setActiveRole] = useState<string | null>(null);
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
        setUserRoles([demoRole]);
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

      const { data: rolesData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (roleError) {
        console.error('Role fetch error:', roleError);
        toast.error('Failed to load user roles');
        navigate('/auth');
        return;
      }

      if (!rolesData || rolesData.length === 0) {
        console.log('No roles found for user');
        toast.error('No role assigned. Please sign up again.');
        navigate('/auth');
        return;
      }

      const roles = rolesData.map(r => r.role);
      console.log('Roles found:', roles);
      setUserRoles(roles);
      setActiveRole(roles[0]); // Set first role as default active role
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

  const hasMultipleRoles = userRoles.length > 1;
  const isCreator = activeRole === 'creator';
  const isBrand = activeRole === 'brand';

  const toggleRole = () => {
    if (hasMultipleRoles) {
      const newRole = activeRole === 'creator' ? 'brand' : 'creator';
      setActiveRole(newRole);
      // Navigate to the appropriate dashboard when switching roles
      if (newRole === 'creator') {
        navigate('/platform/creator');
      } else {
        navigate('/platform/brand');
      }
    }
  };

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
        <div className="max-w-[425px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold" style={{ color: 'hsl(var(--neon-green))' }}>
              {isCreator ? 'Creator Studio' : 'Brand Hub'}
            </h1>
            {hasMultipleRoles && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleRole}
                className="gap-2 w-full"
              >
                <RefreshCw className="w-3 h-3" />
                Switch to {isCreator ? 'Brand' : 'Creator'}
              </Button>
            )}
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Mobile Nav */}
        <nav className="max-w-[425px] mx-auto px-4 pb-3 flex gap-2 overflow-x-auto">
          {isCreator && (
            <>
              <Button
                variant={location.pathname === '/platform/creator' ? 'default' : 'ghost'}
                onClick={() => navigate('/platform/creator')}
                size="sm"
                className="gap-2 whitespace-nowrap"
              >
                <Palette className="w-4 h-4" />
                Templates
              </Button>
              <Button
                variant={location.pathname === '/platform/validator-test' ? 'default' : 'ghost'}
                onClick={() => navigate('/platform/validator-test')}
                size="sm"
                className="gap-2 whitespace-nowrap"
              >
                <TestTube className="w-4 h-4" />
                Test
              </Button>
            </>
          )}
          
          {isBrand && (
            <>
              <Button
                variant={location.pathname === '/platform/brand' ? 'default' : 'ghost'}
                onClick={() => navigate('/platform/brand')}
                size="sm"
                className="gap-2 whitespace-nowrap"
              >
                <Building2 className="w-4 h-4" />
                Dashboard
              </Button>
              <Button
                variant={location.pathname === '/platform/marketplace' ? 'default' : 'ghost'}
                onClick={() => navigate('/platform/marketplace')}
                size="sm"
                className="gap-2 whitespace-nowrap"
              >
                <Store className="w-4 h-4" />
                Marketplace
              </Button>
            </>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-[425px] mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};
