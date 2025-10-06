import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Store, Play, Settings, Link2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

type Customization = {
  id: string;
  template_id: string;
  customization_prompt: string;
  published_at: string | null;
  created_at: string;
  unique_code: string | null;
  game_templates: {
    name: string;
    preview_image?: string;
  };
};

export default function BrandDashboard() {
  const navigate = useNavigate();
  const [customizations, setCustomizations] = useState<Customization[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedCustomization, setSelectedCustomization] = useState<Customization | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadCustomizations();
  }, []);

  const loadCustomizations = async () => {
    try {
      // TEMP: Skip auth check for demo
      /* ORIGINAL CODE - Re-enable after demo:
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      */

      const { data, error } = await supabase
        .from('brand_customizations')
        .select(`
          *,
          game_templates (
            name,
            preview_image
          )
        `)
        // .eq('brand_id', user.id)  // TEMP: Commented for demo
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomizations(data || []);
    } catch (error) {
      console.error('Failed to load customizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateUniqueCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handlePublish = async (customization: Customization) => {
    try {
      const uniqueCode = generateUniqueCode();
      
      const { error } = await supabase
        .from('brand_customizations')
        .update({
          published_at: new Date().toISOString(),
          unique_code: uniqueCode,
        })
        .eq('id', customization.id);

      if (error) throw error;

      toast.success('Validator published successfully!');
      
      // Update local state
      setCustomizations(prev =>
        prev.map(c =>
          c.id === customization.id
            ? { ...c, published_at: new Date().toISOString(), unique_code: uniqueCode }
            : c
        )
      );

      // Show the share dialog
      setSelectedCustomization({ ...customization, unique_code: uniqueCode, published_at: new Date().toISOString() });
      setPublishDialogOpen(true);
    } catch (error: any) {
      toast.error('Failed to publish: ' + error.message);
    }
  };

  const handleShowLink = (customization: Customization) => {
    setSelectedCustomization(customization);
    setPublishDialogOpen(true);
  };

  const getShareableLink = () => {
    if (!selectedCustomization?.unique_code) return '';
    return `${window.location.origin}/play/${selectedCustomization.unique_code}`;
  };

  const handleCopyLink = () => {
    const link = getShareableLink();
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'hsl(var(--neon-green))' }}>
          Brand Dashboard
        </h2>
        <p className="text-gray-400">Manage your customized game experiences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-gray-900 border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-neon-green/10 rounded-lg">
              <Play className="w-6 h-6" style={{ color: 'hsl(var(--neon-green))' }} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active Games</p>
              <p className="text-2xl font-bold text-white">
                {customizations.filter(c => c.published_at).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gray-900 border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Settings className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-white">
                {customizations.filter(c => !c.published_at).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gray-900 border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors"
          onClick={() => navigate('/platform/marketplace')}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Store className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Browse</p>
              <p className="text-lg font-bold text-white">Marketplace →</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4 text-white">Your Games</h3>
      </div>

      {customizations.length === 0 ? (
        <Card className="p-12 text-center bg-gray-900 border-gray-800">
          <p className="text-gray-400 mb-4">No customizations yet</p>
          <Button onClick={() => navigate('/platform/marketplace')}>
            Browse Templates
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customizations.map((custom) => (
            <Card key={custom.id} className="bg-gray-900 border-gray-800 overflow-hidden">
              <div className="aspect-video bg-gray-800 flex items-center justify-center">
                {custom.game_templates?.preview_image ? (
                  <img src={custom.game_templates.preview_image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Play className="w-12 h-12 text-gray-600" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white mb-2">{custom.game_templates?.name}</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                  {custom.customization_prompt || 'No customization prompt'}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      custom.published_at
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {custom.published_at ? 'Live' : 'Draft'}
                  </span>
                  {custom.published_at ? (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => window.open(`${window.location.origin}/play/${custom.unique_code}`, '_blank')}
                        className="gap-2"
                      >
                        <Play className="h-3 w-3" />
                        Play
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleShowLink(custom)}
                        className="gap-2"
                      >
                        <Link2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={() => handlePublish(custom)}
                      className="bg-neon-green text-black hover:bg-neon-green/90"
                    >
                      Publish
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="bg-gray-900 border-neon-green text-white">
          <DialogHeader>
            <DialogTitle className="text-neon-green text-glow-green">
              🎉 Validator Published!
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Share this link with players to access your branded validator
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-black border border-neon-green/30 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Shareable Link:</p>
              <p className="text-sm font-mono text-neon-green break-all">
                {getShareableLink()}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  window.open(getShareableLink(), '_blank');
                }}
                className="flex-1 gap-2"
              >
                <Play className="h-4 w-4" />
                Play Now
              </Button>
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="flex-1 gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
            <Button
              variant="ghost"
              onClick={() => setPublishDialogOpen(false)}
              className="w-full"
            >
              Close
            </Button>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <p className="text-xs text-gray-400">
                <strong className="text-white">Share Code:</strong>{' '}
                {selectedCustomization?.unique_code}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Players can access this validator using the link or the share code
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
