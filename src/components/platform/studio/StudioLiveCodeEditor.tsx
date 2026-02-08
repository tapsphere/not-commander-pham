/**
 * StudioLiveCodeEditor - Monaco-style Live Code Editor
 * 
 * Features:
 * - Bi-directional sync with Mobile Preview
 * - Protected "Read-Only" blocks for Scientific Core
 * - Hot-reload on code changes
 * - VS-Code style editing experience
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import { useStudioTheme } from './StudioThemeContext';
import { SceneData, DesignSettings, SubCompetency, TemplateFormData } from '../template-steps/types';
import { Lock, AlertTriangle, Code2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StudioLiveCodeEditorProps {
  formData: TemplateFormData;
  setFormData: (data: TemplateFormData) => void;
  scenes: SceneData[];
  setScenes: (scenes: SceneData[]) => void;
  designSettings: DesignSettings;
  setDesignSettings: (settings: DesignSettings) => void;
  currentSceneIndex: number;
  subCompetencies: SubCompetency[];
}

// Generate the editable code representation
const generateSceneCode = (
  formData: TemplateFormData,
  designSettings: DesignSettings,
  currentScene: SceneData | null,
  currentSubCompetency: SubCompetency | null,
  sceneIndex: number
): string => {
  const scenarioText = currentScene?.question || 'Enter scenario text...';
  const choices = currentScene?.choices || [];
  
  return `/**
 * PlayOps Template Configuration
 * Scene ${sceneIndex} - ${sceneIndex === 0 ? 'Intro' : sceneIndex === 7 ? 'Results' : 'Gameplay'}
 * 
 * ⚠️ PROTECTED BLOCKS are marked with [LOCKED] comments
 *    These sections ensure Certification integrity
 */

// ═══════════════════════════════════════════════════════════════
// BRAND CONFIGURATION (Editable)
// ═══════════════════════════════════════════════════════════════

export const brandConfig = {
  // Template Identity
  name: "${formData.name || 'Competency Validator'}",
  description: "${formData.description || 'Test your decision-making skills'}",
  industry: "${formData.industry || 'General'}",
  
  // Brand Colors - Edit these to change the UI
  colors: {
    primary: "${designSettings.primary}",      // Buttons, progress bars
    secondary: "${designSettings.secondary}",  // Supporting elements
    accent: "${designSettings.accent}",        // Interactive highlights
    background: "${designSettings.background}",// Main background
    text: "${designSettings.text}",            // Primary text
    highlight: "${designSettings.highlight}",  // Success states
  },
  
  // Typography
  font: "${designSettings.font}",
  
  // Effects
  particleEffect: "${designSettings.particleEffect}",
};

// ═══════════════════════════════════════════════════════════════
// SCENE CONTENT (Editable)
// ═══════════════════════════════════════════════════════════════

