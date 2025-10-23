import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Trophy } from "lucide-react";

interface ModeChooserProps {
  onSelectMode: (mode: 'training' | 'testing') => void;
  templateName: string;
}

export const ModeChooser = ({ onSelectMode, templateName }: ModeChooserProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background/95 to-primary/5">
      <Card className="max-w-2xl w-full p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Choose how you want to play</h1>
          <p className="text-muted-foreground">{templateName}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 pt-4">
          {/* Training Mode */}
          <button
            onClick={() => onSelectMode('training')}
            className="group relative overflow-hidden rounded-lg border-2 border-border hover:border-primary/50 transition-all duration-300 p-6 text-left bg-card hover:bg-accent/50"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Practice</h3>
                  <p className="text-sm text-muted-foreground">Training Mode</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">Randomized practice with hints</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Randomized scenarios</li>
                  <li>• Hints enabled</li>
                  <li>• Unlimited attempts</li>
                  <li>• No XP awarded</li>
                </ul>
              </div>

              <div className="pt-2">
                <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-500">
                  No XP
                </span>
              </div>
            </div>
          </button>

          {/* Testing Mode */}
          <button
            onClick={() => onSelectMode('testing')}
            className="group relative overflow-hidden rounded-lg border-2 border-border hover:border-primary transition-all duration-300 p-6 text-left bg-card hover:bg-primary/5"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Validate</h3>
                  <p className="text-sm text-muted-foreground">Testing Mode</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">Fixed conditions. Proof Receipt generated.</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Fixed scenario seed</li>
                  <li>• Timer enforced</li>
                  <li>• One attempt only</li>
                  <li>• XP + Proof Receipt</li>
                </ul>
              </div>

              <div className="pt-2">
                <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">
                  XP + Proof
                </span>
              </div>
            </div>
          </button>
        </div>

        <p className="text-xs text-center text-muted-foreground pt-2">
          Practice doesn't award XP • Validate generates a Proof Receipt
        </p>
      </Card>
    </div>
  );
};
