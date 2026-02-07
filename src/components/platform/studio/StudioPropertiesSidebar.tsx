import { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, Trophy, Gamepad2, Lock, Plus, Trash2, Upload, 
  Sparkles, Palette, Box, FileText, Loader2, Target, Zap,
  AlertTriangle, RotateCcw, Wand2
} from 'lucide-react';
import { useStudioTheme } from './StudioThemeContext';
import { DesignSettings, SceneData, SubCompetency, TemplateFormData, INDUSTRIES, createDefaultScene } from '../template-steps/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

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
  const [localAiPrompt, setLocalAiPrompt] = useState('');
  const [isLocalAiProcessing, setIsLocalAiProcessing] = useState(false);
  
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
    setLocalAiPrompt('');
    toast.success('Scene reset to DNA Library defaults');
  };

  // Apply local AI adjustments to current scene only
  const handleLocalAiAdjust = async () => {
    if (!currentScene || !localAiPrompt.trim()) return;
    
    setIsLocalAiProcessing(true);
    
    // Check if the prompt is about color changes
    const colorPrompt = localAiPrompt.toLowerCase();
    if (colorPrompt.includes('color') || colorPrompt.includes('blue') || colorPrompt.includes('red') || 
        colorPrompt.includes('green') || colorPrompt.includes('purple') || colorPrompt.includes('orange')) {
      // Parse color from prompt and apply
      let newColor = designSettings.primary;
      if (colorPrompt.includes('blue')) newColor = '#3b82f6';
      else if (colorPrompt.includes('red')) newColor = '#ef4444';
      else if (colorPrompt.includes('green')) newColor = '#22c55e';
      else if (colorPrompt.includes('purple')) newColor = '#a855f7';
      else if (colorPrompt.includes('orange')) newColor = '#f97316';
      
      setDesignSettings({ ...designSettings, primary: newColor });
      document.documentElement.style.setProperty('--brand-primary', newColor);
      toast.success(`Brand color changed to ${newColor}`);
      setIsLocalAiProcessing(false);
      setLocalAiPrompt('');
      return;
    }
    
    // Simulate AI processing for text adjustments
    await new Promise(r => setTimeout(r, 1200));
    
    const adjustedQuestion = `${currentScene.question} (Adjusted: ${localAiPrompt})`;
    updateScene({ question: adjustedQuestion });
    
    toast.success('Local adjustment applied to this scene only');
    setIsLocalAiProcessing(false);
    setLocalAiPrompt('');
  };

  const addChoice = () => {
    if (!currentScene || currentScene.choices.length >= 10) return;
    const newChoices = [...currentScene.choices, {
      id: `choice-${Date.now()}`,
      text: `Option ${currentScene.choices.length + 1}`,
      isCorrect: false,
    }];
    updateScene({ choices: newChoices });
  };

  const removeChoice = (choiceId: string) => {
    if (!currentScene || currentScene.choices.length <= 2) return;
    const newChoices = currentScene.choices.filter(c => c.id !== choiceId);
    updateScene({ choices: newChoices });
  };

  const updateChoice = (choiceId: string, updates: { text?: string; isCorrect?: boolean }) => {
    if (!currentScene) return;
    const newChoices = currentScene.choices.map(c => 
      c.id === choiceId ? { ...c, ...updates } : c
    );
    updateScene({ choices: newChoices });
  };

  const handleAiRemix = async () => {
    if (!currentScene) return;
    setIsRemixing(true);
    
    await new Promise(r => setTimeout(r, 1500));
    
    const brandContext = formData.name || 'your brand';
    const actionCue = currentSubCompetency?.action_cue || '';
    const updatedQuestion = `Based on the mission: "${actionCue}" - ${currentScene.question.replace(/scenario|situation/gi, `${brandContext} challenge`)}`;
    
    updateScene({ question: updatedQuestion });
    toast.success('Scene remixed with brand context and Action Cue!');
    setIsRemixing(false);
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
      <div className="space-y-5">
        {/* RESET TO DEFAULT - Prominent at top */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetToDefault}
          className="w-full border-amber-500/50 text-amber-600 hover:bg-amber-500/10 hover:border-amber-500"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Default
        </Button>

        <SectionHeader icon={Gamepad2} label={`Scene ${currentSceneIndex}`} isDarkMode={isDarkMode} />

        {/* EDITABLE Action Cue (Data Panel) */}
        <div className="space-y-2">
          <Label className={mutedColor}>Action Cue</Label>
          <Textarea
            value={currentSubCompetency?.action_cue || ''}
            readOnly
            className={`resize-none ${inputBg} opacity-70`}
            rows={2}
            placeholder="Action cue from framework..."
          />
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Lock className="h-2.5 w-2.5" />
            Linked to DNA Library
          </p>
        </div>

        {/* LOCKED Framework Data */}
        {currentSubCompetency && (
          <div className="space-y-2">
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

        {/* Editable Question / Prompt */}
        <div className="space-y-2">
          <Label className={mutedColor}>Question / Prompt</Label>
          <Textarea
            value={currentScene.question}
            onChange={(e) => updateScene({ question: e.target.value })}
            className={`resize-none ${inputBg}`}
            rows={3}
            placeholder="Enter the scene question..."
          />
        </div>

        {/* Dynamic Choices (2-10) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className={mutedColor}>Choices ({currentScene.choices.length}/10)</Label>
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

          <div className="space-y-2">
            {currentScene.choices.map((choice, idx) => (
              <div key={choice.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    value={choice.text}
                    onChange={(e) => updateChoice(choice.id, { text: e.target.value })}
                    className={`text-sm h-9 ${inputBg}`}
                    placeholder={`Choice ${idx + 1}...`}
                  />
                </div>
                <button
                  onClick={() => updateChoice(choice.id, { isCorrect: !choice.isCorrect })}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                    choice.isCorrect 
                      ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' 
                      : isDarkMode ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-400'
                  }`}
                  title={choice.isCorrect ? 'Correct answer' : 'Mark as correct'}
                >
                  ✓
                </button>
                <button
                  onClick={() => removeChoice(choice.id)}
                  disabled={currentScene.choices.length <= 2}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    currentScene.choices.length <= 2 
                      ? 'opacity-30 cursor-not-allowed' 
                      : 'hover:bg-red-500/10 text-red-400'
                  }`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Time Limit */}
        <div className="space-y-2">
          <Label className={mutedColor}>Time Limit</Label>
          <div className="flex gap-2">
            {[30, 45, 60].map((time) => (
              <button
                key={time}
                onClick={() => updateScene({ timeLimit: time as 30 | 45 | 60 })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
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

        {/* BRAND COLOR REMIX - Updates CSS variable globally */}
        <div className="space-y-3 pt-4 border-t" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <Label className={textColor}>Brand Color Remix</Label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={designSettings.primary}
              onChange={(e) => {
                const newColor = e.target.value;
                setDesignSettings({ ...designSettings, primary: newColor });
                // Update CSS variable globally
                document.documentElement.style.setProperty('--brand-primary', newColor);
                toast.success(`Brand color updated: ${newColor}`);
              }}
              className="w-10 h-10 rounded-lg cursor-pointer border-0"
            />
            <div className="flex-1">
              <span className={`text-xs ${mutedColor}`}>--brand-primary</span>
              <p className={`text-sm font-mono ${textColor}`}>{designSettings.primary}</p>
            </div>
          </div>
          {/* Live Preview Swatch */}
          <div 
            className="h-8 rounded-lg border transition-all duration-200"
            style={{ 
              backgroundColor: designSettings.primary,
              borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
            }}
          />
        </div>

        {/* LOCAL AI ADJUSTMENTS - Single Scene Only */}
        <div className="space-y-3 pt-4 border-t" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            <Label className={textColor}>Local Adjustments</Label>
          </div>
          <p className={`text-xs ${mutedColor}`}>
            Only affects this scene. Changes won't propagate.
          </p>
          <Textarea
            value={localAiPrompt}
            onChange={(e) => setLocalAiPrompt(e.target.value)}
            className={`resize-none ${inputBg}`}
            rows={2}
            placeholder="e.g., Make the tone more urgent..."
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleLocalAiAdjust}
            disabled={isLocalAiProcessing || !localAiPrompt.trim()}
            className="w-full"
          >
            {isLocalAiProcessing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Apply to This Scene
          </Button>
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
        <span className={`text-sm font-medium ${textColor}`}>Properties</span>
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
