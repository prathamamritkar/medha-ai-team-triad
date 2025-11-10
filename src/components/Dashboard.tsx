import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { FilePlus, Edit } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import type { Presentation } from '../App';
import slidemasterLogo from 'figma:asset/1b4250e0a61557da82cce83510328ac4252f921e.png';

interface DashboardProps {
  presentations: Presentation[];
  onNewPresentation: () => void;
  onEditPresentation: (presentation: Presentation) => void;
}

export function Dashboard({ presentations, onNewPresentation, onEditPresentation }: DashboardProps) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="clay-card sticky top-0 z-10 border-0 rounded-none shadow-none" style={{ boxShadow: '0 4px 12px rgba(197, 205, 216, 0.3)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 clay-card p-1.5 flex items-center justify-center">
              <img src={slidemasterLogo} alt="Slidemaster" className="w-full h-full object-contain" />
            </div>
            <h1>Slidemaster</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button onClick={onNewPresentation} className="min-h-[44px] gap-2 clay-primary border-0 shadow-none">
              <FilePlus className="w-5 h-5" />
              <span className="hidden sm:inline">New Presentation</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="mb-6">Your Presentations</h2>
        
        {/* Presentations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {presentations.map((presentation) => (
            <Card key={presentation.id} className="clay-card border-0 shadow-none hover:shadow-none transition-all hover:-translate-y-1" style={{ boxShadow: 'var(--clay-shadow)' }}>
              <CardHeader>
                <CardTitle>{presentation.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Last edited: {presentation.lastEdited}
                </p>
                <p className="text-muted-foreground mt-2">
                  {presentation.slides.length} slide{presentation.slides.length !== 1 ? 's' : ''}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => onEditPresentation(presentation)}
                  variant="outline"
                  className="w-full min-h-[44px] gap-2 clay-button border-0 shadow-none"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {presentations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No presentations yet</p>
            <Button onClick={onNewPresentation} className="min-h-[44px] gap-2 clay-primary border-0 shadow-none">
              <FilePlus className="w-5 h-5" />
              Create Your First Presentation
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