export const sceneContent = {
  sceneIndex: ${sceneIndex},
  
  // Scenario - The question or prompt shown to the player
  scenario: \`${scenarioText}\`,
  
  // Choices - Edit text, but correctness is locked
  choices: [
${choices.map((c, i) => `    {
      id: "${c.id}",
      text: "${c.text}",
      brandAligned: ${c.brandAligned || false},
      // [LOCKED] isCorrect: ${c.isCorrect} - Scientific logic
    }`).join(',\n')}
  ],
  
  // Time limit in seconds
  timeLimit: ${currentScene?.timeLimit || 30},
};

// ═══════════════════════════════════════════════════════════════
// [LOCKED] SCIENTIFIC CORE - Read Only
// ═══════════════════════════════════════════════════════════════

/**
 * ⛔ PROTECTED BLOCK - Scientific Logic
 * These values are derived from the Master DNA Library
 * and cannot be modified to ensure Certification integrity.
 */
const SCIENTIFIC_CORE = Object.freeze({
  // Sub-Competency Binding
  subCompetencyId: "${currentSubCompetency?.id || 'pending'}",
  statement: "${currentSubCompetency?.statement || 'Configure in Framework step'}",
  
  // Game Mechanic (from DNA Library)
  gameMechanic: "${currentSubCompetency?.game_mechanic || 'tap_select'}",
  validatorType: "${currentSubCompetency?.validator_type || 'precision'}",
  
  // Scoring Formulas (Locked)
  scoringL1: "${currentSubCompetency?.scoring_formula_level_1 || 'accuracy'}",
  scoringL2: "${currentSubCompetency?.scoring_formula_level_2 || 'accuracy * time_bonus'}",
  scoringL3: "${currentSubCompetency?.scoring_formula_level_3 || 'accuracy * time_bonus * stability'}",
  
  // XP Values (PlayOps Framework)
  xpValues: { L1: 100, L2: 250, L3: 500 },
});

// ═══════════════════════════════════════════════════════════════
// [LOCKED] TELEMETRY SAMPLING - Read Only (60Hz)
// ═══════════════════════════════════════════════════════════════

/**
 * ⛔ PROTECTED BLOCK - Biometric Telemetry
 * 60Hz sampling rate for jitter variance detection
 */
const TELEMETRY_CONFIG = Object.freeze({
  sampleRate: 60, // Hz - DO NOT MODIFY
  captureFields: ['timestamp', 'x', 'y', 'pressure', 'velocity'],
  jitterThreshold: 0.15, // 15% variance tolerance
  tripleGate: {
    accuracy: true,
    timeLimit: true,
    jitterVariance: true,
  },
});

// ═══════════════════════════════════════════════════════════════
// [LOCKED] TELEGRAM SDK INITIALIZATION - Read Only
// ═══════════════════════════════════════════════════════════════

/**
 * ⛔ PROTECTED BLOCK - Telegram Mini App SDK
 * Native integration is locked for security
 */
const TMA_INIT = Object.freeze({
  ready: () => window.Telegram?.WebApp?.ready(),
  expand: () => window.Telegram?.WebApp?.expand(),
  enableClosingConfirmation: true,
  disableVerticalSwipes: true,
  haptics: {
    impact: 'medium',
    notification: 'success',
    selection: true,
  },
  cloudStorage: {
    key: 'mastery_progress',
    persist: true,
  },
});

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export { SCIENTIFIC_CORE, TELEMETRY_CONFIG, TMA_INIT };
`;
};

