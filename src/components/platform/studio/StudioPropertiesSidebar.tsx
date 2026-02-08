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
  MessageSquare, Settings2, Eye, EyeOff, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { useStudioTheme } from './StudioThemeContext';
import { DesignSettings, SceneData, SubCompetency, TemplateFormData, CompetencyTrack, INDUSTRIES, createDefaultScene } from '../template-steps/types';
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
  // Expandable console props
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  // Global AI orchestration
  onApplyToAllScenes?: (designSettings: DesignSettings) => void;
  // Multi-track curriculum props
  tracks?: CompetencyTrack[];
  activeTrackId?: string | null;
  onTrackClick?: (trackId: string, sceneIndex: number) => void;
  onRemoveTrack?: (trackId: string) => void;
  onAddTrack?: () => void;
  // Show add track nudge
  showTrackNudge?: boolean;
  currentTrackInfo?: { number: number; name: string } | null;
}

// XP Values from PlayOps Framework - LOCKED in Master DNA Library
const XP_VALUES = { L1: 100, L2: 250, L3: 500 } as const;
type XPLevel = keyof typeof XP_VALUES;

// Multi-Zone Color Distribution for Smart Brand Remix
interface ColorZones {
  surface: string;      // --brand-bg: Deep base (Midnight, Slate, Off-White)
  container: string;    // --brand-container: Glassmorphic frosted layer
  action: string;       // --brand-primary: Buttons, progress bars, active states ONLY
  typography: string;   // --brand-text: Auto-calculated for contrast
}

// ===== COLOR UTILITY FUNCTIONS =====
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

