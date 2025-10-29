import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ArrowLeft, Edit, Share2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MobileViewport } from '@/components/MobileViewport';
import { ColorRemixPanel } from '@/components/platform/ColorRemixPanel';

type ValidatorData = {
  id: string;
  customization_prompt: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  logo_url: string | null;
  generated_game_html: string | null;
  brand_id: string;
  unique_code: string | null;
  game_templates: {
    name: string;
    description: string | null;
    preview_image: string | null;
    template_type: string;
    custom_game_url: string | null;
  };
};

export default function Play() {
  const { code, customizationId } = useParams<{ code?: string; customizationId?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [validator, setValidator] = useState<ValidatorData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [remixedColors, setRemixedColors] = useState<{
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  } | null>(null);
  const isPreviewMode = !!customizationId;

  useEffect(() => {
    if (code || customizationId) {
      loadValidator();
    }
  }, [code, customizationId]);

  const loadValidator = async () => {
    try {
      console.log('Loading validator with code:', code, 'or customizationId:', customizationId);
      
      let query = supabase
        .from('brand_customizations')
        .select(`
          id,
          customization_prompt,
          primary_color,
          secondary_color,
          accent_color,
          background_color,
          logo_url,
          generated_game_html,
          brand_id,
          unique_code,
          game_templates (
            name,
            description,
            preview_image,
            template_type,
            custom_game_url
          )
        `);

      // Preview mode: load by ID (no publish check)
      if (customizationId) {
        query = query.eq('id', customizationId);
      } else {
        // Public mode: load by code (must be published)
        query = query.eq('unique_code', code).not('published_at', 'is', null);
      }

      const { data, error } = await query.maybeSingle();

      console.log('Validator query result:', { data, error });
      
      if (error) throw error;

      if (!data) {
        setError(isPreviewMode ? 'Game not found' : 'Validator not found or not published');
        return;
      }

      console.log('Validator loaded:', {
        id: data.id,
        hasHtml: !!data.generated_game_html,
        htmlLength: data.generated_game_html?.length || 0
      });

      setValidator(data as ValidatorData);

      // Check if current user is the owner
      const { data: { user } } = await supabase.auth.getUser();
      if (user && data.brand_id === user.id) {
        setIsOwner(true);
      }
    } catch (error: any) {
      console.error('Failed to load validator:', error);
      setError('Failed to load validator');
      toast.error('Failed to load validator');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-neon-green mx-auto mb-4" />
          <p className="text-white">Loading validator...</p>
        </div>
      </div>
    );
  }

  if (error || !validator) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-gray-900 border-red-500 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Validator Not Found</h2>
          <p className="text-gray-400 mb-6">
            {error || 'This validator link may be invalid or has been unpublished.'}
          </p>
          <Button onClick={() => navigate('/')} variant="outline">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  const handleCopyLink = () => {
    if (!validator?.unique_code) return;
    const link = `${window.location.origin}/play/${validator.unique_code}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  const handleColorRemix = (colors: { primary: string; secondary: string; accent: string; background: string }) => {
    setRemixedColors(colors);
  };

  const getCurrentColors = () => {
    if (remixedColors) return remixedColors;
    return {
      primary: validator?.primary_color || '#00FF00',
      secondary: validator?.secondary_color || '#9945FF',
      accent: validator?.accent_color || '#FF5722',
      background: validator?.background_color || '#1A1A1A'
    };
  };

  // Calculate if a color is light or dark for text contrast
  const isLightColor = (hex: string) => {
    const rgb = parseInt(hex.replace('#', ''), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    return luma > 128;
  };

  // Inject remixed colors into the HTML
  const getRemixedHtml = () => {
    if (!validator.generated_game_html) {
      console.error('No generated_game_html found!');
      return '';
    }
    
    console.log('Processing HTML, original length:', validator.generated_game_html.length);
    
    const colors = getCurrentColors();
    let html = validator.generated_game_html;
    
    // Replace original colors with new colors throughout the HTML
    html = html.replace(new RegExp(validator.primary_color, 'gi'), colors.primary);
    html = html.replace(new RegExp(validator.secondary_color, 'gi'), colors.secondary);
    html = html.replace(new RegExp(validator.accent_color || validator.primary_color, 'gi'), colors.accent);
    html = html.replace(new RegExp(validator.background_color || '#1A1A1A', 'gi'), colors.background);
    
    // Calculate contrasting text colors
    const primaryText = isLightColor(colors.primary) ? '#000000' : '#FFFFFF';
    const secondaryText = isLightColor(colors.secondary) ? '#000000' : '#FFFFFF';
    const accentText = isLightColor(colors.accent) ? '#000000' : '#FFFFFF';
    const bgText = isLightColor(colors.background) ? '#000000' : '#FFFFFF';
    
    // Inject contrast CSS to ensure text is always readable
    const contrastStyles = `
      <style>
        /* Ensure text contrast on colored backgrounds */
        body { color: ${bgText} !important; }
        
        /* Primary color elements need contrasting text */
        [style*="${colors.primary}"] { color: ${primaryText} !important; }
        .primary-bg, .btn-primary, button[style*="${colors.primary}"] { 
          background-color: ${colors.primary} !important; 
          color: ${primaryText} !important;
          border-color: ${primaryText}44 !important;
        }
        
        /* Secondary color elements */
        [style*="${colors.secondary}"] { color: ${secondaryText} !important; }
        .secondary-bg { 
          background-color: ${colors.secondary} !important; 
          color: ${secondaryText} !important; 
        }
        
        /* Accent color elements */
        [style*="${colors.accent}"] { color: ${accentText} !important; }
        .accent-bg { 
          background-color: ${colors.accent} !important; 
          color: ${accentText} !important; 
        }
        
        /* Headers and important text */
        h1, h2, h3, h4, h5, h6 { color: ${bgText} !important; }
        p, span, div { color: inherit; }
        
        /* Buttons need high contrast */
        button { 
          color: ${primaryText} !important;
          font-weight: 600;
        }
        button:hover {
          opacity: 0.9;
        }
      </style>
    `;
    
    // Insert contrast styles right after opening <head> tag
    html = html.replace('<head>', '<head>' + contrastStyles);
    
    console.log('Processed HTML, final length:', html.length);
    console.log('HTML preview (first 500 chars):', html.substring(0, 500));
    
    return html;
  };

  return (
    <ScrollArea className="h-screen">
      <div className="min-h-screen bg-black text-white">
        {/* Return Button Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b-2" style={{ borderColor: 'hsl(var(--neon-green))' }}>
          <div className="max-w-7xl mx-auto p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => navigate(isPreviewMode ? '/platform/brand' : '/lobby')}
                style={{ color: 'hsl(var(--neon-green))' }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {isPreviewMode ? 'Back to Dashboard' : 'Return to Hub'}
              </Button>
              
              {isPreviewMode && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                  <Eye className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">Preview Mode</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {(validator.generated_game_html || validator.game_templates.custom_game_url) ? (
          /* Render the game in mobile viewport */
          <div className="pt-16">
            <MobileViewport>
              <div className="w-full" style={{ minHeight: 'calc(100vh - 4rem)' }}>
                {validator.game_templates.template_type === 'custom_upload' && validator.game_templates.custom_game_url ? (
                  <iframe
                    key={JSON.stringify(remixedColors)} // Force reload on color change
                    src={`${validator.game_templates.custom_game_url}?primaryColor=${encodeURIComponent(getCurrentColors().primary)}&secondaryColor=${encodeURIComponent(getCurrentColors().secondary)}&accentColor=${encodeURIComponent(getCurrentColors().accent)}&backgroundColor=${encodeURIComponent(getCurrentColors().background)}&logoUrl=${encodeURIComponent(validator.logo_url || '')}`}
                    className="w-full border-0 rounded-lg shadow-2xl"
                    style={{ height: '812px' }} // iPhone 13 height
                    title="Custom Game Validator"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                ) : (
                  <iframe
                    key={JSON.stringify(remixedColors)} // Force reload on color change
                    srcDoc={getRemixedHtml()}
                    className="w-full border-0 rounded-lg shadow-2xl bg-white"
                    style={{ height: '812px', minHeight: '812px' }} // iPhone 13 height
                    title="Game Validator"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    onLoad={(e) => {
                      console.log('Iframe loaded successfully');
                      console.log('HTML length:', getRemixedHtml().length);
                      
                      // Force remove loading screen after iframe loads
                      const iframe = e.currentTarget;
                      setTimeout(() => {
                        try {
                          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                          if (iframeDoc) {
                            console.log('Iframe document accessible');
                            const loadingScreen = iframeDoc.getElementById('loading-screen');
                            if (loadingScreen) {
                              console.log('Loading screen found, hiding it');
                              loadingScreen.style.display = 'none';
                            } else {
                              console.log('Loading screen not found');
                            }
                          } else {
                            console.log('Cannot access iframe document');
                          }
                        } catch (err) {
                          console.error('Error accessing iframe content:', err);
                        }
                      }, 3000); // Wait 3 seconds for game to initialize
                    }}
                    onError={(e) => {
                      console.error('Iframe error:', e);
                    }}
                  />
                )}
              </div>
            </MobileViewport>

            {/* Color Remix Panel - Shows in preview mode */}
            {isPreviewMode && isOwner && (
              <div className="bg-gray-900 border-t-2 border-neon-green py-8">
                <div className="max-w-4xl mx-auto px-4">
                  <ColorRemixPanel
                    primaryColor={validator.primary_color}
                    secondaryColor={validator.secondary_color}
                    accentColor={validator.accent_color || validator.primary_color}
                    backgroundColor={validator.background_color || '#1A1A1A'}
                    onRemix={handleColorRemix}
                  />
                </div>
              </div>
            )}

            {/* Owner Controls Section - Scrollable */}
            {isOwner && (
              <div className="bg-gray-900 border-t-2 border-neon-green py-8">
                <div className="max-w-4xl mx-auto px-4 space-y-6">
                  <h2 className="text-2xl font-bold text-neon-green mb-6">Game Management</h2>
                  
                  {/* Promote Section */}
                  <Card className="bg-gray-800 border-gray-700 p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-lg">
                        <Share2 className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">Promote Your Game</h3>
                        <p className="text-gray-400 mb-4">
                          Share this game with your team or publish it to a wider audience.
                        </p>
                        <div className="flex gap-3">
                          <Button 
                            onClick={handleCopyLink}
                            className="gap-2"
                          >
                            <Share2 className="h-4 w-4" />
                            Copy Share Link
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => navigate('/platform/brand')}
                          >
                            View Analytics
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Edit Section */}
                  <Card className="bg-gray-800 border-gray-700 p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-500/10 rounded-lg">
                        <Edit className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">Edit Game Settings</h3>
                        <p className="text-gray-400 mb-4">
                          Modify game parameters, branding, or visibility settings.
                        </p>
                        <div className="flex gap-3">
                          <Button 
                            variant="outline"
                            onClick={() => navigate('/platform/brand')}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit in Dashboard
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        ) : (
        /* Show preview if game hasn't been generated yet - Mobile View */
        <div className="pt-16 flex justify-center">
          <div className="w-full max-w-[425px] px-4">
            {/* Hero Section */}
            <div 
              className="relative py-12 px-4 rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${validator.primary_color}22, ${validator.secondary_color}22)`
              }}
            >
              <div className="text-center">
                {validator.logo_url && (
                  <img
                    src={validator.logo_url}
                    alt="Brand Logo"
                    className="h-12 mx-auto mb-4 object-contain"
                  />
                )}
                <h1 className="text-2xl font-bold mb-3">
                  {validator.game_templates.name}
                </h1>
                {validator.game_templates.description && (
                  <p className="text-sm text-gray-300 mb-6">
                    {validator.game_templates.description}
                  </p>
                )}
                <Card className="bg-yellow-900/20 border-yellow-500 p-6 mt-6">
                  <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                  <p className="text-yellow-300 text-sm">
                    This validator is being generated. Please check back soon!
                  </p>
                </Card>
              </div>
            </div>

            {/* Preview Section */}
            <div className="py-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-3" style={{ color: validator.primary_color }}>
                    About This Validator
                  </h2>
                  <div className="space-y-3 text-sm text-gray-300">
                    <p>
                      This is a branded competency validator designed to assess your skills
                      through interactive gameplay scenarios.
                    </p>
                    <div className="flex gap-3 pt-3">
                      <div 
                        className="w-12 h-12 rounded-lg"
                        style={{ backgroundColor: validator.primary_color }}
                      />
                      <div 
                        className="w-12 h-12 rounded-lg"
                        style={{ backgroundColor: validator.secondary_color }}
                      />
                    </div>
                  </div>
                </div>

                {validator.game_templates.preview_image && (
                  <div className="rounded-lg overflow-hidden border-2" style={{ borderColor: validator.primary_color }}>
                    <img
                      src={validator.game_templates.preview_image}
                      alt="Validator Preview"
                      className="w-full h-auto"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-800 py-6 text-center text-gray-500">
              <p className="text-xs">Powered by TON Validator Platform</p>
            </div>
          </div>
        </div>
        )}
      </div>
    </ScrollArea>
  );
}
