import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

const ELEMENT_TYPES = [
  { value: 'mascot', label: 'Mascot/Character', subtypes: ['static', 'animated', '3d', 'rigged'] },
  { value: 'background', label: 'Background', subtypes: ['static', 'parallax', 'particle'] },
  { value: 'ui_component', label: 'UI Component', subtypes: ['button', 'input', 'progress_bar', 'card'] },
  { value: 'feedback_effect', label: 'Feedback Effect', subtypes: ['success', 'failure', 'transition'] },
  { value: 'audio', label: 'Audio', subtypes: ['music', 'sfx', 'voiceover'] },
  { value: 'decorative', label: 'Decorative', subtypes: ['icon', 'border', 'frame'] },
  { value: 'animation', label: 'Animation', subtypes: ['lottie', 'sprite_sheet', 'css', 'gif'] },
];

const ELEMENT_REQUIREMENTS: Record<string, { formats: string; maxSize: string; guidelines: string }> = {
  mascot: {
    formats: 'PNG (transparent), SVG, or JSON (Lottie)',
    maxSize: '2MB',
    guidelines: 'Mobile-optimized (max 512x512px), transparent background, works on light/dark themes, touch-friendly for Telegram mini-games'
  },
  background: {
    formats: 'PNG, JPG, WebP, SVG',
    maxSize: '1MB',
    guidelines: 'Optimized for mobile (max 1920x1080px), compressed for Telegram data limits, doesn\'t distract from gameplay'
  },
  ui_component: {
    formats: 'PNG (transparent), SVG preferred',
    maxSize: '500KB',
    guidelines: 'Touch-friendly sizing (min 44x44px), clear visual states, accessible contrast (WCAG AA), scalable for different devices'
  },
  feedback_effect: {
    formats: 'PNG sequence, Lottie JSON, or optimized GIF',
    maxSize: '1MB',
    guidelines: 'Short duration (1-3s), optimized frames, transparent BG, 60fps on mobile, performant on low-end devices'
  },
  audio: {
    formats: 'MP3 (preferred), OGG, WAV',
    maxSize: '500KB',
    guidelines: 'Web-compressed, normalized volume, seamless loops for BG music, under 10s for SFX, Telegram-friendly file size'
  },
  decorative: {
    formats: 'PNG (transparent), SVG',
    maxSize: '300KB',
    guidelines: 'Lightweight, enhances not overwhelms, scalable, works across screen sizes in Telegram WebApp'
  },
  animation: {
    formats: 'Lottie JSON (preferred), PNG sprite sheet, CSS, GIF',
    maxSize: '1MB',
    guidelines: '60fps mobile-optimized, Lottie preferred for scalability, all assets embedded, tested on low-end devices, under 5s duration'
  }
};

const PLACEMENT_ZONES = [
  'intro_screen_mascot',
  'intro_screen_background',
  'gameplay_background',
  'gameplay_mascot',
  'ui_buttons',
  'ui_inputs',
  'ui_progress',
  'feedback_success',
  'feedback_failure',
  'results_screen_background',
  'results_screen_mascot',
  'audio_background',
  'audio_sfx',
];