const getLuminance = (hex: string): number => {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map(c =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

const getContrastRatio = (color1: string, color2: string): number => {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

const isDarkColor = (hex: string): boolean => getLuminance(hex) < 0.5;

const getContrastTextColor = (backgroundColor: string): string => {
  return getLuminance(backgroundColor) < 0.5 ? '#FAFAFA' : '#1A1A1A';
};

const getVibrance = (hex: string): number => {
  const { r, g, b } = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  const brightness = max / 255;
  return saturation * 0.7 + brightness * 0.3;
};

const adjustColorForContainer = (baseColor: string, targetDarkMode: boolean): string => {
  const { r, g, b } = hexToRgb(baseColor);
  const factor = targetDarkMode ? 0.2 : 0.1;
  
  if (targetDarkMode) {
    return rgbToHex(r + (255 - r) * factor, g + (255 - g) * factor, b + (255 - b) * factor);
  } else {
    return rgbToHex(r * (1 - factor), g * (1 - factor), b * (1 - factor));
  }
};

// ===== SMART 4-ZONE DISTRIBUTION ALGORITHM =====
const distributeColorsToZones = (colors: string[], preferDarkMode = true): ColorZones => {
  const sortedByLuminance = [...colors].sort((a, b) => getLuminance(a) - getLuminance(b));
  const sortedByVibrance = [...colors].sort((a, b) => getVibrance(b) - getVibrance(a));
  
  // 1. SURFACE: Pick dark for dark mode, light for light mode
  const surface = preferDarkMode ? sortedByLuminance[0] : sortedByLuminance[sortedByLuminance.length - 1];
  
  // 2. ACTION: Most vibrant color with HIGH contrast against surface
  let action = sortedByVibrance[0];
  const minContrast = 4.5; // WCAG AA
  
  for (const color of sortedByVibrance) {
    if (color !== surface && getContrastRatio(color, surface) >= minContrast) {
      action = color;
      break;
    }
  }
  
  // Fallback if no good contrast found
  if (action === surface || getContrastRatio(action, surface) < minContrast) {
    action = isDarkColor(surface) ? '#FFFFFF' : '#1A1A1A';
  }
  
  // 3. CONTAINER: Glassmorphic layer - slightly different from surface
  const remaining = colors.filter(c => c !== surface && c !== action);
  let container = remaining.length > 0 ? remaining[0] : adjustColorForContainer(surface, preferDarkMode);
  
  // 4. TYPOGRAPHY: Auto-calculated for optimal contrast
  const typography = getContrastTextColor(surface);
  
  return { surface, container, action, typography };
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
  isExpanded = false,
  onToggleExpand,
  onApplyToAllScenes,
  tracks = [],
  activeTrackId,
  onTrackClick,
  onRemoveTrack,
  onAddTrack,
  showTrackNudge = false,
  currentTrackInfo,
}: StudioPropertiesSidebarProps) {
  const { isDarkMode } = useStudioTheme();
  const [isRemixing, setIsRemixing] = useState(false);
  const [sceneAiPrompt, setSceneAiPrompt] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [colorZones, setColorZones] = useState<ColorZones | null>(null);
  const [visionStatus, setVisionStatus] = useState<'idle' | 'analyzing' | 'ready'>('idle');
  const [suggestedPalette, setSuggestedPalette] = useState<ColorZones | null>(null);
  
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
  // Supports both LOCAL (this scene only) and GLOBAL (whole track) commands
  const handleSceneAiCommand = async () => {
    if (!sceneAiPrompt.trim()) return;
    
    setIsAiProcessing(true);
    const prompt = sceneAiPrompt.toLowerCase();
    
    // ===== GLOBAL ORCHESTRATION: Apply to entire track =====
    const globalKeywords = ['whole track', 'all scenes', 'entire track', 'global', 'everywhere', 'themed'];
    const isGlobalRequest = globalKeywords.some(keyword => prompt.includes(keyword));
    
    if (isGlobalRequest) {
      // Extract brand theme from prompt
      const brandNames = ['gucci', 'chanel', 'louis vuitton', 'hermes', 'prada', 'dior', 'versace', 'nike', 'apple', 'microsoft'];
      const detectedBrand = brandNames.find(brand => prompt.includes(brand));
      
      // Brand-specific color palettes
      const brandPalettes: Record<string, DesignSettings> = {
        gucci: { ...designSettings, primary: '#2D4A3E', secondary: '#8B6914', accent: '#C7A341', background: '#FAF8F5', text: '#1A1A1A', highlight: '#FF0000' },
        chanel: { ...designSettings, primary: '#000000', secondary: '#C9B037', accent: '#FFFFFF', background: '#F5F5F5', text: '#1A1A1A', highlight: '#C9B037' },
        prada: { ...designSettings, primary: '#000000', secondary: '#1A1A1A', accent: '#FFFFFF', background: '#F0F0F0', text: '#000000', highlight: '#808080' },
        nike: { ...designSettings, primary: '#FF6B35', secondary: '#111111', accent: '#FFFFFF', background: '#F5F5F5', text: '#111111', highlight: '#FF6B35' },
        apple: { ...designSettings, primary: '#007AFF', secondary: '#F5F5F7', accent: '#34C759', background: '#FFFFFF', text: '#1D1D1F', highlight: '#007AFF' },
      };
      
      if (detectedBrand && brandPalettes[detectedBrand]) {
        const newSettings = brandPalettes[detectedBrand];
        setDesignSettings(newSettings);
        
        // Apply to all scenes via callback
        if (onApplyToAllScenes) {
          onApplyToAllScenes(newSettings);
        }
        
        toast.success(`🎨 "${detectedBrand.charAt(0).toUpperCase() + detectedBrand.slice(1)}" theme applied to entire track!`);
        setIsAiProcessing(false);
        setSceneAiPrompt('');
        return;
      }
      
      // Generic global color change
      toast.info('Global theme applied! Brand colors synced across all scenes.');
      if (onApplyToAllScenes) {
        onApplyToAllScenes(designSettings);
      }
      setIsAiProcessing(false);
      setSceneAiPrompt('');
      return;
    }
    
    // ===== LOCAL COMMANDS (require current scene) =====
    if (!currentScene) {
      toast.error('Select a gameplay scene to apply local commands');
      setIsAiProcessing(false);
      return;
    }
    
    // ===== VISION LOOP: Match UI theme to uploaded product =====
    const visionKeywords = ['match', 'theme', 'product', 'this product', 'match the ui', 'match ui', 'palette from'];
    const isVisionRequest = visionKeywords.some(keyword => prompt.includes(keyword)) && suggestedPalette;
    
    if (isVisionRequest && suggestedPalette) {
      // Apply the Vision Loop suggested palette
      setColorZones(suggestedPalette);
      setDesignSettings({
        ...designSettings,
        background: suggestedPalette.surface,
        secondary: suggestedPalette.container,
        primary: suggestedPalette.action,
        text: suggestedPalette.typography,
      });
      
      // Update CSS variables
      document.documentElement.style.setProperty('--brand-surface', suggestedPalette.surface);
      document.documentElement.style.setProperty('--brand-container', suggestedPalette.container);
      document.documentElement.style.setProperty('--brand-action', suggestedPalette.action);
      document.documentElement.style.setProperty('--brand-typography', suggestedPalette.typography);
      
      toast.success('🎨 UI theme matched to your product colors!');
      setVisionStatus('idle');
      setIsAiProcessing(false);
      setSceneAiPrompt('');
      return;
    }
    
    // ===== CONVERSATIONAL STYLING: Asset-specific commands =====
    const sizingKeywords = ['larger', 'bigger', 'smaller', 'size'];
    const animationKeywords = ['pulse', 'glow', 'bounce', 'animate', 'highlight when selected'];
    const isSizingRequest = sizingKeywords.some(keyword => prompt.includes(keyword));
    const isAnimationRequest = animationKeywords.some(keyword => prompt.includes(keyword));
    
    if (isSizingRequest && currentScene.choices.some(c => c.imageUrl)) {
      // Extract percentage from prompt (e.g., "20% larger")
      const percentMatch = prompt.match(/(\d+)%/);
      const percent = percentMatch ? parseInt(percentMatch[1]) : 15;
      
      // Find which asset is mentioned
      const newChoices = currentScene.choices.map(choice => {
        if (choice.imageUrl) {
          const isReferenced = choice.imageLabel && 
            choice.imageLabel.toLowerCase().split(' ').some(word => 
              word.length > 2 && prompt.includes(word)
            );
          
          if (isReferenced || prompt.includes('uploaded image') || prompt.includes('my image')) {
            const direction = prompt.includes('smaller') ? 'smaller' : 'larger';
            toast.success(`Asset "${choice.imageLabel}" styled ${percent}% ${direction}!`);
            return { 
              ...choice, 
              // Store styling metadata (would be applied in VisualGrid)
              imageStyle: { 
                scale: direction === 'larger' ? 1 + (percent / 100) : 1 - (percent / 100) 
              }
            };
          }
        }
        return choice;
      });
      
      updateScene({ choices: newChoices as any });
      setIsAiProcessing(false);
      setSceneAiPrompt('');
      return;
    }
    
    if (isAnimationRequest && currentScene.choices.some(c => c.imageUrl)) {
      // Determine animation type
      let animationType = 'pulse';
      if (prompt.includes('glow')) animationType = 'glow';
      else if (prompt.includes('bounce')) animationType = 'bounce';
      
      const newChoices = currentScene.choices.map(choice => {
        if (choice.imageUrl) {
          const isReferenced = choice.imageLabel && 
            choice.imageLabel.toLowerCase().split(' ').some(word => 
              word.length > 2 && prompt.includes(word)
            );
          
          if (isReferenced || prompt.includes('uploaded') || prompt.includes('selected')) {
            toast.success(`"${animationType}" animation applied when selected!`);
            return { 
              ...choice, 
              imageStyle: { 
                ...((choice as any).imageStyle || {}),
                animation: animationType 
              }
            };
          }
        }
        return choice;
      });
      
      updateScene({ choices: newChoices as any });
      setIsAiProcessing(false);
      setSceneAiPrompt('');
      return;
    }
    
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
      
      // SMART PLACEHOLDERS: Use context-aware icons if none detected
      const iconChoices = detectedIcons.length >= 2 
        ? detectedIcons 
        : generateSmartPlaceholders(sceneAiPrompt);
      
      // Create visual choices
      const newChoices = iconChoices.slice(0, gridLayout === '3x2' ? 6 : 4).map((item, idx) => ({
        id: `choice-visual-${Date.now()}-${idx}`,
        text: item.label,
        isCorrect: idx === 0, // First is correct by default (Science: hidden)
        brandAligned: false,  // Brand alignment: visible to creator
        icon: item.icon,
        iconLabel: item.label,
      }));
      
      // Update scene with visual mode
      updateScene({
        displayMode: 'visual',
        gridLayout,
        choices: newChoices,
      });
      
      toast.success(`Visual grid applied! ${gridLayout} layout with smart placeholders`);
      setIsAiProcessing(false);
      setSceneAiPrompt('');
      return;
    }
    
    // ===== COLOR CHANGE DETECTION =====
    const colorKeywords = ['color', 'blue', 'red', 'green', 'purple', 'orange', 'pink', 'yellow', 'teal', 'cyan', 'magenta', 'neon'];
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
      else if (prompt.includes('pink') && prompt.includes('neon')) { newColor = '#ff10f0'; colorName = 'neon pink'; }
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

  // ===== VISION LOOP: Extract dominant colors from uploaded image =====
  const extractColorsFromImage = (imageUrl: string): Promise<ColorZones> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(distributeColorsToZones(['#1a1a2e', '#16213e', '#0f3460', '#e94560']));
          return;
        }
        
        // Sample image at low resolution for color extraction
        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);
        
        const imageData = ctx.getImageData(0, 0, 50, 50).data;
        const colorCounts: Record<string, number> = {};
        
        // Sample pixels and cluster colors
        for (let i = 0; i < imageData.length; i += 16) { // Sample every 4th pixel
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          
          // Quantize to reduce color count
          const qr = Math.round(r / 32) * 32;
          const qg = Math.round(g / 32) * 32;
          const qb = Math.round(b / 32) * 32;
          
          const hex = `#${qr.toString(16).padStart(2, '0')}${qg.toString(16).padStart(2, '0')}${qb.toString(16).padStart(2, '0')}`;
          colorCounts[hex] = (colorCounts[hex] || 0) + 1;
        }
        
        // Get top 4 colors sorted by frequency
        const sortedColors = Object.entries(colorCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 4)
          .map(([color]) => color);
        
        // Ensure we have 4 colors
        while (sortedColors.length < 4) {
          sortedColors.push('#1a1a2e');
        }
        
        resolve(distributeColorsToZones(sortedColors));
      };
      img.onerror = () => {
        resolve(distributeColorsToZones(['#1a1a2e', '#16213e', '#0f3460', '#e94560']));
      };
      img.src = imageUrl;
    });
  };

  // Handle image upload with Vision Loop analysis
  const handleChoiceImageUpload = async (choiceId: string, file: File) => {
    if (!currentScene) return;
    
    setVisionStatus('analyzing');
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string;
      const imageLabel = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      
      const newChoices = currentScene.choices.map(c => 
        c.id === choiceId 
          ? { ...c, imageUrl, imageLabel: imageLabel.slice(0, 20) }
          : c
      );
      updateScene({ choices: newChoices, displayMode: 'visual', gridLayout: '2x2' });
      toast.success(`Asset uploaded for choice: ${imageLabel}`);
      
      // Vision Loop: Analyze image and suggest color palette
      const extractedPalette = await extractColorsFromImage(imageUrl);
      setSuggestedPalette(extractedPalette);
      setVisionStatus('ready');
      
      toast.info('🎨 AI analyzed your asset! Try: "Match the UI theme to this product"', {
        duration: 5000,
      });
    };
    reader.readAsDataURL(file);
  };
  
  // ===== SMART PLACEHOLDERS: Generate contextual icons for empty slots =====
  const generateSmartPlaceholders = (prompt: string): { icon: string; label: string }[] => {
    const promptLower = prompt.toLowerCase();
    
    // Industry-specific placeholder sets
    const industryPlaceholders: Record<string, { icon: string; label: string }[]> = {
      retail: [
        { icon: 'ShoppingBag', label: 'Product' },
        { icon: 'Gem', label: 'Premium' },
        { icon: 'Star', label: 'Featured' },
        { icon: 'Heart', label: 'Wishlist' },
      ],
      fashion: [
        { icon: 'Footprints', label: 'Footwear' },
        { icon: 'Shirt', label: 'Apparel' },
        { icon: 'Crown', label: 'Accessory' },
        { icon: 'Sparkles', label: 'Style' },
      ],
      finance: [
        { icon: 'DollarSign', label: 'Budget' },
        { icon: 'TrendingUp', label: 'Growth' },
        { icon: 'PieChart', label: 'Portfolio' },
        { icon: 'Target', label: 'Goal' },
      ],
      communication: [
        { icon: 'MessageCircle', label: 'Message' },
        { icon: 'Users', label: 'Team' },
        { icon: 'Phone', label: 'Call' },
        { icon: 'Mail', label: 'Email' },
      ],
      marketing: [
        { icon: 'Megaphone', label: 'Campaign' },
        { icon: 'BarChart3', label: 'Analytics' },
        { icon: 'Target', label: 'Audience' },
        { icon: 'Sparkles', label: 'Creative' },
      ],
    };
    
    // Detect industry from prompt or formData
    const detectedIndustry = Object.keys(industryPlaceholders).find(industry => 
      promptLower.includes(industry) || formData.industry?.toLowerCase().includes(industry)
    );
    
    if (detectedIndustry) {
      return industryPlaceholders[detectedIndustry];
    }
    
    // Check for specific keywords
    if (promptLower.includes('luxury') || promptLower.includes('premium') || promptLower.includes('brand')) {
      return industryPlaceholders.fashion;
    }
    if (promptLower.includes('budget') || promptLower.includes('money') || promptLower.includes('invest')) {
      return industryPlaceholders.finance;
    }
    if (promptLower.includes('team') || promptLower.includes('collaborate')) {
      return industryPlaceholders.communication;
    }
    
    // Default generic placeholders
    return [
      { icon: 'Circle', label: 'Option A' },
      { icon: 'Square', label: 'Option B' },
      { icon: 'Triangle', label: 'Option C' },
      { icon: 'Star', label: 'Option D' },
    ];
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
        {/* ===== VISION LOOP STATUS INDICATOR ===== */}
        {visionStatus !== 'idle' && (
          <div className={`p-3 rounded-xl border ${
            visionStatus === 'analyzing' 
              ? 'border-amber-500/30 bg-amber-500/10' 
              : 'border-emerald-500/30 bg-emerald-500/10'
          }`}>
            <div className="flex items-center gap-2">
              {visionStatus === 'analyzing' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                  <span className={`text-xs font-medium ${textColor}`}>Analyzing your asset...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  <span className={`text-xs font-medium ${textColor}`}>AI palette ready!</span>
                </>
              )}
            </div>
            {visionStatus === 'ready' && suggestedPalette && (
              <div className="mt-2 flex items-center gap-1.5">
                <span className={`text-[10px] ${mutedColor}`}>Try:</span>
                <button
                  onClick={() => setSceneAiPrompt('Match the UI theme to this product')}
                  className="text-[10px] text-primary underline hover:no-underline"
                >
                  "Match the UI theme to this product"
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* ===== LAYER 1: EXPANDED AI COMMAND CENTER (Primary Interface) ===== */}
        <div className={`p-4 rounded-xl border-2 ${isDarkMode ? 'border-primary/30 bg-primary/5' : 'border-primary/20 bg-primary/5'}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-primary/20">
              <Wand2 className="h-4 w-4 text-primary" />
            </div>
            <span className={`text-sm font-semibold ${textColor}`}>Scene AI Command</span>
            {visionStatus === 'ready' && (
              <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30 text-[9px]">
                Vision Ready
              </Badge>
            )}
          </div>
          
          <p className={`text-xs ${mutedColor} mb-3`}>
            Local commands affect this scene. Global commands style the entire track—
            <span className="text-amber-500 font-medium"> DNA Layout is locked.</span>
          </p>
          
          {/* Example Commands - Local & Global */}
          <div className={`text-[10px] ${mutedColor} mb-2 space-y-0.5`}>
            <p className="font-medium text-primary">Local commands:</p>
            <p>• "Change choices to 4 vector icons: shoe, dress, hat, watch"</p>
            <p>• "Make my uploaded image 20% larger"</p>
            <p className="font-medium text-primary mt-1.5">Global commands:</p>
            <p>• "Make the whole track Gucci-themed"</p>
            <p>• "Apply luxury branding to all scenes"</p>
            {visionStatus === 'ready' && <p className="text-emerald-500">• "Match the UI theme to this product"</p>}
          </div>
          
          {/* Expanded Textarea - Min 4 rows */}
          <Textarea
            value={sceneAiPrompt}
            onChange={(e) => setSceneAiPrompt(e.target.value)}
            className={`resize-none ${inputBg} text-sm min-h-[100px]`}
            rows={4}
            placeholder="Describe the brand lesson for this scene or the entire track..."
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
                      {isExpanded && (
                        <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30 text-[9px]">
                          2-Column Layout
                        </Badge>
                      )}
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

                  {/* Expanded: 2-column grid, Collapsed: vertical stack */}
                  <div className={isExpanded ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
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
                  <div className={`${isExpanded ? 'p-4' : 'p-3'} rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'} space-y-2`}>
                    <p className={`text-[10px] ${mutedColor} mb-2`}>
                      Multi-Zone distribution ensures readable, professional UI
                    </p>
                    
                    <div className={`grid ${isExpanded ? 'grid-cols-4' : 'grid-cols-2'} gap-2`}>
                      <ZoneColorIndicator 
                        label="Surface" 
                        description="Background layer"
                        color={colorZones?.surface || designSettings.background}
                        isDarkMode={isDarkMode}
                        isExpanded={isExpanded}
                      />
                      <ZoneColorIndicator 
                        label="Container" 
                        description="Glass cards"
                        color={colorZones?.container || designSettings.secondary}
                        isDarkMode={isDarkMode}
                        isExpanded={isExpanded}
                      />
                      <ZoneColorIndicator 
                        label="Action" 
                        description="Buttons/Progress"
                        color={colorZones?.action || designSettings.primary}
                        isDarkMode={isDarkMode}
                        isExpanded={isExpanded}
                      />
                      <ZoneColorIndicator 
                        label="Typography" 
                        description="Text contrast"
                        color={colorZones?.typography || designSettings.text}
                        isDarkMode={isDarkMode}
                        isExpanded={isExpanded}
                      />
                    </div>
                  </div>
                  
{/* Color Remix Panel with 4-Zone Separation Logic */}
                  <ColorRemixPanel
                    primaryColor={designSettings.primary}
                    secondaryColor={designSettings.secondary}
                    accentColor={designSettings.accent}
                    backgroundColor={designSettings.background}
                    isDarkMode={isDarkMode}
                    onRemix={(colors) => {
                      // Apply Smart 4-Zone Distribution with isDarkMode awareness
                      const zones = distributeColorsToZones([
                        colors.primary, 
                        colors.secondary, 
                        colors.accent, 
                        colors.background
                      ], isDarkMode);
                      setColorZones(zones);
                      
                      // Map zones to design settings - ensure distinct separation
                      setDesignSettings({ 
                        ...designSettings, 
                        background: zones.surface,    // --brand-bg: Deep base
                        secondary: zones.container,   // --brand-container: Glassmorphic
                        primary: zones.action,        // --brand-primary: Buttons ONLY
                        text: zones.typography        // --brand-text: Auto-contrast
                      });
                      
                      // Update CSS variables for Live Mirror - 4 DISTINCT ZONES
                      document.documentElement.style.setProperty('--brand-bg', zones.surface);
                      document.documentElement.style.setProperty('--brand-container', zones.container);
                      document.documentElement.style.setProperty('--brand-primary', zones.action);
                      document.documentElement.style.setProperty('--brand-text', zones.typography);
                      // Legacy support
                      document.documentElement.style.setProperty('--brand-surface', zones.surface);
                      document.documentElement.style.setProperty('--brand-action', zones.action);
                      document.documentElement.style.setProperty('--brand-typography', zones.typography);
                      document.documentElement.style.setProperty('--brand-secondary', zones.container);
                      document.documentElement.style.setProperty('--brand-background', zones.surface);
                    }}
                  />
                  
                  {/* Apply to All Scenes Button (Global Sync) */}
                  {onApplyToAllScenes && (
                    <Button
                      onClick={() => {
                        onApplyToAllScenes(designSettings);
                        toast.success('🎨 Brand colors synced across all scenes!');
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 border-primary/50 text-primary hover:bg-primary/10"
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-2" />
                      Apply to All Scenes
                    </Button>
                  )}
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
    <div className={`h-full ${bgColor} border-l ${borderColor} backdrop-blur-xl flex relative`}>
      {/* Expand/Collapse Toggle Handle */}
      {onToggleExpand && (
        <button
          onClick={onToggleExpand}
          className={`absolute -left-3 top-1/2 -translate-y-1/2 z-10 
            w-6 h-12 rounded-l-lg flex items-center justify-center
            transition-all duration-200 hover:scale-105
            ${isDarkMode 
              ? 'bg-slate-800 border border-white/10 hover:bg-slate-700' 
              : 'bg-white border border-slate-200 hover:bg-slate-50 shadow-sm'
            }`}
          title={isExpanded ? 'Collapse Console' : 'Expand Console'}
        >
          {isExpanded ? (
            <ChevronsRight className={`h-4 w-4 ${mutedColor}`} />
          ) : (
            <ChevronsLeft className={`h-4 w-4 ${mutedColor}`} />
          )}
        </button>
      )}
      
      <div className="flex-1 flex flex-col">
        {/* Sidebar Header */}
        <div className={`px-4 py-3 border-b ${borderColor} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${textColor}`}>
              {currentStep === 4 && currentSceneIndex > 0 && currentSceneIndex < 7 
                ? 'Command Center' 
                : 'Properties'
              }
            </span>
            {isExpanded && (
              <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px]">
                Expanded
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            {currentStep === 4 
              ? (currentSceneIndex === 0 ? 'Intro' : currentSceneIndex === 7 ? 'Results' : `Scene ${currentSceneIndex}`)
              : `Step ${currentStep}`
            }
          </Badge>
        </div>

        {/* Sidebar Content */}
        <ScrollArea className="flex-1">
          <div className={`p-4 ${isExpanded ? 'pb-24' : 'pb-20'}`}>
            {renderProperties()}
          </div>
        </ScrollArea>
        
        {/* Sticky Action Buttons */}
        {currentStep === 4 && currentSceneIndex > 0 && currentSceneIndex < 7 && currentScene && (
          <div className={`
            sticky bottom-0 left-0 right-0 
            p-3 border-t ${borderColor}
            ${isDarkMode ? 'bg-slate-900/95' : 'bg-white/95'}
            backdrop-blur-xl
          `}>
            <div className={`flex gap-2 ${isExpanded ? 'flex-row' : 'flex-col'}`}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetToDefault}
                className={`border-amber-500/50 text-amber-600 hover:bg-amber-500/10 ${isExpanded ? 'flex-1' : 'w-full'}`}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
              <Button
                onClick={handleSceneAiCommand}
                disabled={isAiProcessing || !sceneAiPrompt.trim()}
                size="sm"
                className={`bg-primary text-primary-foreground hover:bg-primary/90 ${isExpanded ? 'flex-1' : 'w-full'}`}
              >
                {isAiProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {isExpanded ? `Apply to Scene ${currentSceneIndex}` : 'Apply'}
              </Button>
            </div>
          </div>
        )}
      </div>
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
  isDarkMode,
  isExpanded = false,
}: { 
  label: string; 
  description: string;
  color: string; 
  isDarkMode: boolean;
  isExpanded?: boolean;
}) {
  return (
    <div className={`${isExpanded ? 'p-3' : 'p-2'} rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-white'} border ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
      <div className="flex items-center gap-2">
        <div 
          className={`${isExpanded ? 'w-8 h-8' : 'w-5 h-5'} rounded-md border border-black/10 flex-shrink-0 transition-all`}
          style={{ backgroundColor: color }}
        />
        <div className="min-w-0">
          <p className={`${isExpanded ? 'text-xs' : 'text-[10px]'} font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} truncate`}>
            {label}
          </p>
          <p className={`${isExpanded ? 'text-[10px]' : 'text-[9px]'} ${isDarkMode ? 'text-white/50' : 'text-slate-500'} truncate`}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
