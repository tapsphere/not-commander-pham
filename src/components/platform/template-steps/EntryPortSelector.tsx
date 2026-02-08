import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Upload, 
  Search, 
  Sparkles, 
  FileText, 
  Lock, 
  Loader2,
  ArrowRight,
  CheckCircle,
  Lightbulb
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Competency, SubCompetency, SceneData, createDefaultScene } from './types';

type EntryPath = 'upload' | 'manual' | 'combine' | null;

interface EntryPortSelectorProps {
  competencies: Competency[];
  subCompetencies: SubCompetency[];
  onPathComplete: (
    competencyId: string,
    selectedSubIds: string[],
    scenes: SceneData[],
    pathUsed: EntryPath
  ) => void;
  onManualSelect: () => void; // Trigger existing manual flow
}

// Fashion demo sample data
const FASHION_DEMO = {
  theme: 'High-end fashion brand teaching window merchandising',
  skill: 'Analytical Thinking',
};

export function EntryPortSelector({
  competencies,
  subCompetencies,
  onPathComplete,
  onManualSelect,
}: EntryPortSelectorProps) {
  const [selectedPath, setSelectedPath] = useState<EntryPath>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Path 1: Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Path 3: Combine state
  const [combineTheme, setCombineTheme] = useState('');
  const [combineSkill, setCombineSkill] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      setUploadedFile(file);
      toast.success(`"${file.name}" uploaded successfully`);
    }
  };

  const handleParseUpload = async () => {
    if (!uploadedFile) {
      toast.error('Please upload a PDF first');
      return;
    }

    setIsProcessing(true);
    try {
      // Call parse-document edge function
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const { data, error } = await supabase.functions.invoke('parse-document', {
        body: formData,
      });

      if (error) throw error;

      if (data?.text) {
        // Use AI to map extracted text to competency
        const mappingResponse = await supabase.functions.invoke('generate-game', {
          body: {
            action: 'map-document',
            documentText: data.text.substring(0, 10000), // Limit to 10k chars
            competencies: competencies.map(c => ({ id: c.id, name: c.name, category: c.cbe_category })),
          },
        });

        if (mappingResponse.data?.competencyId) {
          const competencyId = mappingResponse.data.competencyId;
          const matchedSubs = subCompetencies.filter(s => s.competency_id === competencyId).slice(0, 6);
          
          // Create scenes from matched sub-competencies
          const scenes = matchedSubs.map((sub, idx) => {
            const scene = createDefaultScene(sub.id, idx + 1);
            scene.question = sub.action_cue || `Scene ${idx + 1}: Analyze the scenario`;
            return scene;
          });

          onPathComplete(competencyId, matchedSubs.map(s => s.id), scenes, 'upload');
          toast.success(`Mapped to "${competencies.find(c => c.id === competencyId)?.name}" with ${matchedSubs.length} scenes`);
        } else {
          toast.error('Could not map document to a competency. Try manual selection.');
          setSelectedPath('manual');
        }
      }
    } catch (error: any) {
      console.error('Parse error:', error);
      toast.error('Failed to parse document. Try manual selection.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTrySample = () => {
    setCombineTheme(FASHION_DEMO.theme);
    setCombineSkill(FASHION_DEMO.skill);
    toast.success('Fashion demo loaded!');
  };

  const handleCombineGenerate = async () => {
    if (!combineTheme.trim() || !combineSkill.trim()) {
      toast.error('Please enter both a Theme and a Skill');
      return;
    }

    setIsProcessing(true);
    try {
      // Find matching competency by skill name
      const matchedCompetency = competencies.find(c => 
        c.name.toLowerCase().includes(combineSkill.toLowerCase()) ||
        combineSkill.toLowerCase().includes(c.name.toLowerCase())
      );

      if (!matchedCompetency) {
        toast.error(`No competency found matching "${combineSkill}". Try a different skill.`);
        setIsProcessing(false);
        return;
      }

      // Get 6 sub-competencies for this competency
      const matchedSubs = subCompetencies
        .filter(s => s.competency_id === matchedCompetency.id)
        .slice(0, 6);

      if (matchedSubs.length === 0) {
        toast.error(`No sub-competencies found for "${matchedCompetency.name}".`);
        setIsProcessing(false);
        return;
      }

      // Generate AI-themed scenes
      const response = await supabase.functions.invoke('generate-game', {
        body: {
          action: 'theme-scenes',
          theme: combineTheme,
          competencyName: matchedCompetency.name,
          subCompetencies: matchedSubs.map(s => ({
            id: s.id,
            statement: s.statement,
            action_cue: s.action_cue,
            game_mechanic: s.game_mechanic,
          })),
        },
      });

      // Create scenes with AI-generated content or fallback
      const scenes = matchedSubs.map((sub, idx) => {
        const scene = createDefaultScene(sub.id, idx + 1);
        const aiScene = response.data?.scenes?.[idx];
        
        scene.question = aiScene?.question || 
          `[${combineTheme}] ${sub.action_cue || 'Make your decision'}`;
        
        if (aiScene?.choices) {
          scene.choices = scene.choices.map((choice, cidx) => ({
            ...choice,
            text: aiScene.choices[cidx]?.text || choice.text,
          }));
        }
        
        return scene;
      });

      onPathComplete(matchedCompetency.id, matchedSubs.map(s => s.id), scenes, 'combine');
      toast.success(`Created ${scenes.length} "${combineTheme}" themed scenes for ${matchedCompetency.name}!`);
    } catch (error: any) {
      console.error('Combine error:', error);
      
      // Fallback: Still create scenes without AI theming
      const matchedCompetency = competencies.find(c => 
        c.name.toLowerCase().includes(combineSkill.toLowerCase())
      );
      
      if (matchedCompetency) {
        const matchedSubs = subCompetencies
          .filter(s => s.competency_id === matchedCompetency.id)
          .slice(0, 6);
        
        const scenes = matchedSubs.map((sub, idx) => {
          const scene = createDefaultScene(sub.id, idx + 1);
          scene.question = `[${combineTheme}] ${sub.action_cue || 'Make your decision'}`;
          return scene;
        });

        onPathComplete(matchedCompetency.id, matchedSubs.map(s => s.id), scenes, 'combine');
        toast.success(`Created ${scenes.length} scenes (AI theming skipped)`);
      } else {
        toast.error('Could not generate scenes. Try manual selection.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Path selection cards
  if (!selectedPath) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Entry Port</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Choose how you want to build your 6-scene V5 validator
          </p>
        </div>

        <div className="grid gap-4">
          {/* Path 1: Brand Upload */}
          <button
            onClick={() => setSelectedPath('upload')}
            className="group relative flex items-start gap-4 p-5 bg-muted/50 border-2 border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
          >
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20">
              <Upload className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground">Brand Upload</h3>
                <Badge variant="secondary" className="text-xs">Parser</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload a PDF manual. AI parses it and maps to a Competency + 6 Sub-competencies from V5.
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>

          {/* Path 2: Manual Selection */}
          <button
            onClick={() => {
              setSelectedPath('manual');
              onManualSelect();
            }}
            className="group relative flex items-start gap-4 p-5 bg-muted/50 border-2 border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
          >
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20">
              <Search className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground">Manual Selection</h3>
                <Badge variant="secondary" className="text-xs">Expert</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Search competencies from Column B. Selecting one loads 6 empty scientific scenes for manual writing.
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>

          {/* Path 3: Simple Combine */}
          <button
            onClick={() => setSelectedPath('combine')}
            className="group relative flex items-start gap-4 p-5 bg-muted/50 border-2 border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
          >
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground">Simple Combine</h3>
                <Badge variant="secondary" className="text-xs">AI Demo</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter a Theme + Skill. AI pre-fills 6 themed scenes based on V5 logic. Great for demos!
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        </div>
      </div>
    );
  }

  // Path 1: Upload UI
  if (selectedPath === 'upload') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Upload className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Brand Upload</h3>
              <p className="text-xs text-muted-foreground">AI parses your PDF → V5 structure</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSelectedPath(null)}>
            ← Back
          </Button>
        </div>

        <div className="bg-muted/50 border-2 border-dashed border-border rounded-xl p-6">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            className="flex flex-col items-center gap-3 cursor-pointer"
          >
            {uploadedFile ? (
              <>
                <CheckCircle className="h-10 w-10 text-emerald-500" />
                <div className="text-center">
                  <p className="font-medium text-foreground">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadedFile.size / 1024).toFixed(1)} KB • Click to change
                  </p>
                </div>
              </>
            ) : (
              <>
                <FileText className="h-10 w-10 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-medium text-foreground">Drop PDF here or click to upload</p>
                  <p className="text-xs text-muted-foreground">
                    Training manuals, SOPs, brand guidelines
                  </p>
                </div>
              </>
            )}
          </label>
        </div>

        <Button
          onClick={handleParseUpload}
          disabled={!uploadedFile || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Parsing & Mapping...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Parse & Map to V5
            </>
          )}
        </Button>
      </div>
    );
  }

  // Path 3: Combine UI
  if (selectedPath === 'combine') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Sparkles className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Simple Combine</h3>
              <p className="text-xs text-muted-foreground">Theme + Skill → 6 AI-themed scenes</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSelectedPath(null)}>
            ← Back
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-foreground font-medium mb-2 block">Theme / Context</Label>
            <Input
              value={combineTheme}
              onChange={(e) => setCombineTheme(e.target.value)}
              placeholder="e.g., High-end fashion brand teaching window merchandising"
              className="bg-background"
            />
          </div>

          <div>
            <Label className="text-foreground font-medium mb-2 block">Skill / Competency</Label>
            <Input
              value={combineSkill}
              onChange={(e) => setCombineSkill(e.target.value)}
              placeholder="e.g., Analytical Thinking, Problem Solving, Communication..."
              className="bg-background"
            />
          </div>

          <Button
            variant="outline"
            onClick={handleTrySample}
            className="w-full border-dashed"
          >
            <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
            Try Sample: Fashion Demo
          </Button>
        </div>

        <Button
          onClick={handleCombineGenerate}
          disabled={!combineTheme.trim() || !combineSkill.trim() || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Scenes...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate 6 Themed Scenes
            </>
          )}
        </Button>

        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
          <p className="text-xs text-muted-foreground flex items-start gap-2">
            <Lock className="h-3 w-3 text-amber-600 mt-0.5 shrink-0" />
            <span>
              <strong>Universal Rule:</strong> Mobile Interaction (Col G) and Time Gate (Col H) 
              are pulled from V5 and remain read-only in the scene editor.
            </span>
          </p>
        </div>
      </div>
    );
  }

  return null;
}
