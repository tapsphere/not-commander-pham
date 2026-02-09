import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut, Layers, Store, Moon, Sun, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useGlobalTheme } from '@/hooks/useGlobalTheme';

/* ── Compliance Mode Context ── */
interface ComplianceModeContextType {
  isComplianceMode: boolean;
  toggleComplianceMode: () => void;
}
const ComplianceModeContext = createContext<ComplianceModeContextType>({ isComplianceMode: false, toggleComplianceMode: () => {} });
export const useComplianceMode = () => useContext(ComplianceModeContext);

export const PlatformLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isComplianceMode, setIsComplianceMode] = useState(false);
  const { isDarkMode, toggleTheme } = useGlobalTheme();
  const toggleComplianceMode = () => setIsComplianceMode(prev => !prev);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await supabase.auth.getUser();
    } catch (error) {
      // Silent — no redirect needed
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
            <h1 className="text-xl font-semibold text-foreground tracking-wide">
              PLAYOPS
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
            {/* Compliance Toggle */}
            <Button
              variant={isComplianceMode ? 'default' : 'ghost'}
              size="sm"
              onClick={toggleComplianceMode}
              className={`gap-1.5 transition-colors ${isComplianceMode ? 'bg-[hsl(152,69%,31%)] hover:bg-[hsl(152,69%,26%)] text-white' : 'text-muted-foreground hover:text-foreground'}`}
              title={isComplianceMode ? 'Switch to Talent Mode' : 'Switch to Compliance Mode'}
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs">{isComplianceMode ? 'Compliance' : 'Audit'}</span>
            </Button>

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
      <ComplianceModeContext.Provider value={{ isComplianceMode, toggleComplianceMode }}>
        <main className="container mx-auto px-6 py-8">
          <Outlet />
        </main>
      </ComplianceModeContext.Provider>
    </div>
  );
};
