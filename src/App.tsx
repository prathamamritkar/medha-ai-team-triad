import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { Generator } from './components/Generator';
import { Editor } from './components/Editor';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from './components/ui/sonner';

export type Screen = 'login' | 'dashboard' | 'generator' | 'editor';

export interface Presentation {
  id: string;
  title: string;
  lastEdited: string;
  slides: Slide[];
}

export interface Slide {
  id: string;
  type: 'title' | 'content';
  title: string;
  content?: string[];
  notes?: string;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [currentPresentation, setCurrentPresentation] = useState<Presentation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock presentations data
  const [presentations, setPresentations] = useState<Presentation[]>([
    {
      id: '1',
      title: 'The Water Cycle',
      lastEdited: 'November 8, 2025',
      slides: [
        { id: '1', type: 'title', title: 'The Water Cycle', notes: 'Welcome students to today\'s lesson about the water cycle.' },
        { id: '2', type: 'content', title: 'What is the Water Cycle?', content: ['Continuous movement of water', 'On, above, and below Earth\'s surface', 'Water changes between states'], notes: 'Explain that water is constantly moving in nature.' },
        { id: '3', type: 'content', title: 'Key Stages', content: ['Evaporation', 'Condensation', 'Precipitation', 'Collection'], notes: 'Discuss each stage in detail with examples.' },
      ]
    },
    {
      id: '2',
      title: 'Solar System Basics',
      lastEdited: 'November 6, 2025',
      slides: [
        { id: '1', type: 'title', title: 'Solar System Basics', notes: 'Introduction to our solar system.' },
        { id: '2', type: 'content', title: 'The Sun', content: ['Center of our solar system', 'A giant star', 'Provides heat and light'], notes: 'The Sun is the most important object in our solar system.' },
      ]
    },
    {
      id: '3',
      title: 'Parts of Speech',
      lastEdited: 'November 5, 2025',
      slides: [
        { id: '1', type: 'title', title: 'Parts of Speech', notes: 'Learn about the building blocks of sentences.' },
        { id: '2', type: 'content', title: 'Nouns', content: ['Person, place, or thing', 'Common and proper nouns', 'Examples: cat, London, happiness'], notes: 'Start with nouns as they are fundamental.' },
      ]
    },
  ]);

  const handleLogin = () => {
    setCurrentScreen('dashboard');
  };

  const handleNewPresentation = () => {
    setCurrentScreen('generator');
  };

  const handleEditPresentation = (presentation: Presentation) => {
    setCurrentPresentation(presentation);
    setCurrentScreen('editor');
  };

  const handleGenerate = (prompt: string) => {
    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => {
      const newPresentation: Presentation = {
        id: Date.now().toString(),
        title: prompt.slice(0, 30) + '...',
        lastEdited: 'Just now',
        slides: [
          { id: '1', type: 'title', title: prompt.slice(0, 50), notes: 'Introduction slide for your presentation.' },
          { id: '2', type: 'content', title: 'Overview', content: ['Key point 1', 'Key point 2', 'Key point 3'], notes: 'Discuss the main topics.' },
          { id: '3', type: 'content', title: 'Details', content: ['Important detail', 'Supporting information', 'Examples'], notes: 'Go deeper into the subject.' },
        ]
      };
      setPresentations(prev => [newPresentation, ...prev]);
      setCurrentPresentation(newPresentation);
      setIsGenerating(false);
      setCurrentScreen('editor');
    }, 2000);
  };

  const handleDeletePresentation = (id: string) => {
    setPresentations(prev => prev.filter(p => p.id !== id));
  };

  const handleDuplicatePresentation = (presentation: Presentation) => {
    const duplicate: Presentation = {
      ...presentation,
      id: Date.now().toString(),
      title: `${presentation.title} (Copy)`,
      lastEdited: 'Just now',
    };
    setPresentations(prev => [duplicate, ...prev]);
  };

  const handleUpdatePresentation = (updatedPresentation: Presentation) => {
    setPresentations(prev => 
      prev.map(p => p.id === updatedPresentation.id ? updatedPresentation : p)
    );
    setCurrentPresentation(updatedPresentation);
  };

  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard');
    setCurrentPresentation(null);
  };

  const handleBackToGenerator = () => {
    setCurrentScreen('generator');
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background transition-colors duration-300">
        {currentScreen === 'login' && <LoginScreen onLogin={handleLogin} />}
        {currentScreen === 'dashboard' && (
          <Dashboard
            presentations={presentations}
            onNewPresentation={handleNewPresentation}
            onEditPresentation={handleEditPresentation}
            onDeletePresentation={handleDeletePresentation}
            onDuplicatePresentation={handleDuplicatePresentation}
          />
        )}
        {currentScreen === 'generator' && (
          <Generator
            onGenerate={handleGenerate}
            onBack={handleBackToDashboard}
            isGenerating={isGenerating}
          />
        )}
        {currentScreen === 'editor' && currentPresentation && (
          <Editor
            presentation={currentPresentation}
            onBack={handleBackToDashboard}
            onUpdate={handleUpdatePresentation}
          />
        )}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