// Parse code changes back to state
const parseCodeToState = (
  code: string,
  currentFormData: TemplateFormData,
  currentDesignSettings: DesignSettings,
  currentScenes: SceneData[],
  currentSceneIndex: number
): {
  formData: Partial<TemplateFormData>;
  designSettings: Partial<DesignSettings>;
  sceneUpdates: Partial<SceneData>;
} | null => {
  try {
    // Extract brand config values using regex
    const nameMatch = code.match(/name:\s*"([^"]*)"/);
    const descMatch = code.match(/description:\s*"([^"]*)"/);
    const industryMatch = code.match(/industry:\s*"([^"]*)"/);
    
    // Extract colors
    const primaryMatch = code.match(/primary:\s*"([^"]*)"/);
    const secondaryMatch = code.match(/secondary:\s*"([^"]*)"/);
    const accentMatch = code.match(/accent:\s*"([^"]*)"/);
    const backgroundMatch = code.match(/background:\s*"([^"]*)"/);
    const textMatch = code.match(/text:\s*"([^"]*)"/);
    const highlightMatch = code.match(/highlight:\s*"([^"]*)"/);
    
    // Extract font
    const fontMatch = code.match(/font:\s*"([^"]*)"/);
    
    // Extract scenario
    const scenarioMatch = code.match(/scenario:\s*`([^`]*)`/);
    
    // Extract time limit
    const timeLimitMatch = code.match(/timeLimit:\s*(\d+)/);
    
    return {
      formData: {
        name: nameMatch?.[1] || currentFormData.name,
        description: descMatch?.[1] || currentFormData.description,
        industry: industryMatch?.[1] || currentFormData.industry,
      },
      designSettings: {
        primary: primaryMatch?.[1] || currentDesignSettings.primary,
        secondary: secondaryMatch?.[1] || currentDesignSettings.secondary,
        accent: accentMatch?.[1] || currentDesignSettings.accent,
        background: backgroundMatch?.[1] || currentDesignSettings.background,
        text: textMatch?.[1] || currentDesignSettings.text,
        highlight: highlightMatch?.[1] || currentDesignSettings.highlight,
        font: fontMatch?.[1] || currentDesignSettings.font,
      },
      sceneUpdates: {
        question: scenarioMatch?.[1] || undefined,
        timeLimit: timeLimitMatch ? parseInt(timeLimitMatch[1]) as 30 | 45 | 60 : undefined,
      },
    };
  } catch (e) {
    console.error('Failed to parse code:', e);
    return null;
  }
};

export function StudioLiveCodeEditor({
  formData,
  setFormData,
  scenes,
  setScenes,
  designSettings,
  setDesignSettings,
  currentSceneIndex,
  subCompetencies,
}: StudioLiveCodeEditorProps) {
  const { isDarkMode } = useStudioTheme();
  const [isReady, setIsReady] = useState(false);
  const editorRef = useRef<any>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get current scene data
  const currentScene = currentSceneIndex > 0 && currentSceneIndex < 7 
    ? scenes[currentSceneIndex - 1] 
    : null;
  const currentSubCompetency = currentScene 
    ? subCompetencies.find(s => s.id === currentScene.subCompetencyId)
    : null;
  
  // Generate code representation
  const codeContent = useMemo(() => 
    generateSceneCode(
      formData, 
      designSettings, 
      currentScene, 
      currentSubCompetency || null,
      currentSceneIndex
    ), 
    [formData, designSettings, currentScene, currentSubCompetency, currentSceneIndex]
  );
  
  // Handle editor mount
  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    setIsReady(true);
    
    // Configure protected block decorations
    const model = editor.getModel();
    if (model) {
      // Add decorations for locked sections
      const decorations = [
        // Scientific Core block
        {
          range: new monaco.Range(70, 1, 95, 1),
          options: {
            isWholeLine: true,
            className: 'protected-block-scientific',
            glyphMarginClassName: 'protected-glyph',
            glyphMarginHoverMessage: { value: '🔒 **Scientific Core Locked**\n\nThis section ensures Certification integrity and cannot be modified.' },
            minimap: { color: '#ef4444', position: 1 },
          },
        },
        // Telemetry block
        {
          range: new monaco.Range(97, 1, 115, 1),
          options: {
            isWholeLine: true,
            className: 'protected-block-telemetry',
            glyphMarginHoverMessage: { value: '🔒 **Telemetry Locked**\n\n60Hz sampling rate is required for biometric validation.' },
            minimap: { color: '#f97316', position: 1 },
          },
        },
        // TMA block
        {
          range: new monaco.Range(117, 1, 135, 1),
          options: {
            isWholeLine: true,
            className: 'protected-block-tma',
            glyphMarginHoverMessage: { value: '🔒 **Telegram SDK Locked**\n\nNative integration is locked for security.' },
            minimap: { color: '#3b82f6', position: 1 },
          },
        },
      ];
      
      editor.createDecorationsCollection(decorations);
    }
    
    // Define custom theme
    monaco.editor.defineTheme('playops-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6b7280' },
        { token: 'keyword', foreground: 'c084fc' },
        { token: 'string', foreground: '4ade80' },
        { token: 'number', foreground: 'fbbf24' },
      ],
      colors: {
        'editor.background': '#0f172a',
        'editor.foreground': '#e2e8f0',
        'editor.lineHighlightBackground': '#1e293b',
        'editor.selectionBackground': '#3b82f640',
        'editorGutter.background': '#0f172a',
        'editorLineNumber.foreground': '#475569',
      },
    });
    
    monaco.editor.defineTheme('playops-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#f8fafc',
        'editor.foreground': '#1e293b',
        'editor.lineHighlightBackground': '#f1f5f9',
        'editor.selectionBackground': '#3b82f630',
      },
    });
    
    editor.updateOptions({
      theme: isDarkMode ? 'playops-dark' : 'playops-light',
    });
  }, [isDarkMode]);
  
  // Handle code changes with debounce
  const handleCodeChange: OnChange = useCallback((value) => {
    if (!value) return;
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Debounce updates for hot-reload
    debounceRef.current = setTimeout(() => {
      const parsed = parseCodeToState(
        value, 
        formData, 
        designSettings, 
        scenes, 
        currentSceneIndex
      );
      
      if (parsed) {
        // Update form data
        if (parsed.formData.name !== formData.name || 
            parsed.formData.description !== formData.description) {
          setFormData({ ...formData, ...parsed.formData });
        }
        
        // Update design settings
        const designChanged = Object.keys(parsed.designSettings).some(
          key => parsed.designSettings[key as keyof DesignSettings] !== designSettings[key as keyof DesignSettings]
        );
        if (designChanged) {
          setDesignSettings({ ...designSettings, ...parsed.designSettings });
          
          // Update CSS variables for instant preview
          if (parsed.designSettings.primary) {
            document.documentElement.style.setProperty('--brand-primary', parsed.designSettings.primary);
          }
          if (parsed.designSettings.background) {
            document.documentElement.style.setProperty('--brand-bg', parsed.designSettings.background);
          }
        }
        
        // Update scene
        if (currentScene && parsed.sceneUpdates.question) {
          const newScenes = scenes.map((s, i) => 
            i === currentSceneIndex - 1 
              ? { ...s, ...parsed.sceneUpdates }
              : s
          );
          setScenes(newScenes);
        }
      }
    }, 300); // 300ms debounce
  }, [formData, designSettings, scenes, currentSceneIndex, currentScene, setFormData, setDesignSettings, setScenes]);
  
  // Update theme when dark mode changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        theme: isDarkMode ? 'playops-dark' : 'playops-light',
      });
    }
  }, [isDarkMode]);
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2 border-b ${
        isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <Code2 className={`h-4 w-4 ${isDarkMode ? 'text-primary' : 'text-primary'}`} />
          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Scene {currentSceneIndex} Configuration
          </span>
        </div>
        
        {/* Protected blocks legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className={isDarkMode ? 'text-white/60' : 'text-slate-500'}>Scientific</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span className={isDarkMode ? 'text-white/60' : 'text-slate-500'}>Telemetry</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className={isDarkMode ? 'text-white/60' : 'text-slate-500'}>TMA SDK</span>
          </div>
          <Lock className={`h-3 w-3 ${isDarkMode ? 'text-amber-500' : 'text-amber-600'}`} />
        </div>
      </div>
      
      {/* Editor */}
      <div className="flex-1 relative">
        {!isReady && (
          <div className={`absolute inset-0 flex items-center justify-center ${
            isDarkMode ? 'bg-slate-900' : 'bg-slate-50'
          }`}>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        
        <Editor
          height="100%"
          defaultLanguage="typescript"
          value={codeContent}
          onChange={handleCodeChange}
          onMount={handleEditorMount}
          theme={isDarkMode ? 'playops-dark' : 'playops-light'}
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineHeight: 20,
            padding: { top: 16, bottom: 16 },
            minimap: { enabled: true, scale: 1 },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            glyphMargin: true,
            folding: true,
            foldingHighlight: true,
            showFoldingControls: 'mouseover',
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
            // Read-only ranges would be ideal but Monaco doesn't support partial read-only
            // Instead we use visual indicators
          }}
        />
      </div>
      
      {/* Footer hint */}
      <div className={`px-4 py-2 border-t flex items-center gap-2 ${
        isDarkMode ? 'bg-slate-900/50 border-white/10' : 'bg-slate-50 border-slate-200'
      }`}>
        <AlertTriangle className="h-3 w-3 text-amber-500" />
        <span className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
          Changes sync instantly. Protected blocks (Scientific, Telemetry, TMA) are locked for Certification.
        </span>
      </div>
    </div>
  );
}
