import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface GeneratorProps {
  onGenerate: (prompt: string) => void;
  onBack: () => void;
  isGenerating: boolean;
}

export function Generator({ onGenerate, onBack, isGenerating }: GeneratorProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="clay-card sticky top-0 z-10 border-0 rounded-none shadow-none" style={{ boxShadow: '0 4px 12px rgba(197, 205, 216, 0.3)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="min-h-[44px] gap-2 clay-button border-0 shadow-none"
            disabled={isGenerating}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="clay-card w-24 h-24 flex items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
            <h2>Generating your slides...</h2>
            <p className="text-muted-foreground">This will take just a moment</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="prompt">
                Describe your presentation
              </Label>
              <Textarea
                id="prompt"
                placeholder="e.g., 'A 10-slide intro to the water cycle for 5th graders' or 'An interactive lesson on photosynthesis with diagrams'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
                className="min-h-[300px] resize-none clay-input border-0 shadow-none"
              />
              <p className="text-muted-foreground">
                Be as specific as possible. Include grade level, number of slides, and key topics.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full min-h-[44px] clay-primary border-0 shadow-none"
              disabled={!prompt.trim()}
            >
              Generate
            </Button>
          </form>
        )}
      </main>
    </div>
  );
}
