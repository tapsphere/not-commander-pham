import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SceneData, ChoiceData, SubCompetency, TIME_LIMITS } from './template-steps/types';
import { Plus, Trash2, CheckCircle, XCircle, Clock, GripVertical } from 'lucide-react';

interface SceneCardProps {
  scene: SceneData;
  sceneIndex: number;
  subCompetency: SubCompetency | undefined;
  onUpdate: (scene: SceneData) => void;
  isActive?: boolean;
  onSelect?: () => void;
}

export function SceneCard({ scene, sceneIndex, subCompetency, onUpdate, isActive, onSelect }: SceneCardProps) {
  const updateQuestion = (question: string) => {
    onUpdate({ ...scene, question });
  };

  const updateTimeLimit = (timeLimit: 30 | 45 | 60) => {
    onUpdate({ ...scene, timeLimit });
  };

  const updateChoice = (choiceId: string, updates: Partial<ChoiceData>) => {
    const newChoices = scene.choices.map(c => 
      c.id === choiceId ? { ...c, ...updates } : c
    );
    onUpdate({ ...scene, choices: newChoices });
  };

  const addChoice = () => {
    if (scene.choices.length >= 10) return;
    const newChoice: ChoiceData = {
      id: `choice-${Date.now()}`,
      text: '',
      isCorrect: false,
    };
    onUpdate({ ...scene, choices: [...scene.choices, newChoice] });
  };

  const removeChoice = (choiceId: string) => {
    if (scene.choices.length <= 2) return;
    onUpdate({ ...scene, choices: scene.choices.filter(c => c.id !== choiceId) });
  };

  const toggleCorrect = (choiceId: string) => {
    const newChoices = scene.choices.map(c => ({
      ...c,
      isCorrect: c.id === choiceId ? !c.isCorrect : c.isCorrect
    }));
    onUpdate({ ...scene, choices: newChoices });
  };

  return (
    <Card 
      className={`p-4 bg-card border-border cursor-pointer transition-all ${
        isActive 
          ? 'ring-2 ring-primary border-primary shadow-lg' 
          : 'hover:border-primary/50'
      }`}
      onClick={onSelect}
    >
      {/* Scene Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
            {sceneIndex + 1}
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Scene {sceneIndex + 1}</h4>
            {subCompetency && (
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                {subCompetency.action_cue}
              </p>
            )}
          </div>
        </div>
        
        {/* Time Limit */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Select 
            value={scene.timeLimit.toString()} 
            onValueChange={(v) => updateTimeLimit(parseInt(v) as 30 | 45 | 60)}
          >
            <SelectTrigger className="w-20 h-8 bg-muted border-border text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_LIMITS.map(t => (
                <SelectItem key={t} value={t.toString()}>{t}s</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Locked Badge */}
      {subCompetency?.game_mechanic && (
        <Badge variant="secondary" className="mb-3 text-xs">
          🔒 {subCompetency.game_mechanic}
        </Badge>
      )}

      {/* Question */}
      <div className="mb-4">
        <Textarea
          value={scene.question}
          onChange={(e) => updateQuestion(e.target.value)}
          placeholder="Enter the question for this scene..."
          className="bg-muted border-border min-h-[80px]"
        />
      </div>

      {/* Choices */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Choices ({scene.choices.length}/10)
          </span>
          {scene.choices.length < 10 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addChoice}
              className="h-7 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Choice
            </Button>
          )}
        </div>
        
        {scene.choices.map((choice, idx) => (
          <div 
            key={choice.id} 
            className={`flex items-center gap-2 p-2 rounded-md border ${
              choice.isCorrect 
                ? 'border-green-500/50 bg-green-500/10' 
                : 'border-border bg-muted/50'
            }`}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => toggleCorrect(choice.id)}
              className={`p-1 h-7 w-7 ${choice.isCorrect ? 'text-green-500' : 'text-muted-foreground'}`}
            >
              {choice.isCorrect ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
            </Button>
            
            <Input
              value={choice.text}
              onChange={(e) => updateChoice(choice.id, { text: e.target.value })}
              placeholder={`Choice ${idx + 1}`}
              className="flex-1 bg-background border-none h-8"
            />
            
            {scene.choices.length > 2 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeChoice(choice.id)}
                className="p-1 h-7 w-7 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        
        <p className="text-xs text-muted-foreground mt-1">
          ✅ Green = Correct | ⚪ Gray = Incorrect
        </p>
      </div>
    </Card>
  );
}
