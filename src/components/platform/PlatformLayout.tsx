import { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut, Layers, Store, TestTube, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';
import { useGlobalTheme } from '@/hooks/useGlobalTheme';

export const PlatformLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const { isDarkMode, toggleTheme } = useGlobalTheme();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check for demo mode
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      
      if (isDemoMode) {
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

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
        toast.error('No role assigned. Please sign up again.');
        navigate('/auth');
        return;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      toast.error('Authentication failed');
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    localStorage.removeItem('demoMode');
    localStorage.removeItem('demoRole');
    await supabase.auth.signOut();
    toast.success('Signed out');
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Nav */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-semibold text-foreground">
              Studio
            </h1>
            
            <nav className="flex gap-2">
              <Button
                variant={location.pathname === '/platform/dashboard' ? 'default' : 'ghost'}
                onClick={() => navigate('/platform/dashboard')}
                className="gap-2"
                size="sm"
              >
                <Store className="w-4 h-4" />
                Dashboard
              </Button>
              <Button
                variant={location.pathname.includes('/creator') ? 'default' : 'ghost'}
                onClick={() => navigate('/platform/creator')}
                className="gap-2"
                size="sm"
              >
                <Layers className="w-4 h-4" />
                Studio
              </Button>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
            <Button variant="ghost" onClick={handleSignOut} className="gap-2" size="sm">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};
