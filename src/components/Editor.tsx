import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { ArrowLeft, Download, FileText, StickyNote, Wrench, Image, Volume2, Languages, PlusCircle, Plus, Trash2, ChevronUp, ChevronDown, X, Loader2, Check, FileDown } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { toast } from 'sonner@2.0.3';
import type { Presentation, Slide } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { unsplash_tool } from '../tools';
import slidemasterLogo from 'figma:asset/1b4250e0a61557da82cce83510328ac4252f921e.png';

interface EditorProps {
  presentation: Presentation;
  onBack: () => void;
  onUpdate: (presentation: Presentation) => void;
}

export function Editor({ presentation, onBack, onUpdate }: EditorProps) {
  const [localPresentation, setLocalPresentation] = useState<Presentation>(presentation);
  const [selectedSlideId, setSelectedSlideId] = useState(presentation.slides[0]?.id || '');
  const [mobileView, setMobileView] = useState<'editor' | 'slides' | 'notes' | 'tools'>('editor');
  
  // Media state
  const [mediaImages, setMediaImages] = useState<string[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaSearchQuery, setMediaSearchQuery] = useState('');
  
  // Audio state
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [audioGenerated, setAudioGenerated] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  
  // Translation state
  const [translating, setTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('hi');
  
  // Export dialog
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'pptx'>('pdf');
  const [exporting, setExporting] = useState(false);
  
  // Delete slide confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<string | null>(null);
  
  // New slide dialog
  const [newSlideDialogOpen, setNewSlideDialogOpen] = useState(false);
  const [newSlideType, setNewSlideType] = useState<'title' | 'content'>('content');
  
  // Editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingBulletIndex, setEditingBulletIndex] = useState<number | null>(null);

  const selectedSlide = localPresentation.slides.find(s => s.id === selectedSlideId) || localPresentation.slides[0];
  const selectedSlideIndex = localPresentation.slides.findIndex(s => s.id === selectedSlideId);

  // Sync local changes back to parent
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onUpdate({
        ...localPresentation,
        lastEdited: 'Just now'
      });
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [localPresentation]);

  // Slide Management Functions
  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      type: newSlideType,
      title: newSlideType === 'title' ? 'New Title Slide' : 'New Slide',
      content: newSlideType === 'content' ? ['Bullet point 1', 'Bullet point 2'] : undefined,
      notes: ''
    };
    
    setLocalPresentation(prev => ({
      ...prev,
      slides: [...prev.slides, newSlide]
    }));
    
    setSelectedSlideId(newSlide.id);
    setNewSlideDialogOpen(false);
    toast.success('Slide added successfully');
  };

  const handleDeleteSlide = (slideId: string) => {
    if (localPresentation.slides.length === 1) {
      toast.error('Cannot delete the only slide');
      return;
    }

    const slideIndex = localPresentation.slides.findIndex(s => s.id === slideId);
    const newSlides = localPresentation.slides.filter(s => s.id !== slideId);
    
    setLocalPresentation(prev => ({
      ...prev,
      slides: newSlides
    }));

    // Select adjacent slide
    if (newSlides.length > 0) {
      const newSelectedIndex = Math.min(slideIndex, newSlides.length - 1);
      setSelectedSlideId(newSlides[newSelectedIndex].id);
    }

    setDeleteDialogOpen(false);
    setSlideToDelete(null);
    toast.success('Slide deleted');
  };

  const handleMoveSlide = (direction: 'up' | 'down') => {
    const currentIndex = selectedSlideIndex;
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === localPresentation.slides.length - 1)
    ) {
      return;
    }

    const newSlides = [...localPresentation.slides];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    [newSlides[currentIndex], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[currentIndex]];
    
    setLocalPresentation(prev => ({
      ...prev,
      slides: newSlides
    }));
    
    toast.success(`Slide moved ${direction}`);
  };

  // Content Editing Functions
  const handleUpdateSlideTitle = (title: string) => {
    setLocalPresentation(prev => ({
      ...prev,
      slides: prev.slides.map(s =>
        s.id === selectedSlideId ? { ...s, title } : s
      )
    }));
  };

  const handleUpdateBulletPoint = (index: number, value: string) => {
    setLocalPresentation(prev => ({
      ...prev,
      slides: prev.slides.map(s =>
        s.id === selectedSlideId && s.content
          ? { ...s, content: s.content.map((item, i) => i === index ? value : item) }
          : s
      )
    }));
  };

  const handleAddBulletPoint = () => {
    setLocalPresentation(prev => ({
      ...prev,
      slides: prev.slides.map(s =>
        s.id === selectedSlideId && s.content
          ? { ...s, content: [...s.content, 'New bullet point'] }
          : s
      )
    }));
  };

  const handleDeleteBulletPoint = (index: number) => {
    setLocalPresentation(prev => ({
      ...prev,
      slides: prev.slides.map(s =>
        s.id === selectedSlideId && s.content
          ? { ...s, content: s.content.filter((_, i) => i !== index) }
          : s
      )
    }));
  };

  const handleUpdateNotes = (notes: string) => {
    setLocalPresentation(prev => ({
      ...prev,
      slides: prev.slides.map(s =>
        s.id === selectedSlideId ? { ...s, notes } : s
      )
    }));
  };

  // Media Functions
  const handleFetchMedia = async () => {
    setLoadingMedia(true);
    try {
      // Fetch 6 images based on search query or slide title
      const query = mediaSearchQuery || selectedSlide.title || 'education';
      const imageUrls: string[] = [];
      
      for (let i = 0; i < 6; i++) {
        const url = await unsplash_tool({ query: `${query} ${i}` });
        imageUrls.push(url);
      }
      
      setMediaImages(imageUrls);
      toast.success('Media loaded successfully');
    } catch (error) {
      toast.error('Failed to load media');
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleInsertImage = (imageUrl: string) => {
    // In a real implementation, this would add the image to the slide
    toast.success('Image inserted into slide');
  };

  // Audio Functions
  const handleGenerateAudio = () => {
    setGeneratingAudio(true);
    
    // Simulate audio generation
    setTimeout(() => {
      setAudioUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
      setAudioGenerated(true);
      setGeneratingAudio(false);
      toast.success('Audio generated successfully');
    }, 2000);
  };

  // Translation Functions
  const handleTranslate = () => {
    setTranslating(true);
    
    // Simulate translation
    setTimeout(() => {
      const languageNames: Record<string, string> = {
        hi: 'Hindi',
        mr: 'Marathi',
        ta: 'Tamil',
        te: 'Telugu',
        bn: 'Bengali'
      };
      
      // Mock translation - just add language indicator
      setLocalPresentation(prev => ({
        ...prev,
        slides: prev.slides.map(s =>
          s.id === selectedSlideId
            ? {
                ...s,
                title: `${s.title} (${languageNames[targetLanguage]})`,
                content: s.content?.map(item => `${item} (${languageNames[targetLanguage]})`)
              }
            : s
        )
      }));
      
      setTranslating(false);
      toast.success(`Translated to ${languageNames[targetLanguage]}`);
    }, 1500);
  };

  // Export Functions
  const handleExport = () => {
    setExporting(true);
    
    setTimeout(() => {
      const fileName = `${localPresentation.title}.${exportFormat}`;
      toast.success(`Exported as ${fileName}`);
      setExporting(false);
      setExportDialogOpen(false);
    }, 2000);
  };

  // Render slide preview
  const renderSlidePreview = (slide: Slide, isEditable: boolean = false) => {
    if (slide.type === 'title') {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center gap-6">
          <div className="clay-card w-20 h-20 p-3 flex items-center justify-center">
            <img src={slidemasterLogo} alt="Slidemaster" className="w-full h-full object-contain" />
          </div>
          {isEditable && editingTitle ? (
            <Input
              value={slide.title}
              onChange={(e) => handleUpdateSlideTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              className="text-center max-w-lg clay-input border-0 shadow-none text-2xl"
              autoFocus
            />
          ) : (
            <h2 
              className="mb-0 cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => isEditable && setEditingTitle(true)}
            >
              {slide.title}
            </h2>
          )}
          <div className="text-muted-foreground">Slidemaster Presentation</div>
        </div>
      );
    } else {
      return (
        <div className="h-full flex flex-col">
          {isEditable && editingTitle ? (
            <Input
              value={slide.title}
              onChange={(e) => handleUpdateSlideTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              className="mb-6 clay-input border-0 shadow-none text-xl"
              autoFocus
            />
          ) : (
            <h3 
              className="mb-6 cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => isEditable && setEditingTitle(true)}
            >
              {slide.title}
            </h3>
          )}
          <ul className="space-y-3 flex-1">
            {slide.content?.map((item, index) => (
              <li key={index} className="flex items-start group">
                <span className="mr-3">•</span>
                {isEditable && editingBulletIndex === index ? (
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => handleUpdateBulletPoint(index, e.target.value)}
                      onBlur={() => setEditingBulletIndex(null)}
                      className="flex-1 clay-input border-0 shadow-none"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBulletPoint(index)}
                      className="clay-button border-0 shadow-none"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="flex-1 cursor-pointer hover:opacity-70 transition-opacity group-hover:pr-10"
                    onClick={() => isEditable && setEditingBulletIndex(index)}
                  >
                    {item}
                  </div>
                )}
              </li>
            ))}
          </ul>
          {isEditable && slide.content && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddBulletPoint}
              className="mt-4 gap-2 clay-button border-0 shadow-none self-start"
            >
              <Plus className="w-4 h-4" />
              Add Bullet Point
            </Button>
          )}
        </div>
      );
    }
  };

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen">
        {/* Column 1: Slide Navigation */}
        <div className="w-64 clay-card flex flex-col border-0 rounded-none shadow-none" style={{ boxShadow: '4px 0 12px rgba(197, 205, 216, 0.3)' }}>
          <div className="p-4 space-y-3">
            <Button variant="ghost" onClick={onBack} className="w-full justify-start gap-2 clay-button border-0 shadow-none">
              <ArrowLeft className="w-5 h-5" />
              Dashboard
            </Button>
            <Button 
              onClick={() => setNewSlideDialogOpen(true)} 
              className="w-full gap-2 clay-primary border-0 shadow-none"
            >
              <Plus className="w-5 h-5" />
              Add Slide
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {localPresentation.slides.map((slide, index) => (
                <div key={slide.id} className="relative group">
                  <div
                    onClick={() => setSelectedSlideId(slide.id)}
                    className={`w-full p-3 text-left rounded-xl transition-all cursor-pointer ${
                      selectedSlideId === slide.id
                        ? 'clay-card border-0'
                        : 'hover:shadow-md'
                    }`}
                    style={selectedSlideId === slide.id ? { boxShadow: 'var(--clay-shadow-inset)' } : {}}
                  >
                    <div className="text-muted-foreground mb-1 flex items-center justify-between">
                      <span>Slide {index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSlideToDelete(slide.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 clay-button border-0 shadow-none"
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                    <div className="line-clamp-2">{slide.title}</div>
                  </div>
                  
                  {selectedSlideId === slide.id && (
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveSlide('up')}
                        disabled={index === 0}
                        className="h-6 w-6 p-0 clay-button border-0 shadow-none rounded-full"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveSlide('down')}
                        disabled={index === localPresentation.slides.length - 1}
                        className="h-6 w-6 p-0 clay-button border-0 shadow-none rounded-full"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Column 2: Main Preview */}
        <div className="flex-1 flex flex-col">
          <div className="clay-card p-4 flex items-center justify-between border-0 rounded-none shadow-none" style={{ boxShadow: '0 4px 12px rgba(197, 205, 216, 0.3)' }}>
            <h1>{localPresentation.title}</h1>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button 
                variant="outline" 
                className="gap-2 clay-button border-0 shadow-none"
                onClick={() => setExportDialogOpen(true)}
              >
                <Download className="w-5 h-5" />
                Export
              </Button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            <div className="w-full max-w-4xl aspect-video clay-card p-12" style={{ boxShadow: 'var(--clay-shadow-lg)' }}>
              {renderSlidePreview(selectedSlide, true)}
            </div>
          </div>
        </div>

        {/* Column 3: Tools & Notes */}
        <div className="w-80 clay-card flex flex-col border-0 rounded-none shadow-none" style={{ boxShadow: '-4px 0 12px rgba(197, 205, 216, 0.3)' }}>
          <div className="flex-1 overflow-auto">
            <Accordion type="single" collapsible defaultValue="notes">
              <AccordionItem value="media">
                <AccordionTrigger className="px-4">
                  <div className="flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    Media
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  <Input
                    placeholder="Search images..."
                    value={mediaSearchQuery}
                    onChange={(e) => setMediaSearchQuery(e.target.value)}
                    className="clay-input border-0 shadow-none"
                  />
                  <Button 
                    onClick={handleFetchMedia} 
                    className="w-full gap-2 clay-button border-0 shadow-none"
                    disabled={loadingMedia}
                  >
                    {loadingMedia ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Image className="w-4 h-4" />
                        Fetch Media
                      </>
                    )}
                  </Button>
                  {mediaImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {mediaImages.map((url, i) => (
                        <button
                          key={i}
                          onClick={() => handleInsertImage(url)}
                          className="aspect-square clay-card rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                          style={{ boxShadow: 'var(--clay-shadow-inset)' }}
                        >
                          <ImageWithFallback
                            src={url}
                            alt={`Media ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="audio">
                <AccordionTrigger className="px-4">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5" />
                    Audio (TTS)
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  <Button 
                    onClick={handleGenerateAudio} 
                    className="w-full gap-2 clay-button border-0 shadow-none"
                    disabled={generatingAudio}
                  >
                    {generatingAudio ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        Generate Audio
                      </>
                    )}
                  </Button>
                  {audioGenerated && (
                    <>
                      <div className="p-3 clay-card rounded-xl" style={{ boxShadow: 'var(--clay-shadow-inset)' }}>
                        <audio controls className="w-full" src={audioUrl}>
                          <track kind="captions" />
                        </audio>
                      </div>
                      <div className="space-y-2">
                        <Label>Audio Transcript</Label>
                        <Textarea
                          placeholder="Transcript of generated audio..."
                          className="min-h-[100px] clay-input border-0 shadow-none"
                          defaultValue={selectedSlide.notes || selectedSlide.title}
                          readOnly
                        />
                      </div>
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="translate">
                <AccordionTrigger className="px-4">
                  <div className="flex items-center gap-2">
                    <Languages className="w-5 h-5" />
                    Translate
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Target Language</Label>
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger className="clay-input border-0 shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="clay-card border-0">
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="mr">Marathi</SelectItem>
                        <SelectItem value="ta">Tamil</SelectItem>
                        <SelectItem value="te">Telugu</SelectItem>
                        <SelectItem value="bn">Bengali</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleTranslate} 
                    className="w-full clay-button border-0 shadow-none"
                    disabled={translating}
                  >
                    {translating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Translating...
                      </>
                    ) : (
                      'Translate Slide'
                    )}
                  </Button>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="interactive">
                <AccordionTrigger className="px-4">
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-5 h-5" />
                    Interactive
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-3">
                  <Button 
                    className="w-full gap-2 clay-button border-0 shadow-none"
                    onClick={() => toast.success('Quiz feature coming soon!')}
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Quiz
                  </Button>
                  <Button 
                    className="w-full gap-2 clay-button border-0 shadow-none"
                    onClick={() => toast.success('Poll feature coming soon!')}
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Poll
                  </Button>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="notes">
                <AccordionTrigger className="px-4">
                  <div className="flex items-center gap-2">
                    <StickyNote className="w-5 h-5" />
                    Speaker Notes
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <Textarea
                    placeholder="Add speaker notes for this slide..."
                    className="min-h-[200px] clay-input border-0 shadow-none"
                    value={selectedSlide.notes || ''}
                    onChange={(e) => handleUpdateNotes(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {selectedSlide.notes?.length || 0} characters
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen flex flex-col">
        {/* Header */}
        <header className="clay-card p-4 flex items-center justify-between border-0 rounded-none shadow-none" style={{ boxShadow: '0 4px 12px rgba(197, 205, 216, 0.3)' }}>
          <Button variant="ghost" size="icon" onClick={onBack} className="min-w-[44px] min-h-[44px] clay-button border-0 shadow-none rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="flex-1 mx-4 truncate text-center">{localPresentation.title}</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            className="min-w-[44px] min-h-[44px] clay-button border-0 shadow-none rounded-full"
            onClick={() => setExportDialogOpen(true)}
          >
            <Download className="w-5 h-5" />
          </Button>
        </header>

        {/* Main Content */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="w-full aspect-video clay-card p-6" style={{ boxShadow: 'var(--clay-shadow-lg)' }}>
            {renderSlidePreview(selectedSlide, true)}
          </div>
        </div>

        {/* Bottom Navigation */}
        <nav className="clay-card px-2 py-2 flex items-center justify-around border-0 rounded-none shadow-none" style={{ boxShadow: '0 -4px 12px rgba(197, 205, 216, 0.3)' }}>
          <Button
            variant="ghost"
            className="flex-col h-auto py-2 px-3 min-w-[60px] min-h-[60px] clay-button border-0 shadow-none rounded-2xl"
            onClick={() => setMobileView('editor')}
          >
            <FileText className="w-6 h-6 mb-1" />
            <span className="text-xs">Editor</span>
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="flex-col h-auto py-2 px-3 min-w-[60px] min-h-[60px] clay-button border-0 shadow-none rounded-2xl"
              >
                <FileText className="w-6 h-6 mb-1" />
                <span className="text-xs">Slides</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] clay-card border-0 rounded-t-3xl">
              <SheetHeader>
                <SheetTitle>All Slides</SheetTitle>
              </SheetHeader>
              <div className="mt-4 mb-4">
                <Button 
                  onClick={() => {
                    setNewSlideDialogOpen(true);
                  }} 
                  className="w-full gap-2 clay-primary border-0 shadow-none"
                >
                  <Plus className="w-5 h-5" />
                  Add New Slide
                </Button>
              </div>
              <ScrollArea className="h-full">
                <div className="space-y-3 pb-8">
                  {localPresentation.slides.map((slide, index) => (
                    <div key={slide.id} className="relative">
                      <div
                        onClick={() => setSelectedSlideId(slide.id)}
                        className={`w-full p-4 text-left rounded-xl transition-all cursor-pointer ${
                          selectedSlideId === slide.id
                            ? 'clay-card'
                            : 'hover:shadow-md'
                        }`}
                        style={selectedSlideId === slide.id ? { boxShadow: 'var(--clay-shadow-inset)' } : {}}
                      >
                        <div className="text-muted-foreground mb-1">Slide {index + 1}</div>
                        <div>{slide.title}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSlideToDelete(slide.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="absolute top-4 right-4 h-8 w-8 p-0 clay-button border-0 shadow-none"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="flex-col h-auto py-2 px-3 min-w-[60px] min-h-[60px] clay-button border-0 shadow-none rounded-2xl"
              >
                <StickyNote className="w-6 h-6 mb-1" />
                <span className="text-xs">Notes</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh] clay-card border-0 rounded-t-3xl">
              <SheetHeader>
                <SheetTitle>Speaker Notes</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <Textarea
                  placeholder="Add speaker notes for this slide..."
                  className="min-h-[300px] clay-input border-0 shadow-none"
                  value={selectedSlide.notes || ''}
                  onChange={(e) => handleUpdateNotes(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedSlide.notes?.length || 0} characters
                </p>
              </div>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="flex-col h-auto py-2 px-3 min-w-[60px] min-h-[60px] clay-button border-0 shadow-none rounded-2xl"
              >
                <Wrench className="w-6 h-6 mb-1" />
                <span className="text-xs">Tools</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] clay-card border-0 rounded-t-3xl">
              <SheetHeader>
                <SheetTitle>Tools</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-full mt-4">
                <Accordion type="single" collapsible className="pb-8">
                  <AccordionItem value="media">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Image className="w-5 h-5" />
                        Media
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <Input
                        placeholder="Search images..."
                        value={mediaSearchQuery}
                        onChange={(e) => setMediaSearchQuery(e.target.value)}
                        className="clay-input border-0 shadow-none"
                      />
                      <Button 
                        onClick={handleFetchMedia} 
                        className="w-full gap-2 clay-button border-0 shadow-none"
                        disabled={loadingMedia}
                      >
                        {loadingMedia ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Image className="w-4 h-4" />
                            Fetch Media
                          </>
                        )}
                      </Button>
                      {mediaImages.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {mediaImages.map((url, i) => (
                            <button
                              key={i}
                              onClick={() => handleInsertImage(url)}
                              className="aspect-square clay-card rounded-xl overflow-hidden"
                              style={{ boxShadow: 'var(--clay-shadow-inset)' }}
                            >
                              <ImageWithFallback
                                src={url}
                                alt={`Media ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="audio">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-5 h-5" />
                        Audio (TTS)
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <Button 
                        onClick={handleGenerateAudio} 
                        className="w-full gap-2 clay-button border-0 shadow-none"
                        disabled={generatingAudio}
                      >
                        {generatingAudio ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4" />
                            Generate Audio
                          </>
                        )}
                      </Button>
                      {audioGenerated && (
                        <>
                          <div className="p-3 clay-card rounded-xl" style={{ boxShadow: 'var(--clay-shadow-inset)' }}>
                            <audio controls className="w-full" src={audioUrl}>
                              <track kind="captions" />
                            </audio>
                          </div>
                          <Textarea
                            placeholder="Transcript..."
                            className="min-h-[100px] clay-input border-0 shadow-none"
                            defaultValue={selectedSlide.notes || selectedSlide.title}
                            readOnly
                          />
                        </>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="translate">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Languages className="w-5 h-5" />
                        Translate
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                        <SelectTrigger className="clay-input border-0 shadow-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="clay-card border-0">
                          <SelectItem value="hi">Hindi</SelectItem>
                          <SelectItem value="mr">Marathi</SelectItem>
                          <SelectItem value="ta">Tamil</SelectItem>
                          <SelectItem value="te">Telugu</SelectItem>
                          <SelectItem value="bn">Bengali</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={handleTranslate} 
                        className="w-full clay-button border-0 shadow-none"
                        disabled={translating}
                      >
                        {translating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Translating...
                          </>
                        ) : (
                          'Translate Slide'
                        )}
                      </Button>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="interactive">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <PlusCircle className="w-5 h-5" />
                        Interactive
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <Button 
                        className="w-full gap-2 clay-button border-0 shadow-none"
                        onClick={() => toast.success('Quiz feature coming soon!')}
                      >
                        <PlusCircle className="w-4 h-4" />
                        Add Quiz
                      </Button>
                      <Button 
                        className="w-full gap-2 clay-button border-0 shadow-none"
                        onClick={() => toast.success('Poll feature coming soon!')}
                      >
                        <PlusCircle className="w-4 h-4" />
                        Add Poll
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </nav>
      </div>

      {/* New Slide Dialog */}
      <Dialog open={newSlideDialogOpen} onOpenChange={setNewSlideDialogOpen}>
        <DialogContent className="clay-card border-0">
          <DialogHeader>
            <DialogTitle>Add New Slide</DialogTitle>
            <DialogDescription>
              Choose the type of slide you want to add
            </DialogDescription>
          </DialogHeader>
          <RadioGroup value={newSlideType} onValueChange={(value) => setNewSlideType(value as 'title' | 'content')}>
            <div className="flex items-center space-x-2 p-3 clay-card rounded-xl cursor-pointer" onClick={() => setNewSlideType('title')}>
              <RadioGroupItem value="title" id="title" />
              <Label htmlFor="title" className="flex-1 cursor-pointer">
                <div className="">Title Slide</div>
                <div className="text-xs text-muted-foreground">A centered title slide with logo</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 clay-card rounded-xl cursor-pointer" onClick={() => setNewSlideType('content')}>
              <RadioGroupItem value="content" id="content" />
              <Label htmlFor="content" className="flex-1 cursor-pointer">
                <div className="">Content Slide</div>
                <div className="text-xs text-muted-foreground">A slide with title and bullet points</div>
              </Label>
            </div>
          </RadioGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewSlideDialogOpen(false)} className="clay-button border-0 shadow-none">
              Cancel
            </Button>
            <Button onClick={handleAddSlide} className="clay-primary border-0 shadow-none">
              <Plus className="w-4 h-4 mr-2" />
              Add Slide
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Slide Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="clay-card border-0">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Slide?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this slide? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="clay-button border-0 shadow-none">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => slideToDelete && handleDeleteSlide(slideToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="clay-card border-0">
          <DialogHeader>
            <DialogTitle>Export Presentation</DialogTitle>
            <DialogDescription>
              Choose the format for exporting your presentation
            </DialogDescription>
          </DialogHeader>
          <RadioGroup value={exportFormat} onValueChange={(value) => setExportFormat(value as 'pdf' | 'pptx')}>
            <div className="flex items-center space-x-2 p-3 clay-card rounded-xl cursor-pointer" onClick={() => setExportFormat('pdf')}>
              <RadioGroupItem value="pdf" id="pdf" />
              <Label htmlFor="pdf" className="flex-1 cursor-pointer">
                <div className="">PDF Document</div>
                <div className="text-xs text-muted-foreground">Export as a PDF file</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 clay-card rounded-xl cursor-pointer" onClick={() => setExportFormat('pptx')}>
              <RadioGroupItem value="pptx" id="pptx" />
              <Label htmlFor="pptx" className="flex-1 cursor-pointer">
                <div className="">PowerPoint</div>
                <div className="text-xs text-muted-foreground">Export as a .pptx file</div>
              </Label>
            </div>
          </RadioGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)} className="clay-button border-0 shadow-none">
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={exporting} className="clay-primary border-0 shadow-none">
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
