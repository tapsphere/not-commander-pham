import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeft, Building2, Upload, User } from 'lucide-react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { DesignPaletteEditor } from '@/components/platform/DesignPaletteEditor';

export default function BrandProfileEdit() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'brand' | 'creator' | null>(null);
  const [gameAvatarUrl, setGameAvatarUrl] = useState('');
  const [particleEffect, setParticleEffect] = useState('sparkles');
  const [designPalette, setDesignPalette] = useState({
    primary: '#C8DBDB',
    secondary: '#6C8FA4',
    accent: '#2D5556',
    background: '#F5EDD3',
    highlight: '#F0C7A0',
    text: '#2D5556',
    font: 'Inter, sans-serif'
  });
  
  // Image crop states
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [cropType, setCropType] = useState<'avatar' | 'logo' | 'game-avatar'>('avatar');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);

      // Check user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      setUserRole(roleData?.role as 'brand' | 'creator' || null);

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, bio, avatar_url, company_name, company_description, company_logo_url, design_palette, game_avatar_url, default_particle_effect')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setFullName(data.full_name || '');
        setBio(data.bio || '');
        setAvatarUrl(data.avatar_url || '');
        setCompanyName(data.company_name || '');
        setCompanyDescription(data.company_description || '');
        setCompanyLogoUrl(data.company_logo_url || '');
        setGameAvatarUrl(data.game_avatar_url || '');
        setParticleEffect(data.default_particle_effect || 'sparkles');
        
        // Load design palette if exists
        if (data.design_palette) {
          setDesignPalette(data.design_palette as any);
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('No 2d context');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas is empty'));
      }, 'image/jpeg');
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'logo' | 'game-avatar') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setCropType(type);
        setCropDialogOpen(true);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async () => {
    if (!imageSrc || !croppedAreaPixels || !userId) return;

    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const fileName = `${userId}-${cropType}-${Date.now()}.jpg`;
      const filePath = `${cropType}s/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, croppedBlob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      // Update state
      if (cropType === 'avatar') {
        setAvatarUrl(publicUrl);
      } else if (cropType === 'game-avatar') {
        setGameAvatarUrl(publicUrl);
      } else {
        setCompanyLogoUrl(publicUrl);
      }

      setCropDialogOpen(false);
      setImageSrc(null);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Failed to upload image:', error);
      toast.error('Failed to upload image: ' + error.message);
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    setSaving(true);
    try {
      const updates: any = {};
      
      if (userRole === 'creator') {
        updates.full_name = fullName;
        updates.bio = bio;
        updates.avatar_url = avatarUrl;
        updates.design_palette = designPalette;
        updates.game_avatar_url = gameAvatarUrl;
        updates.default_particle_effect = particleEffect;
      } else {
        updates.company_name = companyName;
        updates.company_description = companyDescription;
        updates.company_logo_url = companyLogoUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      navigate(userRole === 'creator' ? '/platform/creator' : '/platform/brand');
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to save profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto text-center py-12">
        <p className="text-gray-400">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate(userRole === 'creator' ? '/platform/creator' : '/platform/brand')}
        className="mb-6"
        style={{ color: 'hsl(var(--neon-green))' }}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <Card className="bg-gray-900 border-gray-800 p-8">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'hsl(var(--neon-green))' }}>
          {userRole === 'creator' ? 'Edit Creator Profile' : 'Edit Company Profile'}
        </h2>

        <div className="space-y-6">
          {userRole === 'creator' ? (
            <>
              {/* Avatar Upload */}
              <div>
                <Label className="text-white mb-2">Profile Picture</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div
                    className="w-24 h-24 rounded-full border-2 flex items-center justify-center bg-black/50 overflow-hidden"
                    style={{ borderColor: 'hsl(var(--neon-green))' }}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12" style={{ color: 'hsl(var(--neon-green))' }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, 'avatar')}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label htmlFor="avatar-upload">
                      <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer"
                        asChild
                      >
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Upload a profile picture. You'll be able to crop it after selecting.
                    </p>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <Label htmlFor="full-name" className="text-white mb-2">
                  Full Name *
                </Label>
                <Input
                  id="full-name"
                  placeholder="Your Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor="bio" className="text-white mb-2">
                  Bio *
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Tell others about yourself and your game creation experience..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white min-h-[120px]"
                />
              </div>

              {/* Design Palette Settings */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Default Game Design</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Set your default colors and font. These will be used for all your games unless you override them per game.
                </p>
                <DesignPaletteEditor
                  palette={designPalette}
                  onChange={setDesignPalette}
                />
              </div>

              {/* Game Mascot/Avatar */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Game Mascot (Default)</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Upload an animal, character, or icon that will appear in your games with animations and particles.
                </p>
                <div className="flex items-center gap-4">
                  <div
                    className="w-32 h-32 rounded-lg border-2 flex items-center justify-center bg-black/50 overflow-hidden"
                    style={{ borderColor: 'hsl(var(--neon-purple))' }}
                  >
                    {gameAvatarUrl ? (
                      <img
                        src={gameAvatarUrl}
                        alt="Game Mascot"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, 'game-avatar')}
                      className="hidden"
                      id="game-avatar-upload"
                    />
                    <label htmlFor="game-avatar-upload">
                      <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer"
                        asChild
                      >
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Mascot
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Upload a character, animal, or icon. This will animate and react during gameplay.
                    </p>
                  </div>
                </div>
              </div>

              {/* Particle Effect Selector */}
              <div>
                <Label className="text-white mb-2">Default Particle Effect</Label>
                <select
                  value={particleEffect}
                  onChange={(e) => setParticleEffect(e.target.value)}
                  className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
                >
                  <option value="sparkles">✨ Sparkles (Gold Twinkles)</option>
                  <option value="coins">🪙 Coins (Golden Coins)</option>
                  <option value="stars">⭐ Stars (Bright Stars)</option>
                  <option value="hearts">❤️ Hearts (Floating Hearts)</option>
                  <option value="confetti">🎉 Confetti (Colorful Pieces)</option>
                  <option value="lightning">⚡ Lightning (Electric Bolts)</option>
                </select>
                <p className="text-xs text-gray-400 mt-2">
                  Particles will burst on interactions, correct answers, and celebrations
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Company Logo Upload */}
              <div>
                <Label className="text-white mb-2">Company Logo</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div
                    className="w-24 h-24 rounded-lg border-2 flex items-center justify-center bg-black/50 overflow-hidden"
                    style={{ borderColor: 'hsl(var(--neon-green))' }}
                  >
                    {companyLogoUrl ? (
                      <img
                        src={companyLogoUrl}
                        alt="Company Logo"
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <Building2 className="w-12 h-12" style={{ color: 'hsl(var(--neon-green))' }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, 'logo')}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload">
                      <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer"
                        asChild
                      >
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Logo
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Upload your company logo. You'll be able to crop it after selecting.
                    </p>
                  </div>
                </div>
              </div>

              {/* Company Name */}
              <div>
                <Label htmlFor="company-name" className="text-white mb-2">
                  Company Name *
                </Label>
                <Input
                  id="company-name"
                  placeholder="Your Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              {/* Company Description */}
              <div>
                <Label htmlFor="company-description" className="text-white mb-2">
                  Company Description *
                </Label>
                <Textarea
                  id="company-description"
                  placeholder="Tell players about your company and what makes your games special..."
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white min-h-[120px]"
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => navigate(userRole === 'creator' ? '/platform/creator' : '/platform/brand')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                saving ||
                (userRole === 'creator' ? !fullName || !bio : !companyName || !companyDescription)
              }
              className="flex-1 bg-neon-green text-white hover:bg-neon-green/90"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Crop Dialog */}
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Crop Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative h-[400px] bg-black rounded-lg overflow-hidden">
              {imageSrc && (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={cropType === 'avatar' || cropType === 'game-avatar' ? 1 : 16 / 9}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-white">Zoom</Label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCropDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCropSave}
                className="flex-1 bg-neon-green text-white hover:bg-neon-green/90"
              >
                Save & Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
