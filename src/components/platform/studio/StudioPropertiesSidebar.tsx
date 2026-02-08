import { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Play, Trophy, Gamepad2, Lock, Plus, Trash2, Upload, 
  Sparkles, Palette, Box, FileText, Loader2, Target, Zap,
  AlertTriangle, RotateCcw, Wand2, Shield, ChevronDown,
  MessageSquare, Settings2, Eye, EyeOff
} from 'lucide-react';
import { useStudioTheme } from './StudioThemeContext';
import { DesignSettings, SceneData, SubCompetency, TemplateFormData, INDUSTRIES, createDefaultScene } from '../template-steps/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ColorRemixPanel } from '../ColorRemixPanel';
import { ChoiceEditorItem } from './ChoiceEditorItem';

interface StudioPropertiesSidebarProps {
  currentSceneIndex: number;
  currentStep: number;
  scenes: SceneData[];
  setScenes: (scenes: SceneData[]) => void;
  subCompetencies: SubCompetency[];
  designSettings: DesignSettings;
  setDesignSettings: (settings: DesignSettings) => void;
  formData: TemplateFormData;
  setFormData: (data: TemplateFormData) => void;
  logoFile: File | null;
  setLogoFile: (file: File | null) => void;
  mascotFile: File | null;
  setMascotFile: (file: File | null) => void;
}

// XP Values from PlayOps Framework - LOCKED in Master DNA Library
const XP_VALUES = { L1: 100, L2: 250, L3: 500 } as const;
type XPLevel = keyof typeof XP_VALUES;

// Multi-Zone Color Distribution for Smart Brand Remix
interface ColorZones {
  surface: string;      // Main background layer
  container: string;    // Glassmorphic cards and stage area  
  action: string;       // Primary buttons and progress bars
  typography: string;   // Primary and secondary text contrast
}

// Smart color distribution algorithm for Multi-Zone Remix
const distributeColorsToZones = (colors: string[]): ColorZones => {
  // Sort colors by luminance to ensure proper contrast distribution
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };
  
  const sortedByLuminance = [...colors].sort((a, b) => getLuminance(a) - getLuminance(b));
  
  return {
    surface: sortedByLuminance[0],      // Darkest for background (or lightest in light mode)
    container: sortedByLuminance[1],    // Second for cards/glass
    action: sortedByLuminance[2],       // Third for buttons
    typography: sortedByLuminance[3],   // Brightest for text contrast
  };
};

