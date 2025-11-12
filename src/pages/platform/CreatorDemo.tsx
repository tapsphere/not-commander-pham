import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Eye, Edit, Trash2, Layers, Package, PlayCircle, Upload, ImageIcon, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateDialog } from '@/components/platform/TemplateDialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

// Design element constants
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

export default function CreatorDemo() {
  const [dialogOpen, setDialogOpen] = useState(true); // Open by default for demo
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'games' | 'elements'>('games');
  const [createdTemplates, setCreatedTemplates] = useState<any[]>([]);
  
  // Design element upload state
  const [elementType, setElementType] = useState('');
  const [elementSubtype, setElementSubtype] = useState('');
  const [elementName, setElementName] = useState('');
  const [elementDescription, setElementDescription] = useState('');
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Mock templates for demo
  const mockTemplates = [
    {
      id: 'demo-1',
      name: 'Crisis Communication Manager',
      description: 'Navigate ethical dilemmas in high-pressure crisis scenarios',
      template_type: 'ai_generated',
      is_published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];

  // Combine mock templates with newly created ones
  const allTemplates = [...mockTemplates, ...createdTemplates];
  
  // Mock design elements for demo
  const mockDesignElements = [
    {
      id: 'elem-1',
      name: 'Corporate Logo Pack',
      description: 'Professional logo variations for different game contexts',
      element_type: 'logo',
      review_status: 'approved',
      is_published: true,
      usage_count: 12,
      preview_url: '/microsoft-logo.png',
      allowed_zones: ['header', 'footer', 'branding'],
    },
    {
      id: 'elem-2',
      name: 'Custom Button Set',
      description: 'Branded button styles with hover states',
      element_type: 'component',
      review_status: 'pending',
      is_published: false,
      usage_count: 0,
      preview_url: null,
      allowed_zones: ['ui', 'navigation'],
    },
    {
      id: 'elem-3',
      name: 'Background Pattern',
      description: 'Subtle branded texture for game backgrounds',
      element_type: 'background',
      review_status: 'approved',
      is_published: true,
      usage_count: 8,
      preview_url: null,
      allowed_zones: ['background', 'section'],
    }
  ];
  
  // Handle template creation success
  const handleTemplateCreated = (templateId: string, templateName: string) => {
    const newTemplate = {
      id: templateId,
      name: templateName,
      description: 'Newly created validator template',
      version: 'v3.1',
      status: 'draft',
      validation_status: 'passed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCreatedTemplates(prev => [newTemplate, ...prev]);
    toast.success(`✅ ${templateName} created successfully!`);
  };

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
    setFile(selectedFile);
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }
  };

  const toggleZone = (zone: string) => {
    setSelectedZones(prev => 
      prev.includes(zone) 
        ? prev.filter(z => z !== zone)
        : [...prev, zone]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
              🎬 Demo Mode - Pre-filled Sample Data
            </Badge>
          </div>
          <h2 className="text-3xl font-bold" style={{ color: 'hsl(var(--neon-green))' }}>
            Creator Studio
          </h2>
          <p className="text-gray-400 mt-2">Manage your game templates and design elements</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="gap-2 border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      <Tabs defaultValue="games" className="space-y-6">
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger value="games" className="gap-2">
            <Layers className="w-4 h-4" />
            My Games
          </TabsTrigger>
          <TabsTrigger value="elements" className="gap-2">
            <Package className="w-4 h-4" />
            Design Elements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="games" className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-400">Create game templates with CBE competencies built in</p>
            <Button 
              onClick={() => setDialogOpen(true)} 
              className="gap-2"
              style={{ backgroundColor: 'hsl(var(--neon-green))', color: 'black' }}
            >
              <Plus className="w-4 h-4" />
              Create Template
            </Button>
          </div>

          {/* Template Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allTemplates.map((template) => (
              <Card key={template.id} className="bg-gray-900 border-gray-800 hover:border-neon-purple transition-colors">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2">{template.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                      {template.template_type === 'ai_generated' ? '🤖 AI Generated' : '📤 Custom Upload'}
                    </Badge>
                    {template.is_published ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                        Draft
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setDialogOpen(true);
                      }}
                      className="flex-1 gap-2 border-gray-700 hover:border-neon-purple hover:text-neon-purple"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setDialogOpen(true);
                      }}
                      className="flex-1 gap-2 border-gray-700 hover:border-neon-green hover:text-neon-green"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="elements" className="space-y-6">
          {/* Upload Form */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
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
                  value={elementName}
                  onChange={(e) => setElementName(e.target.value)}
                  placeholder="e.g., Friendly Robot Mascot"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-white">Description</Label>
                <Textarea
                  value={elementDescription}
                  onChange={(e) => setElementDescription(e.target.value)}
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
                disabled={!file || !elementName || !elementType || selectedZones.length === 0}
                className="w-full"
              >
                Upload Element
              </Button>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Dialog with Demo Data */}
      <TemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={selectedTemplate}
        onSuccess={() => {
          setDialogOpen(false);
          setSelectedTemplate(null);
        }}
        onTemplateCreated={(templateId: string, templateName: string) => {
          const newTemplate = {
            id: templateId,
            name: templateName,
            description: 'Newly created validator template',
            version: 'v3.1',
            status: 'draft',
            validation_status: 'passed',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setCreatedTemplates(prev => [newTemplate, ...prev]);
          toast.success(`✅ ${templateName} created successfully!`);
        }}
        demoMode={true}
      />
    </div>
  );
}