export const DesignElementUpload = () => {
  const [elementType, setElementType] = useState('');
  const [elementSubtype, setElementSubtype] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const currentType = ELEMENT_TYPES.find(t => t.value === elementType);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    // Check file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }

    setFile(selectedFile);
    
    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }

    toast.success('File selected successfully!');
  };

  const toggleZone = (zone: string) => {
    setSelectedZones(prev => 
      prev.includes(zone) 
        ? prev.filter(z => z !== zone)
        : [...prev, zone]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !name || !elementType || selectedZones.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to upload elements');
        return;
      }

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${name.replace(/\s+/g, '-')}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('design-elements')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('design-elements')
        .getPublicUrl(fileName);

      // Create element record
      const { error: insertError } = await supabase
        .from('design_elements')
        .insert({
          creator_id: user.id,
          element_type: elementType,
          element_subtype: elementSubtype || null,
          name,
          description: description || null,
          file_url: publicUrl,
          preview_url: previewUrl || publicUrl,
          allowed_zones: selectedZones,
          file_size_bytes: file.size,
          review_status: 'pending_review',
          is_published: false,
        });

      if (insertError) throw insertError;

      toast.success('Element uploaded successfully! Pending review.');
      
      // Reset form
      setElementType('');
      setElementSubtype('');
      setName('');
      setDescription('');
      setSelectedZones([]);
      setFile(null);
      setPreviewUrl(null);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload element');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6 bg-gray-900 border-gray-800">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Upload Design Element</h3>
          <p className="text-sm text-gray-400 mb-6">
            Upload individual design assets that brands can use in their game customizations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Element Type */}
          <div className="space-y-2">
            <Label className="text-white">Element Type *</Label>
            <Select value={elementType} onValueChange={(val) => {
              setElementType(val);
              setElementSubtype('');
            }}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select element type" />
              </SelectTrigger>
              <SelectContent>
                {ELEMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Element Subtype */}
          {currentType && currentType.subtypes.length > 0 && (
            <div className="space-y-2">
              <Label className="text-white">Subtype</Label>
              <Select value={elementSubtype} onValueChange={setElementSubtype}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select subtype" />
                </SelectTrigger>
                <SelectContent>
                  {currentType.subtypes.map((subtype) => (
                    <SelectItem key={subtype} value={subtype}>
                      {subtype.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Requirements Display */}
        {elementType && ELEMENT_REQUIREMENTS[elementType] && (
          <div className="rounded-lg border border-blue-500/30 bg-blue-900/10 p-4 space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2 text-blue-300">
              <Info className="h-4 w-4" />
              Requirements for {ELEMENT_TYPES.find(t => t.value === elementType)?.label}
            </h4>
            <div className="text-sm space-y-1.5 text-gray-300">
              <p><strong className="text-white">Accepted Formats:</strong> {ELEMENT_REQUIREMENTS[elementType].formats}</p>
              <p><strong className="text-white">Max File Size:</strong> {ELEMENT_REQUIREMENTS[elementType].maxSize}</p>
              <p><strong className="text-white">Telegram Mini-Game Guidelines:</strong> {ELEMENT_REQUIREMENTS[elementType].guidelines}</p>
            </div>
          </div>
        )}

        {/* Name */}
        <div className="space-y-2">
          <Label className="text-white">Element Name *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Friendly Robot Mascot"
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="text-white">Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your element and how it can be used..."
            className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
          />
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label className="text-white">Upload File *</Label>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-neon-purple bg-neon-purple/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              id="element-file"
              type="file"
              onChange={handleFileInput}
              className="hidden"
              accept="image/*,audio/*,.json,.glb,.gltf"
            />

            {file ? (
              <div className="space-y-3">
                {previewUrl && (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="mx-auto max-h-48 rounded-lg"
                  />
                )}
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-white font-medium">{file.name}</span>
                </div>
                <p className="text-sm text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-300 mb-2">
                  Drag and drop your file here, or
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('element-file')?.click()}
                >
                  Browse Files
                </Button>
                <p className="text-xs text-gray-500 mt-4">
                  Images, Audio, 3D Models (JSON, GLB, GLTF), max 10MB
                </p>
              </>
            )}
          </div>
        </div>

        {/* Placement Zones */}
        <div className="space-y-2">
          <Label className="text-white">Allowed Placement Zones *</Label>
          <p className="text-sm text-gray-400 mb-3">
            Select where this element can be used in games
          </p>
          <div className="flex flex-wrap gap-2">
            {PLACEMENT_ZONES.map((zone) => (
              <Badge
                key={zone}
                variant={selectedZones.includes(zone) ? 'default' : 'outline'}
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => toggleZone(zone)}
              >
                {zone.replace(/_/g, ' ').toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300 space-y-2">
              <p className="font-semibold text-blue-300">Review Process:</p>
              <ul className="space-y-1 text-xs">
                <li>• All elements go through manual review before approval</li>
                <li>• Approved elements will appear in the marketplace for brands</li>
                <li>• You'll track usage for future royalty payouts (beta)</li>
                <li>• Ensure your assets are optimized and follow best practices</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={uploading || !file || !name || !elementType || selectedZones.length === 0}
          className="w-full"
        >
          {uploading ? 'Uploading...' : 'Upload Element'}
        </Button>
      </form>
    </Card>
  );
};
