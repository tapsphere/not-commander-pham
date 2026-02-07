import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Play, Trophy, Gamepad2, Lock, Plus, Trash2, Upload, 
  Sparkles, Palette, Box, FileText, Loader2 
} from 'lucide-react';
import { useStudioTheme } from './StudioThemeContext';
import { DesignSettings, SceneData, SubCompetency, TemplateFormData } from '../template-steps/types';
import { toast } from 'sonner';

interface StudioPropertiesSidebarProps {
  currentSceneIndex: number;
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

  const updateScene = (updates: Partial<SceneData>) => {
    if (!currentScene) return;
    const newScenes = scenes.map((s, i) => 
      i === currentSceneIndex - 1 ? { ...s, ...updates } : s
    );
    setScenes(newScenes);
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
    
    // Simulate AI remix
    await new Promise(r => setTimeout(r, 1500));
    
    const brandContext = formData.name || 'your brand';
    const updatedQuestion = currentScene.question.includes('scenario')
      ? currentScene.question.replace('scenario', `${brandContext} challenge`)
      : `In this ${brandContext} challenge: ${currentScene.question}`;
    
    updateScene({ question: updatedQuestion });
    toast.success('Scene remixed with brand context!');
    setIsRemixing(false);
  };

  // Render based on scene type
  const renderIntroProperties = () => (
    <div className="space-y-6">
      <SectionHeader icon={Play} label="Intro Screen" />
      
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
            h-20 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-all
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
        <Label className={mutedColor}>3D Mascot (Lottie JSON)</Label>
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
                <span className={mutedColor}>Optional .json</span>
              </>
            )}
          </div>
        </label>
      </div>

      {/* Welcome Text */}
      <div className="space-y-2">
        <Label className={mutedColor}>Welcome Title</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={inputBg}
          placeholder="Your Validator Name"
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

      {/* Brand Colors */}
      <div className="space-y-3 pt-4 border-t border-dashed" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
        <div className="flex items-center gap-2">
          <Palette className={`h-4 w-4 ${mutedColor}`} />
          <span className={`text-sm font-medium ${textColor}`}>Brand Colors</span>
        </div>
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

  const renderGameplayProperties = () => {
    if (!currentScene) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Gamepad2 className={`h-10 w-10 mb-3 ${mutedColor}`} />
          <p className={`text-sm ${mutedColor}`}>
            This scene is not configured yet.
          </p>
          <p className={`text-xs mt-1 ${mutedColor}`}>
            Select competencies in Framework step to create scenes.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <SectionHeader icon={Gamepad2} label={`Scene ${currentSceneIndex}`} />

        {/* Locked Framework Badge */}
        {currentSubCompetency && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs font-medium text-amber-600">LOCKED FRAMEWORK</span>
            </div>
            {currentSubCompetency.action_cue && (
              <p className={`text-xs ${textColor} mb-1`}>
                <span className={mutedColor}>Action Cue:</span> {currentSubCompetency.action_cue}
              </p>
            )}
            {currentSubCompetency.game_mechanic && (
              <p className={`text-xs ${textColor}`}>
                <span className={mutedColor}>Mechanic:</span> {currentSubCompetency.game_mechanic}
              </p>
            )}
          </div>
        )}

        {/* Question */}
        <div className="space-y-2">
          <Label className={mutedColor}>Question / Prompt</Label>
          <Textarea
            value={currentScene.question}
            onChange={(e) => updateScene({ question: e.target.value })}
            className={`resize-none ${inputBg}`}
            rows={3}
            placeholder="Enter the scene question..."
          />
          
          {/* AI Remix Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAiRemix}
            disabled={isRemixing}
            className="w-full mt-2"
          >
            {isRemixing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Remix with Brand Context
          </Button>
        </div>

        {/* Choices */}
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
      </div>
    );
  };

  const renderResultsProperties = () => (
    <div className="space-y-6">
      <SectionHeader icon={Trophy} label="Results Screen" />

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

      <div className="space-y-3 pt-4 border-t border-dashed" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
        <Label className={mutedColor}>Result Actions</Label>
        
        <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
          <span className={`text-sm ${textColor}`}>Show "Claim Badge" Button</span>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
          <span className={`text-sm ${textColor}`}>Show Leaderboard Link</span>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
          <span className={`text-sm ${textColor}`}>Enable Retry</span>
          <Switch defaultChecked />
        </div>
      </div>
    </div>
  );

  const renderProperties = () => {
    if (currentSceneIndex === 0) return renderIntroProperties();
    if (currentSceneIndex === 7) return renderResultsProperties();
    return renderGameplayProperties();
  };

  return (
    <div className={`h-full ${bgColor} border-l ${borderColor} backdrop-blur-xl flex flex-col`}>
      {/* Sidebar Header */}
      <div className={`px-4 py-3 border-b ${borderColor} flex items-center justify-between`}>
        <span className={`text-sm font-medium ${textColor}`}>Properties</span>
        <Badge variant="outline" className="text-xs">
          {currentSceneIndex === 0 ? 'Intro' : currentSceneIndex === 7 ? 'Results' : `Scene ${currentSceneIndex}`}
        </Badge>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderProperties()}
      </div>
    </div>
  );
}

// Helper Components
function SectionHeader({ icon: Icon, label }: { icon: any; label: string }) {
  const { isDarkMode } = useStudioTheme();
  return (
    <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
      <Icon className={`h-4 w-4 ${isDarkMode ? 'text-white/70' : 'text-slate-600'}`} />
      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{label}</span>
    </div>
  );
}

function ColorPicker({ 
  label, 
  value, 
  onChange, 
  isDarkMode 
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  isDarkMode: boolean;
}) {
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