export function StudioPropertiesSidebar({
  currentSceneIndex,
  currentStep,
  scenes,
  setScenes,
  subCompetencies,
  designSettings,
  setDesignSettings,
  formData,
  setFormData,
  logoFile,
  setLogoFile,
  mascotFile,
  setMascotFile,
}: StudioPropertiesSidebarProps) {
  const { isDarkMode } = useStudioTheme();
  const [isRemixing, setIsRemixing] = useState(false);
  const [sceneAiPrompt, setSceneAiPrompt] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [colorZones, setColorZones] = useState<ColorZones | null>(null);
  
  // Store original scene data for reset functionality
  const originalScenesRef = useRef<Map<string, SceneData>>(new Map());

  const bgColor = isDarkMode ? 'bg-slate-900/90' : 'bg-white/95';
  const borderColor = isDarkMode ? 'border-white/10' : 'border-slate-200';
  const textColor = isDarkMode ? 'text-white' : 'text-slate-900';
  const mutedColor = isDarkMode ? 'text-white/60' : 'text-slate-600';
  const inputBg = isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200';

  const currentScene = currentSceneIndex > 0 && currentSceneIndex < 7 
    ? scenes[currentSceneIndex - 1] 
    : null;
  const currentSubCompetency = currentScene 
    ? subCompetencies.find(s => s.id === currentScene.subCompetencyId)
    : null;

  // Store original scene when first loaded (for reset)
  if (currentScene && !originalScenesRef.current.has(currentScene.id)) {
    originalScenesRef.current.set(currentScene.id, JSON.parse(JSON.stringify(currentScene)));
  }

  const updateScene = (updates: Partial<SceneData>) => {
    if (!currentScene) return;
    const newScenes = scenes.map((s, i) => 
      i === currentSceneIndex - 1 ? { ...s, ...updates } : s
    );
    setScenes(newScenes);
  };

  // Reset current scene to DNA Library blueprint
  const handleResetToDefault = () => {
    if (!currentScene) return;
    
    const subId = currentScene.subCompetencyId;
    const defaultScene = createDefaultScene(subId, currentSceneIndex);
    
    // Preserve the original ID but reset content
    const newScenes = scenes.map((s, i) => 
      i === currentSceneIndex - 1 
        ? { ...defaultScene, id: currentScene.id, subCompetencyId: subId } 
        : s
    );
    setScenes(newScenes);
    setSceneAiPrompt('');
    toast.success('Scene reset to DNA Library defaults');
  };

  // Visual choice icon mapping for AI detection
  const VISUAL_ICON_MAP: Record<string, { icon: string; label: string }> = {
    shoe: { icon: 'Footprints', label: 'Shoes' },
    shoes: { icon: 'Footprints', label: 'Shoes' },
    dress: { icon: 'Shirt', label: 'Dress' },
    shirt: { icon: 'Shirt', label: 'Shirt' },
    hat: { icon: 'Crown', label: 'Hat' },
    cap: { icon: 'Crown', label: 'Cap' },
    watch: { icon: 'Watch', label: 'Watch' },
    bag: { icon: 'ShoppingBag', label: 'Bag' },
    gift: { icon: 'Gift', label: 'Gift' },
    jewelry: { icon: 'Gem', label: 'Jewelry' },
    chart: { icon: 'BarChart3', label: 'Chart' },
    graph: { icon: 'TrendingUp', label: 'Graph' },
    target: { icon: 'Target', label: 'Target' },
    team: { icon: 'Users', label: 'Team' },
    people: { icon: 'Users', label: 'People' },
    message: { icon: 'MessageCircle', label: 'Message' },
    email: { icon: 'Mail', label: 'Email' },
    phone: { icon: 'Phone', label: 'Phone' },
    star: { icon: 'Star', label: 'Star' },
    heart: { icon: 'Heart', label: 'Heart' },
    fire: { icon: 'Flame', label: 'Fire' },
    sparkle: { icon: 'Sparkles', label: 'Sparkle' },
  };

  // Scene AI Command - Pre-fill all scene fields based on prompt
  const handleSceneAiCommand = async () => {
    if (!currentScene || !sceneAiPrompt.trim()) return;
    
    setIsAiProcessing(true);
    const prompt = sceneAiPrompt.toLowerCase();
    
    // ===== VISUAL CHOICE DETECTION =====
    const visualKeywords = ['icon', 'icons', 'image', 'images', 'vector', 'vectors', 'visual', 'picture'];
    const gridKeywords = ['2x2', '3x2', 'grid', 'layout'];
    const isVisualRequest = visualKeywords.some(keyword => prompt.includes(keyword));
    const hasGridRequest = gridKeywords.some(keyword => prompt.includes(keyword));
    
    if (isVisualRequest) {
      // Parse icon names from the prompt
      const detectedIcons: { icon: string; label: string }[] = [];
      
      Object.keys(VISUAL_ICON_MAP).forEach(key => {
        if (prompt.includes(key)) {
          detectedIcons.push(VISUAL_ICON_MAP[key]);
        }
      });
      
      // Determine grid layout
      let gridLayout: '1x4' | '2x2' | '3x2' = '2x2';
      if (prompt.includes('3x2')) gridLayout = '3x2';
      else if (prompt.includes('1x4') || prompt.includes('vertical') || prompt.includes('list')) gridLayout = '1x4';
      
      // Fill with detected icons or defaults
      const iconChoices = detectedIcons.length >= 2 ? detectedIcons : [
        { icon: 'Footprints', label: 'Shoes' },
        { icon: 'Shirt', label: 'Dress' },
        { icon: 'Crown', label: 'Hat' },
        { icon: 'Watch', label: 'Watch' },
      ];
      
      // Create visual choices
      const newChoices = iconChoices.slice(0, gridLayout === '3x2' ? 6 : 4).map((item, idx) => ({
        id: `choice-visual-${Date.now()}-${idx}`,
        text: item.label,
        isCorrect: idx === 0, // First is correct by default
        brandAligned: false,
        icon: item.icon,
        iconLabel: item.label,
      }));
      
      // Update scene with visual mode
      updateScene({
        displayMode: 'visual',
        gridLayout,
        choices: newChoices,
      });
      
      toast.success(`Visual grid applied! ${gridLayout} layout with ${newChoices.length} icons`);
      setIsAiProcessing(false);
      setSceneAiPrompt('');
      return;
    }
    
    // ===== COLOR CHANGE DETECTION =====
    const colorKeywords = ['color', 'blue', 'red', 'green', 'purple', 'orange', 'pink', 'yellow', 'teal', 'cyan', 'magenta'];
    const isColorPrompt = colorKeywords.some(keyword => prompt.includes(keyword));
    
    if (isColorPrompt) {
      // Parse color from prompt and apply to the appropriate design setting
      let newColor = designSettings.primary;
      let colorName = '';
      
      if (prompt.includes('blue')) { newColor = '#3b82f6'; colorName = 'blue'; }
      else if (prompt.includes('red')) { newColor = '#ef4444'; colorName = 'red'; }
      else if (prompt.includes('green')) { newColor = '#22c55e'; colorName = 'green'; }
      else if (prompt.includes('purple')) { newColor = '#a855f7'; colorName = 'purple'; }
      else if (prompt.includes('orange')) { newColor = '#f97316'; colorName = 'orange'; }
      else if (prompt.includes('pink')) { newColor = '#ec4899'; colorName = 'pink'; }
      else if (prompt.includes('yellow')) { newColor = '#eab308'; colorName = 'yellow'; }
      else if (prompt.includes('teal') || prompt.includes('cyan')) { newColor = '#14b8a6'; colorName = 'teal'; }
      else if (prompt.includes('magenta')) { newColor = '#d946ef'; colorName = 'magenta'; }
      
      // Check what element to change (slider, button, accent, etc.)
      if (prompt.includes('slider') || prompt.includes('accent')) {
        setDesignSettings({ ...designSettings, accent: newColor });
        toast.success(`Slider/accent color changed to ${colorName || newColor}`);
      } else if (prompt.includes('background') || prompt.includes('bg')) {
        setDesignSettings({ ...designSettings, background: newColor });
        toast.success(`Background color changed to ${colorName || newColor}`);
      } else if (prompt.includes('secondary')) {
        setDesignSettings({ ...designSettings, secondary: newColor });
        toast.success(`Secondary color changed to ${colorName || newColor}`);
      } else {
        // Default to primary
        setDesignSettings({ ...designSettings, primary: newColor });
        toast.success(`Primary color changed to ${colorName || newColor}`);
      }
      
      setIsAiProcessing(false);
      setSceneAiPrompt('');
      return;
    }
    
    // ===== AI IMAGE LABELING - Link uploaded assets to Brand Alignment =====
    const brandAlignmentKeywords = ['correct', 'brand answer', 'brand aligned', 'brand-aligned', 'make the', 'set the'];
    const isBrandAlignmentRequest = brandAlignmentKeywords.some(keyword => prompt.includes(keyword));
    
    if (isBrandAlignmentRequest && currentScene.choices.some(c => c.imageUrl)) {
      // Find which uploaded asset is mentioned in the prompt
      const uploadedChoices = currentScene.choices.filter(c => c.imageUrl);
      
      let foundMatch = false;
      const newChoices = currentScene.choices.map(choice => {
        if (choice.imageUrl && choice.imageLabel) {
          // Check if this asset's label is mentioned in the prompt
          const labelWords = choice.imageLabel.toLowerCase().split(' ');
          const isReferenced = labelWords.some(word => 
            word.length > 2 && prompt.includes(word)
          );
          
          if (isReferenced) {
            foundMatch = true;
            toast.success(`"${choice.imageLabel}" set as Brand-Aligned answer!`);
            return { ...choice, brandAligned: true };
          }
        }
        return choice;
      });
      
      if (foundMatch) {
        updateScene({ choices: newChoices });
        setIsAiProcessing(false);
        setSceneAiPrompt('');
        return;
      }
    }
    
    // ===== DEFAULT TEXT CONTENT PRE-FILL =====
    await new Promise(r => setTimeout(r, 1500));
    
    // AI-generated content based on prompt and context
    const brandContext = formData.name || 'your brand';
    const actionCue = currentSubCompetency?.action_cue || '';
    
    // Generate contextual question and choices based on the prompt
    const adjustedQuestion = prompt.includes('prefill') || prompt.includes('pre-fill')
      ? `Based on "${brandContext}" and the mission: "${actionCue}" - ${currentScene.question || 'How would you handle this situation?'}`
      : `${currentScene.question} (Adjusted for: ${sceneAiPrompt})`;
    
    updateScene({ question: adjustedQuestion });
    
    toast.success('AI Command applied to this scene only');
    setIsAiProcessing(false);
    setSceneAiPrompt('');
  };

  const addChoice = () => {
    if (!currentScene || currentScene.choices.length >= 10) return;
    const newChoices = [...currentScene.choices, {
      id: `choice-${Date.now()}`,
      text: `Option ${currentScene.choices.length + 1}`,
      isCorrect: false,
      brandAligned: false,
    }];
    updateScene({ choices: newChoices });
  };

  const removeChoice = (choiceId: string) => {
    if (!currentScene || currentScene.choices.length <= 2) return;
    const newChoices = currentScene.choices.filter(c => c.id !== choiceId);
    updateScene({ choices: newChoices });
  };

  const updateChoice = (choiceId: string, updates: { text?: string; isCorrect?: boolean; brandAligned?: boolean; imageUrl?: string; imageLabel?: string }) => {
    if (!currentScene) return;
    const newChoices = currentScene.choices.map(c => 
      c.id === choiceId ? { ...c, ...updates } : c
    );
    updateScene({ choices: newChoices });
  };

  // Handle image upload for a choice - convert to data URL for preview
  const handleChoiceImageUpload = (choiceId: string, file: File) => {
    if (!currentScene) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      const imageLabel = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      
      const newChoices = currentScene.choices.map(c => 
        c.id === choiceId 
          ? { ...c, imageUrl, imageLabel: imageLabel.slice(0, 20) }
          : c
      );
      updateScene({ choices: newChoices, displayMode: 'visual', gridLayout: '2x2' });
      toast.success(`Asset uploaded for choice: ${imageLabel}`);
    };
    reader.readAsDataURL(file);
  };

  // Render Step-Based Properties
  const renderBrandProperties = () => (
    <div className="space-y-6">
      <SectionHeader icon={Palette} label="Brand Identity" isDarkMode={isDarkMode} />
      
      {/* Logo Upload */}
      <div className="space-y-2">
        <Label className={mutedColor}>Brand Logo</Label>
        <input
          type="file"
          id="logo-upload-sidebar"
          accept="image/*"
          onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
          className="hidden"
        />
        <label htmlFor="logo-upload-sidebar" className="cursor-pointer block">
          <div className={`
            h-24 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-all
            ${isDarkMode ? 'border-white/20 hover:border-white/40' : 'border-slate-300 hover:border-slate-400'}
          `}>
            {logoFile ? (
              <span className={`text-sm ${textColor}`}>{logoFile.name}</span>
            ) : (
              <>
                <Upload className={`h-4 w-4 ${mutedColor}`} />
                <span className={mutedColor}>Upload logo</span>
              </>
            )}
          </div>
        </label>
      </div>

      {/* Mascot Upload */}
      <div className="space-y-2">
        <Label className={mutedColor}>3D Mascot (Optional)</Label>
        <input
          type="file"
          id="mascot-upload-sidebar"
          accept=".json,.lottie"
          onChange={(e) => setMascotFile(e.target.files?.[0] || null)}
          className="hidden"
        />
        <label htmlFor="mascot-upload-sidebar" className="cursor-pointer block">
          <div className={`
            h-20 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-all
            ${isDarkMode ? 'border-white/20 hover:border-white/40' : 'border-slate-300 hover:border-slate-400'}
          `}>
            {mascotFile ? (
              <div className="text-center">
                <Box className={`h-5 w-5 mx-auto mb-1 ${textColor}`} />
                <span className={`text-xs ${mutedColor}`}>{mascotFile.name}</span>
              </div>
            ) : (
              <>
                <Box className={`h-4 w-4 ${mutedColor}`} />
                <span className={mutedColor}>Lottie JSON</span>
              </>
            )}
          </div>
        </label>
      </div>

      {/* Brand Colors */}
      <div className="space-y-3">
        <Label className={mutedColor}>Brand Colors</Label>
        <div className="grid grid-cols-2 gap-3">
          <ColorPicker
            label="Primary"
            value={designSettings.primary}
            onChange={(v) => setDesignSettings({ ...designSettings, primary: v })}
            isDarkMode={isDarkMode}
          />
          <ColorPicker
            label="Secondary"
            value={designSettings.secondary}
            onChange={(v) => setDesignSettings({ ...designSettings, secondary: v })}
            isDarkMode={isDarkMode}
          />
          <ColorPicker
            label="Background"
            value={designSettings.background}
            onChange={(v) => setDesignSettings({ ...designSettings, background: v })}
            isDarkMode={isDarkMode}
          />
          <ColorPicker
            label="Text"
            value={designSettings.text}
            onChange={(v) => setDesignSettings({ ...designSettings, text: v })}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );

  const renderInfoProperties = () => (
    <div className="space-y-6">
      <SectionHeader icon={FileText} label="Template Info" isDarkMode={isDarkMode} />
      
      {/* Industry */}
      <div className="space-y-2">
        <Label className={mutedColor}>Industry Context</Label>
        <Select 
          value={formData.industry} 
          onValueChange={(v) => setFormData({ ...formData, industry: v })}
        >
          <SelectTrigger className={`h-11 ${inputBg}`}>
            <SelectValue placeholder="Select industry..." />
          </SelectTrigger>
          <SelectContent className={isDarkMode ? 'bg-slate-900 border-white/10' : ''}>
            {INDUSTRIES.map(industry => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label className={mutedColor}>Template Name *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`h-12 text-lg ${inputBg}`}
          placeholder="e.g., Budget Allocation Challenge"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label className={mutedColor}>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className={`resize-none ${inputBg}`}
          rows={3}
          placeholder="Brief description of the validator..."
        />
      </div>
    </div>
  );

  // ====== CREATOR COMMAND CENTER (3-Layer Architecture) ======
  const renderGameplayProperties = () => {
    if (!currentScene) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center p-4">
          <AlertTriangle className={`h-10 w-10 mb-3 ${mutedColor}`} />
          <p className={`text-sm font-medium ${textColor}`}>Scene Not Configured</p>
          <p className={`text-xs mt-1 ${mutedColor}`}>
            Configure the Framework step first to create gameplay scenes.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* ===== LAYER 1: EXPANDED AI COMMAND CENTER (Primary Interface) ===== */}
        <div className={`p-4 rounded-xl border-2 ${isDarkMode ? 'border-primary/30 bg-primary/5' : 'border-primary/20 bg-primary/5'}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-primary/20">
              <Wand2 className="h-4 w-4 text-primary" />
            </div>
            <span className={`text-sm font-semibold ${textColor}`}>Scene AI Command</span>
          </div>
          
          <p className={`text-xs ${mutedColor} mb-3`}>
            One sentence to pre-fill this scene. AI only affects local content—
            <span className="text-amber-500 font-medium"> Global DNA is locked.</span>
          </p>
          
          {/* Expanded Textarea - Min 4 rows */}
          <Textarea
            value={sceneAiPrompt}
            onChange={(e) => setSceneAiPrompt(e.target.value)}
            className={`resize-none ${inputBg} text-sm min-h-[100px]`}
            rows={4}
            placeholder="Describe the brand lesson for this scene (e.g., A high-stakes retail scenario with neon pink accents)..."
          />
          
          {/* Large High-Contrast Command Button */}
          <Button
            onClick={handleSceneAiCommand}
            disabled={isAiProcessing || !sceneAiPrompt.trim()}
            className="w-full mt-3 h-11 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
          >
            {isAiProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Apply to Scene {currentSceneIndex}
              </>
            )}
          </Button>
        </div>

        {/* ===== LAYER 2: ADVANCED MANUAL CONTROLS (Collapsed by Default) ===== */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="advanced" className={`border rounded-lg ${borderColor}`}>
            <AccordionTrigger className={`px-4 py-3 hover:no-underline ${textColor}`}>
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                <span className="text-sm font-medium">Advanced Manual Controls</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                {/* Content Fields Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <Label className={`text-xs font-medium ${textColor}`}>Content Fields</Label>
                  </div>
                  
                  {/* Action Cue (Editable) */}
                  <div className="space-y-1.5">
                    <Label className={`text-xs ${mutedColor}`}>Action Cue</Label>
                    <Textarea
                      value={currentSubCompetency?.action_cue || ''}
                      readOnly
                      className={`resize-none text-sm ${inputBg} opacity-70`}
                      rows={2}
                    />
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Lock className="h-2.5 w-2.5" />
                      Linked to DNA Library
                    </p>
                  </div>
                  
                  {/* Scenario (Editable Question) */}
                  <div className="space-y-1.5">
                    <Label className={`text-xs ${mutedColor}`}>Scenario</Label>
                    <Textarea
                      value={currentScene.question}
                      onChange={(e) => updateScene({ question: e.target.value })}
                      className={`resize-none text-sm ${inputBg}`}
                      rows={3}
                      placeholder="Enter the scene scenario..."
                    />
                  </div>
                  
                  {/* PXP Value - LOCKED in Master DNA Library */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Label className={`text-xs ${mutedColor}`}>PXP Value</Label>
                      <Lock className="h-2.5 w-2.5 text-amber-500" />
                    </div>
                    <div className={`p-2.5 rounded-lg ${isDarkMode ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-3">
                          {(Object.keys(XP_VALUES) as XPLevel[]).map((level) => (
                            <span key={level} className={`text-xs font-medium ${mutedColor}`}>
                              {level}: {XP_VALUES[level]}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-[9px] text-amber-600 mt-1.5 flex items-center gap-1">
                        <Shield className="h-2.5 w-2.5" />
                        Locked in Master DNA Library - Performance Economy Integrity
                      </p>
                    </div>
                  </div>
                </div>

                {/* Choice Editor Section with Asset Upload */}
                <div className="space-y-3 pt-3 border-t" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-3.5 w-3.5 text-primary" />
                      <Label className={`text-xs font-medium ${textColor}`}>Choice Editor</Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={addChoice}
                      disabled={currentScene.choices.length >= 10}
                      className="h-7 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  <p className={`text-[10px] ${mutedColor}`}>
                    ✓ = Scientific Correct (hidden) • 🏷️ = Brand-Aligned • 📷 = Upload Asset
                  </p>

                  <div className="space-y-2">
                    {currentScene.choices.map((choice, idx) => (
                      <ChoiceEditorItem
                        key={choice.id}
                        choice={choice}
                        idx={idx}
                        isDarkMode={isDarkMode}
                        inputBg={inputBg}
                        textColor={textColor}
                        mutedColor={mutedColor}
                        canDelete={currentScene.choices.length > 2}
                        onUpdate={(updates) => updateChoice(choice.id, updates)}
                        onRemove={() => removeChoice(choice.id)}
                        onImageUpload={(file) => handleChoiceImageUpload(choice.id, file)}
                      />
                    ))}
                  </div>
                </div>

                {/* Time Limit */}
                <div className="space-y-2 pt-3 border-t" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                  <Label className={`text-xs ${mutedColor}`}>Time Limit</Label>
                  <div className="flex gap-2">
                    {[30, 45, 60].map((time) => (
                      <button
                        key={time}
                        onClick={() => updateScene({ timeLimit: time as 30 | 45 | 60 })}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          currentScene.timeLimit === time
                            ? 'bg-primary text-primary-foreground'
                            : isDarkMode ? 'bg-white/5 text-white/70 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {time}s
                      </button>
                    ))}
                  </div>
                </div>

                {/* Smart Brand Remix Engine - Multi-Zone Color Distribution */}
                <div className="space-y-3 pt-3 border-t" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                  <div className="flex items-center gap-2">
                    <Palette className="h-3.5 w-3.5 text-primary" />
                    <Label className={`text-xs font-medium ${textColor}`}>Smart Brand Remix Engine</Label>
                  </div>
                  
                  {/* 4-Zone Color Distribution Visualization */}
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'} space-y-2`}>
                    <p className={`text-[10px] ${mutedColor} mb-2`}>
                      Multi-Zone distribution ensures readable, professional UI
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <ZoneColorIndicator 
                        label="Surface" 
                        description="Background layer"
                        color={colorZones?.surface || designSettings.background}
                        isDarkMode={isDarkMode}
                      />
                      <ZoneColorIndicator 
                        label="Container" 
                        description="Glass cards"
                        color={colorZones?.container || designSettings.secondary}
                        isDarkMode={isDarkMode}
                      />
                      <ZoneColorIndicator 
                        label="Action" 
                        description="Buttons/Progress"
                        color={colorZones?.action || designSettings.primary}
                        isDarkMode={isDarkMode}
                      />
                      <ZoneColorIndicator 
                        label="Typography" 
                        description="Text contrast"
                        color={colorZones?.typography || designSettings.text}
                        isDarkMode={isDarkMode}
                      />
                    </div>
                  </div>
                  
                  {/* Color Remix Panel with Multi-Zone Logic */}
                  <ColorRemixPanel
                    primaryColor={designSettings.primary}
                    secondaryColor={designSettings.secondary}
                    accentColor={designSettings.accent}
                    backgroundColor={designSettings.background}
                    isDarkMode={isDarkMode}
                    onRemix={(colors) => {
                      // Apply Multi-Zone distribution algorithm
                      const zones = distributeColorsToZones([
                        colors.primary, 
                        colors.secondary, 
                        colors.accent, 
                        colors.background
                      ]);
                      setColorZones(zones);
                      
                      // Map zones to design settings
                      setDesignSettings({ 
                        ...designSettings, 
                        background: zones.surface,
                        secondary: zones.container,
                        primary: zones.action,
                        text: zones.typography
                      });
                      
                      // Update CSS variables for Live Mirror
                      document.documentElement.style.setProperty('--brand-surface', zones.surface);
                      document.documentElement.style.setProperty('--brand-container', zones.container);
                      document.documentElement.style.setProperty('--brand-action', zones.action);
                      document.documentElement.style.setProperty('--brand-typography', zones.typography);
                      // Legacy support
                      document.documentElement.style.setProperty('--brand-primary', zones.action);
                      document.documentElement.style.setProperty('--brand-secondary', zones.container);
                      document.documentElement.style.setProperty('--brand-background', zones.surface);
                    }}
                  />
                </div>

                {/* Locked Framework Data */}
                {currentSubCompetency && (
                  <div className="space-y-2 pt-3 border-t" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-3.5 w-3.5 text-amber-600" />
                      <span className={`text-xs font-medium ${mutedColor}`}>Locked C-BEN Data</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <LockedField label="Mechanic" value={currentSubCompetency.game_mechanic} isDarkMode={isDarkMode} />
                      <LockedField label="Validator" value={currentSubCompetency.validator_type} isDarkMode={isDarkMode} />
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* ===== LAYER 3: RESET TO DEFAULT (Bottom) ===== */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetToDefault}
          className="w-full border-amber-500/50 text-amber-600 hover:bg-amber-500/10 hover:border-amber-500"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Default
        </Button>
        
        {/* ===== GLOBAL DNA VISUAL LABEL (Fixed Bottom) ===== */}
        <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/80' : 'bg-slate-100'} border ${borderColor}`}>
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-amber-500" />
            <span className={`text-xs font-semibold ${textColor}`}>Global DNA Locked</span>
          </div>
          <p className={`text-[10px] ${mutedColor} mt-1.5 leading-relaxed`}>
            Header • Footer • 60Hz Telemetry • 30/50/20 Layout are enforced.
          </p>
        </div>
      </div>
    );
  };

  const renderIntroProperties = () => (
    <div className="space-y-6">
      <SectionHeader icon={Play} label="Intro Screen" isDarkMode={isDarkMode} />
      
      <p className={`text-sm ${mutedColor}`}>
        The intro screen uses your Brand Identity settings from Step 1.
      </p>

      <div className="space-y-2">
        <Label className={mutedColor}>Welcome Title</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={inputBg}
          placeholder="Validator Name"
        />
      </div>

      <div className="space-y-2">
        <Label className={mutedColor}>Welcome Subtitle</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className={`resize-none ${inputBg}`}
          rows={2}
          placeholder="Brief description..."
        />
      </div>
    </div>
  );

  const renderResultsProperties = () => (
    <div className="space-y-6">
      <SectionHeader icon={Trophy} label="Results Screen" isDarkMode={isDarkMode} />

      <div className="space-y-2">
        <Label className={mutedColor}>Success Message</Label>
        <Textarea
          className={`resize-none ${inputBg}`}
          rows={2}
          placeholder="Congratulations! You've demonstrated strong competency..."
          defaultValue="Congratulations! You've completed the assessment."
        />
      </div>

      <div className="space-y-2">
        <Label className={mutedColor}>Failure Message</Label>
        <Textarea
          className={`resize-none ${inputBg}`}
          rows={2}
          placeholder="Keep practicing! Review the competency areas..."
          defaultValue="Keep practicing! You can try again."
        />
      </div>

      {/* Proof Receipt Delta Indicator */}
      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-blue-500" />
          <span className={`text-sm font-medium ${textColor}`}>Proof Receipt Logic</span>
        </div>
        <p className={`text-xs ${mutedColor}`}>
          Scene 7 will show the delta between <span className="font-medium">Scientific Logic</span> (proficiency) 
          and <span className="font-medium">Brand Alignment</span> (cultural fit) to surface performance gaps.
        </p>
      </div>

      <div className="space-y-3 pt-4 border-t" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
        <Label className={mutedColor}>Result Actions</Label>
        
        <div className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
          <span className={`text-sm ${textColor}`}>Show "Claim Badge" Button</span>
          <Switch defaultChecked />
        </div>

        <div className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
          <span className={`text-sm ${textColor}`}>Enable Retry</span>
          <Switch defaultChecked />
        </div>
      </div>
    </div>
  );

  // Decide what to render based on step and scene
  const renderProperties = () => {
    // If viewing filmstrip scenes, show scene-specific properties
    if (currentStep === 4) {
      if (currentSceneIndex === 0) return renderIntroProperties();
      if (currentSceneIndex === 7) return renderResultsProperties();
      return renderGameplayProperties();
    }
    
    // Otherwise show step-based properties
    switch (currentStep) {
      case 1:
        return renderBrandProperties();
      case 2:
        return renderInfoProperties();
      case 3:
        return (
          <div className="space-y-4">
            <SectionHeader icon={Lock} label="Framework" isDarkMode={isDarkMode} />
            <p className={`text-sm ${mutedColor}`}>
              Configure the C-BEN framework in the left panel. Selected competencies will appear here.
            </p>
            {scenes.length > 0 && (
              <div className="space-y-2">
                <Label className={mutedColor}>Active Scenes ({scenes.length})</Label>
                {scenes.map((scene, idx) => {
                  const sub = subCompetencies.find(s => s.id === scene.subCompetencyId);
                  return (
                    <div 
                      key={scene.id}
                      className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}
                    >
                      <p className={`text-sm font-medium ${textColor}`}>Scene {idx + 1}</p>
                      <p className={`text-xs ${mutedColor} truncate`}>{sub?.statement}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`h-full ${bgColor} border-l ${borderColor} backdrop-blur-xl flex flex-col`}>
      {/* Sidebar Header */}
      <div className={`px-4 py-3 border-b ${borderColor} flex items-center justify-between`}>
        <span className={`text-sm font-medium ${textColor}`}>
          {currentStep === 4 && currentSceneIndex > 0 && currentSceneIndex < 7 
            ? 'Command Center' 
            : 'Properties'
          }
        </span>
        <Badge variant="outline" className="text-xs">
          {currentStep === 4 
            ? (currentSceneIndex === 0 ? 'Intro' : currentSceneIndex === 7 ? 'Results' : `Scene ${currentSceneIndex}`)
            : `Step ${currentStep}`
          }
        </Badge>
      </div>

      {/* Sidebar Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {renderProperties()}
        </div>
      </ScrollArea>
    </div>
  );
}

// Helper Components
function SectionHeader({ icon: Icon, label, isDarkMode }: { icon: any; label: string; isDarkMode: boolean }) {
  return (
    <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
      <Icon className={`h-4 w-4 ${isDarkMode ? 'text-white/70' : 'text-slate-600'}`} />
      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{label}</span>
    </div>
  );
}

function ColorPicker({ label, value, onChange, isDarkMode }: { label: string; value: string; onChange: (v: string) => void; isDarkMode: boolean }) {
  return (
    <div className="space-y-1">
      <span className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0"
        />
        <span className={`text-xs font-mono ${isDarkMode ? 'text-white/70' : 'text-slate-600'}`}>
          {value}
        </span>
      </div>
    </div>
  );
}

function LockedField({ label, value, isDarkMode }: { label: string; value: string | null; isDarkMode: boolean }) {
  return (
    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-amber-500/5 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
      <span className={`text-[10px] font-medium ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>{label}</span>
      <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>
        {value || 'Not set'}
      </p>
    </div>
  );
}

// Multi-Zone Color Indicator Component
function ZoneColorIndicator({ 
  label, 
  description, 
  color, 
  isDarkMode 
}: { 
  label: string; 
  description: string;
  color: string; 
  isDarkMode: boolean;
}) {
  return (
    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-white'} border ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
      <div className="flex items-center gap-2">
        <div 
          className="w-5 h-5 rounded-md border border-black/10 flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="min-w-0">
          <p className={`text-[10px] font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} truncate`}>
            {label}
          </p>
          <p className={`text-[9px] ${isDarkMode ? 'text-white/50' : 'text-slate-500'} truncate`}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
