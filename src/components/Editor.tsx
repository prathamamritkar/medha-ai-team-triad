import { useState } from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { ArrowLeft, Download, FileText, StickyNote, Wrench, Image, Volume2, Languages, PlusCircle } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import type { Presentation, Slide } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
import slidemasterLogo from 'figma:asset/1b4250e0a61557da82cce83510328ac4252f921e.png';

interface EditorProps {
  presentation: Presentation;
  onBack: () => void;
}

export function Editor({ presentation, onBack }: EditorProps) {
  const [selectedSlideId, setSelectedSlideId] = useState(presentation.slides[0]?.id || '');
  const [mobileView, setMobileView] = useState<'editor' | 'slides' | 'notes' | 'tools'>('editor');
  const [showMediaImages, setShowMediaImages] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);

  const selectedSlide = presentation.slides.find(s => s.id === selectedSlideId) || presentation.slides[0];

  const handleGenerateAudio = () => {
    setShowAudioPlayer(true);
  };

  const handleFetchMedia = () => {
    setShowMediaImages(true);
  };

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen">
        {/* Column 1: Slide Navigation */}
        <div className="w-64 clay-card flex flex-col border-0 rounded-none shadow-none" style={{ boxShadow: '4px 0 12px rgba(197, 205, 216, 0.3)' }}>
          <div className="p-4">
            <Button variant="ghost" onClick={onBack} className="w-full justify-start gap-2 clay-button border-0 shadow-none">
              <ArrowLeft className="w-5 h-5" />
              Dashboard
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {presentation.slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setSelectedSlideId(slide.id)}
                  className={`w-full p-3 text-left rounded-xl transition-all ${
                    selectedSlideId === slide.id
                      ? 'clay-card border-0'
                      : 'hover:shadow-md'
                  }`}
                  style={selectedSlideId === slide.id ? { boxShadow: 'var(--clay-shadow-inset)' } : {}}
                >
                  <div className="text-muted-foreground mb-1">Slide {index + 1}</div>
                  <div className="line-clamp-2">{slide.title}</div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Column 2: Main Preview */}
        <div className="flex-1 flex flex-col">
          <div className="clay-card p-4 flex items-center justify-between border-0 rounded-none shadow-none" style={{ boxShadow: '0 4px 12px rgba(197, 205, 216, 0.3)' }}>
            <h1>{presentation.title}</h1>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="outline" className="gap-2 clay-button border-0 shadow-none">
                <Download className="w-5 h-5" />
                Export
              </Button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            <div className="w-full max-w-4xl aspect-video clay-card p-12" style={{ boxShadow: 'var(--clay-shadow-lg)' }}>
              {selectedSlide.type === 'title' ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-6">
                  <div className="clay-card w-20 h-20 p-3 flex items-center justify-center">
                    <img src={slidemasterLogo} alt="Slidemaster" className="w-full h-full object-contain" />
                  </div>
                  <h2 className="mb-0">{selectedSlide.title}</h2>
                  <div className="text-muted-foreground">Slidemaster Presentation</div>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <h3 className="mb-6">{selectedSlide.title}</h3>
                  <ul className="space-y-3">
                    {selectedSlide.content?.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-3">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
                <AccordionContent className="px-4 pb-4">
                  <Button onClick={handleFetchMedia} className="w-full mb-4 gap-2 clay-button border-0 shadow-none">
                    <Image className="w-4 h-4" />
                    Fetch Media
                  </Button>
                  {showMediaImages && (
                    <div className="grid grid-cols-2 gap-2">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="aspect-square clay-card rounded-xl" style={{ boxShadow: 'var(--clay-shadow-inset)' }} />
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
                  <Button onClick={handleGenerateAudio} className="w-full gap-2 clay-button border-0 shadow-none">
                    <Volume2 className="w-4 h-4" />
                    Generate Audio
                  </Button>
                  {showAudioPlayer && (
                    <>
                      <div className="p-3 clay-card rounded-xl" style={{ boxShadow: 'var(--clay-shadow-inset)' }}>
                        <audio controls className="w-full">
                          <track kind="captions" />
                        </audio>
                      </div>
                      <div className="space-y-2">
                        <label>Generated Captions</label>
                        <Textarea
                          placeholder="Captions will appear here..."
                          className="min-h-[100px] clay-input border-0 shadow-none"
                          defaultValue={selectedSlide.notes}
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
                  <Select defaultValue="hi">
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
                  <Button className="w-full clay-button border-0 shadow-none">Translate</Button>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="interactive">
                <AccordionTrigger className="px-4">
                  <div className="flex items-center gap-2">
                    <PlusCircle className="w-5 h-5" />
                    Interactive
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <Button className="w-full gap-2 clay-button border-0 shadow-none">
                    <PlusCircle className="w-4 h-4" />
                    Add Quiz
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
                    defaultValue={selectedSlide.notes}
                  />
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
          <h2 className="flex-1 mx-4 truncate text-center">{presentation.title}</h2>
          <Button variant="ghost" size="icon" className="min-w-[44px] min-h-[44px] clay-button border-0 shadow-none rounded-full">
            <Download className="w-5 h-5" />
          </Button>
        </header>

        {/* Main Content */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="w-full aspect-video clay-card p-6" style={{ boxShadow: 'var(--clay-shadow-lg)' }}>
            {selectedSlide.type === 'title' ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                <div className="clay-card w-16 h-16 p-2.5 flex items-center justify-center">
                  <img src={slidemasterLogo} alt="Slidemaster" className="w-full h-full object-contain" />
                </div>
                <h3 className="mb-0">{selectedSlide.title}</h3>
                <div className="text-muted-foreground">Slidemaster Presentation</div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <h4 className="mb-4">{selectedSlide.title}</h4>
                <ul className="space-y-2">
                  {selectedSlide.content?.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
              <ScrollArea className="h-full mt-4">
                <div className="space-y-3 pb-8">
                  {presentation.slides.map((slide, index) => (
                    <button
                      key={slide.id}
                      onClick={() => {
                        setSelectedSlideId(slide.id);
                      }}
                      className={`w-full p-4 text-left rounded-xl transition-all ${
                        selectedSlideId === slide.id
                          ? 'clay-card'
                          : 'hover:shadow-md'
                      }`}
                      style={selectedSlideId === slide.id ? { boxShadow: 'var(--clay-shadow-inset)' } : {}}
                    >
                      <div className="text-muted-foreground mb-1">Slide {index + 1}</div>
                      <div>{slide.title}</div>
                    </button>
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
                  defaultValue={selectedSlide.notes}
                />
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
                      <Button onClick={handleFetchMedia} className="w-full gap-2 clay-button border-0 shadow-none">
                        <Image className="w-4 h-4" />
                        Fetch Media
                      </Button>
                      {showMediaImages && (
                        <div className="grid grid-cols-2 gap-2">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="aspect-square clay-card rounded-xl" style={{ boxShadow: 'var(--clay-shadow-inset)' }} />
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
                      <Button onClick={handleGenerateAudio} className="w-full gap-2 clay-button border-0 shadow-none">
                        <Volume2 className="w-4 h-4" />
                        Generate Audio
                      </Button>
                      {showAudioPlayer && (
                        <>
                          <div className="p-3 clay-card rounded-xl" style={{ boxShadow: 'var(--clay-shadow-inset)' }}>
                            <audio controls className="w-full">
                              <track kind="captions" />
                            </audio>
                          </div>
                          <Textarea
                            placeholder="Captions will appear here..."
                            className="min-h-[100px] clay-input border-0 shadow-none"
                            defaultValue={selectedSlide.notes}
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
                      <Select defaultValue="hi">
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
                      <Button className="w-full clay-button border-0 shadow-none">Translate</Button>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="interactive">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <PlusCircle className="w-5 h-5" />
                        Interactive
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Button className="w-full gap-2 clay-button border-0 shadow-none">
                        <PlusCircle className="w-4 h-4" />
                        Add Quiz
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </>
  );
}
