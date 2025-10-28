import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Store, Play, Settings, Link2, Copy, Check, Calendar as CalendarIcon, Eye, EyeOff, Lock, ChevronDown, ChevronUp, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CourseGamifier } from '@/components/platform/CourseGamifier';
import { GameCoverPhoto } from '@/components/platform/GameCoverPhoto';
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
  updated_at: string;
  unique_code: string | null;
  game_templates: {
    name: string;
    preview_image?: string;
    creator_id?: string;
    profiles?: {
      full_name: string;
      bio?: string;
      avatar_url?: string;
    } | null;
  };
};

export default function BrandDashboard() {
  const navigate = useNavigate();
  const [customizations, setCustomizations] = useState<Customization[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedCustomization, setSelectedCustomization] = useState<Customization | null>(null);
  const [copied, setCopied] = useState(false);
  const [liveStartDate, setLiveStartDate] = useState<Date>();
  const [liveEndDate, setLiveEndDate] = useState<Date>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>('public');
  const [showCourseGamifier, setShowCourseGamifier] = useState(false);

  useEffect(() => {
    loadCustomizations();
    seedDemoDataIfNeeded();
  }, []);

  const seedDemoDataIfNeeded = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user already has customizations
      const { data: existing } = await supabase
        .from('brand_customizations')
        .select('id')
        .eq('brand_id', user.id)
        .limit(1);

      if (existing && existing.length > 0) return;

      // Seed demo data in background
      console.log('Seeding NexaCorp demo data...');
      await supabase.functions.invoke('seed-demo-data');
      
      // Reload customizations after seeding
      setTimeout(() => loadCustomizations(), 2000);
    } catch (error) {
      console.error('Demo seed error:', error);
    }
  };

  const loadCustomizations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('brand_customizations')
        .select(`
          *,
          game_templates (
            name,
            preview_image,
            creator_id
          )
        `)
        .eq('brand_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch creator profiles separately for each template
      const enrichedCustomizations = await Promise.all(
        (data || []).map(async (custom) => {
          if (custom.game_templates?.creator_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, bio, avatar_url')
              .eq('user_id', custom.game_templates.creator_id)
              .single();
            
            return {
              ...custom,
              game_templates: {
                ...custom.game_templates,
                profiles: profile || undefined
              }
            };
          }
          return custom;
        })
      );

      if (error) throw error;

      // Fetch brand profile separately using any type to bypass TypeScript
      let profileData: any = null;
      try {
        const result = await (supabase as any)
          .from('profiles')
          .select('company_name, company_logo_url')
          .eq('user_id', user.id)
          .single();
        profileData = result.data;
      } catch (e) {
        console.log('No profile found');
      }

      // Merge profile data with customizations
      const enrichedData = enrichedCustomizations.map(custom => ({
        ...custom,
        brand_profile: profileData
      }));

      setCustomizations(enrichedData || []);
    } catch (error) {
      console.error('Failed to load customizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateUniqueCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handlePublishClick = (customization: Customization) => {
    console.log('🔵 Publish clicked, opening date picker for:', customization.id);
    setSelectedCustomization(customization);
    setShowDatePicker(true);
    // Set default dates: start now, end in 30 days
    setLiveStartDate(new Date());
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    setLiveEndDate(endDate);
    setVisibility('public'); // Reset to public by default
    console.log('🔵 showDatePicker state set to true');
  };

  const handlePublish = async () => {
    if (!selectedCustomization) return;
    
    if (!liveStartDate || !liveEndDate) {
      toast.error('Please select start and end dates');
      return;
    }

    if (liveEndDate <= liveStartDate) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      const uniqueCode = generateUniqueCode();
      
      const { error } = await supabase
        .from('brand_customizations')
        .update({
          published_at: new Date().toISOString(),
          unique_code: uniqueCode,
          live_start_date: liveStartDate.toISOString(),
          live_end_date: liveEndDate.toISOString(),
          visibility: visibility,
        })
        .eq('id', selectedCustomization.id);

      if (error) throw error;

      toast.success('Validator published successfully!');
      
      // Update local state
      setCustomizations(prev =>
        prev.map(c =>
          c.id === selectedCustomization.id
            ? { ...c, published_at: new Date().toISOString(), unique_code: uniqueCode }
            : c
        )
      );

      setShowDatePicker(false);
      // Show the share dialog
      setSelectedCustomization({ ...selectedCustomization, unique_code: uniqueCode, published_at: new Date().toISOString() });
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

  const handleDeleteGame = async (customizationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Authentication required');
        return;
      }

      console.log('Deleting game:', customizationId, 'for user:', user.id);

      const { error, count } = await supabase
        .from('brand_customizations')
        .delete({ count: 'exact' })
        .eq('id', customizationId)
        .eq('brand_id', user.id);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      console.log('Delete successful, rows affected:', count);

      // Update local state immediately
      setCustomizations(prev => {
        const filtered = prev.filter(c => c.id !== customizationId);
        console.log('Remaining games:', filtered.length);
        return filtered;
      });

      toast.success('Game deleted successfully');
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Failed to delete game: ' + error.message);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-[425px] mx-auto px-4 sm:px-0">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'hsl(var(--neon-green))' }}>
          Brand Dashboard
        </h2>
        <p className="text-gray-400">Manage your company profile and game experiences</p>
      </div>

      {/* Company Profile Section */}
      <Card className="bg-gray-900 border-gray-800 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Company Profile</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/platform/brand/profile-edit')}
          >
            Edit Profile
          </Button>
        </div>
        <p className="text-gray-400 text-sm">
          Set up your company profile to create a public brand page that showcases all your published games.
        </p>
      </Card>

      {/* Course Gamifier Section */}
      <Card className="bg-gray-900 border-gray-800 mb-8 w-full">
        <button
          onClick={() => setShowCourseGamifier(!showCourseGamifier)}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
        >
          <div className="text-left">
            <h3 className="text-xl font-semibold text-white mb-2">Course Gamifier</h3>
            <p className="text-gray-400 text-sm">
              Upload your training courses and we'll map them to C-BEN competencies and recommend validators
            </p>
          </div>
          {showCourseGamifier ? (
            <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
          )}
        </button>
        {showCourseGamifier && (
          <div className="px-6 pb-6 border-t border-gray-800 pt-6">
            <CourseGamifier />
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card className="p-6 bg-gray-900 border-gray-800 w-full">
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
      <div className="grid grid-cols-1 gap-6">
        {customizations.map((custom) => (
          <Card key={custom.id} className="bg-gray-900 border-gray-800 overflow-hidden">
            {/* Game Preview Screenshot */}
            {custom.game_templates?.preview_image ? (
              <div className="relative w-full h-48 bg-gray-800">
                <img 
                  src={custom.game_templates.preview_image} 
                  alt={custom.game_templates.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <GameCoverPhoto
                coverPhotoUrl={(custom as any).cover_photo_url}
                logoUrl={(custom as any).brand_profile?.company_logo_url}
                brandName={(custom as any).brand_profile?.company_name}
                className="w-full h-48"
              />
            )}
               <div className="p-4">
                <h3 className="font-semibold text-white mb-2">
                  {custom.game_templates?.name || 'Course-Generated Game'}
                </h3>
                {custom.game_templates?.profiles?.full_name && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
                      {custom.game_templates.profiles.avatar_url ? (
                        <img
                          src={custom.game_templates.profiles.avatar_url}
                          alt={custom.game_templates.profiles.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-3 h-3 text-gray-500" />
                      )}
                    </div>
                    <p className="text-xs text-neon-purple">
                      by {custom.game_templates.profiles.full_name}
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                  {custom.customization_prompt || 'No customization prompt'}
                </p>
                <div className="text-xs text-gray-600 mb-3 space-y-0.5">
                  <p>Created: {format(new Date(custom.created_at), 'MMM d, yyyy h:mm a')}</p>
                  <p>Last edited: {format(new Date(custom.updated_at), 'MMM d, yyyy h:mm a')}</p>
                </div>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Play clicked, unique_code:', custom.unique_code);
                          if (custom.unique_code) {
                            window.open(`${window.location.origin}/play/${custom.unique_code}`, '_blank');
                          } else {
                            toast.error('Game code is missing. Please republish this game.');
                          }
                        }}
                        className="gap-2"
                      >
                        <Play className="h-3 w-3" />
                        Play
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Link clicked, customization:', custom);
                          handleShowLink(custom);
                        }}
                        className="gap-2"
                      >
                        <Link2 className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => handleDeleteGame(custom.id, e)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Preview mode - view the game HTML directly
                          if (custom.id) {
                            navigate(`/play/preview/${custom.id}`);
                          } else {
                            toast.error('Cannot preview this game');
                          }
                        }}
                        className="gap-2"
                      >
                        <Eye className="h-3 w-3" />
                        Preview
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('🟢 Publish button clicked!');
                          handlePublishClick(custom);
                        }}
                        className="bg-neon-green text-white hover:bg-neon-green/90"
                      >
                        Publish
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => handleDeleteGame(custom.id, e)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Date Picker Dialog */}
      <Dialog open={showDatePicker} onOpenChange={(open) => {
        console.log('🟡 Dialog open state changed to:', open);
        setShowDatePicker(open);
      }}>
        <DialogContent className="bg-gray-900 border-neon-green text-white">
          <DialogHeader>
            <DialogTitle className="text-neon-green text-glow-green">
              📅 Set Live Timeframe
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose when this validator will be available to players
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-white">Start Date & Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-gray-800 border-gray-700",
                      !liveStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {liveStartDate ? format(liveStartDate, "PPP p") : <span>Pick start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-900 border-neon-green" align="start">
                  <Calendar
                    mode="single"
                    selected={liveStartDate}
                    onSelect={setLiveStartDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-white">End Date & Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-gray-800 border-gray-700",
                      !liveEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {liveEndDate ? format(liveEndDate, "PPP p") : <span>Pick end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-900 border-neon-green" align="start">
                  <Calendar
                    mode="single"
                    selected={liveEndDate}
                    onSelect={setLiveEndDate}
                    disabled={(date) => date < (liveStartDate || new Date())}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility" className="text-white">Visibility</Label>
              <Select value={visibility} onValueChange={(value: 'public' | 'unlisted' | 'private') => setVisibility(value)}>
                <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-neon-green">
                  <SelectItem value="public" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-neon-green" />
                      <div>
                        <p className="font-medium">Public</p>
                        <p className="text-xs text-gray-400">Visible in game lobby</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="unlisted" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <EyeOff className="h-4 w-4 text-yellow-500" />
                      <div>
                        <p className="font-medium">Unlisted</p>
                        <p className="text-xs text-gray-400">Only via direct link</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="private" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="font-medium">Private</p>
                        <p className="text-xs text-gray-400">Internal training only (coming soon)</p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowDatePicker(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePublish}
                className="flex-1 bg-neon-green text-white hover:bg-neon-green/90"
              >
                Publish Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
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
