import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { FilePlus, Edit, Search, MoreVertical, Trash2, Copy, LayoutGrid, LayoutList, FileText, Presentation as PresentationIcon } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { toast } from 'sonner@2.0.3';
import type { Presentation } from '../App';
import slidemasterLogo from 'figma:asset/1b4250e0a61557da82cce83510328ac4252f921e.png';

interface DashboardProps {
  presentations: Presentation[];
  onNewPresentation: () => void;
  onEditPresentation: (presentation: Presentation) => void;
  onDeletePresentation: (id: string) => void;
  onDuplicatePresentation: (presentation: Presentation) => void;
}

type SortOption = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'slides-desc' | 'slides-asc';
type ViewMode = 'grid' | 'list';

export function Dashboard({ 
  presentations, 
  onNewPresentation, 
  onEditPresentation,
  onDeletePresentation,
  onDuplicatePresentation
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [presentationToDelete, setPresentationToDelete] = useState<Presentation | null>(null);

  // Filter and sort presentations
  const filteredAndSortedPresentations = useMemo(() => {
    let filtered = presentations.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort presentations
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime();
        case 'date-asc':
          return new Date(a.lastEdited).getTime() - new Date(b.lastEdited).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'slides-desc':
          return b.slides.length - a.slides.length;
        case 'slides-asc':
          return a.slides.length - b.slides.length;
        default:
          return 0;
      }
    });

    return sorted;
  }, [presentations, searchQuery, sortBy]);

  // Calculate statistics
  const totalPresentations = presentations.length;
  const totalSlides = presentations.reduce((sum, p) => sum + p.slides.length, 0);
  const averageSlides = totalPresentations > 0 ? Math.round(totalSlides / totalPresentations) : 0;

  const handleDeleteClick = (presentation: Presentation) => {
    setPresentationToDelete(presentation);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (presentationToDelete) {
      onDeletePresentation(presentationToDelete.id);
      toast.success(`"${presentationToDelete.title}" deleted successfully`);
      setDeleteDialogOpen(false);
      setPresentationToDelete(null);
    }
  };

  const handleDuplicate = (presentation: Presentation) => {
    onDuplicatePresentation(presentation);
    toast.success(`"${presentation.title}" duplicated successfully`);
  };

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
        {/* Statistics Cards */}
        {presentations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="clay-card border-0 shadow-none" style={{ boxShadow: 'var(--clay-shadow)' }}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="clay-card w-12 h-12 flex items-center justify-center">
                  <PresentationIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground">Total Presentations</p>
                  <h3 className="mt-1">{totalPresentations}</h3>
                </div>
              </CardContent>
            </Card>
            
            <Card className="clay-card border-0 shadow-none" style={{ boxShadow: 'var(--clay-shadow)' }}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="clay-card w-12 h-12 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground">Total Slides</p>
                  <h3 className="mt-1">{totalSlides}</h3>
                </div>
              </CardContent>
            </Card>
            
            <Card className="clay-card border-0 shadow-none" style={{ boxShadow: 'var(--clay-shadow)' }}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="clay-card w-12 h-12 flex items-center justify-center">
                  <LayoutGrid className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground">Average Slides</p>
                  <h3 className="mt-1">{averageSlides}</h3>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Toolbar */}
        {presentations.length > 0 && (
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search presentations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 min-h-[44px] clay-input border-0 shadow-none"
              />
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="min-h-[44px] w-full sm:w-[180px] clay-button border-0 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Latest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                  <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                  <SelectItem value="slides-desc">Most Slides</SelectItem>
                  <SelectItem value="slides-asc">Least Slides</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex clay-card border-0 rounded-xl p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`min-h-[40px] px-3 ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : ''}`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`min-h-[40px] px-3 ${viewMode === 'list' ? 'bg-primary/10 text-primary' : ''}`}
                  aria-label="List view"
                >
                  <LayoutList className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Results Header */}
        {presentations.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <h2>
              {searchQuery ? `Search Results (${filteredAndSortedPresentations.length})` : 'Your Presentations'}
            </h2>
          </div>
        )}
        
        {/* Presentations Grid/List */}
        {filteredAndSortedPresentations.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {filteredAndSortedPresentations.map((presentation) => (
              <Card 
                key={presentation.id} 
                className={`clay-card border-0 shadow-none hover:shadow-none transition-all hover:-translate-y-1 ${
                  viewMode === 'list' ? 'flex flex-row items-center' : ''
                }`}
                style={{ boxShadow: 'var(--clay-shadow)' }}
              >
                {viewMode === 'grid' ? (
                  <>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-2 flex-1">{presentation.title}</CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 clay-button border-0 shadow-none"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditPresentation(presentation)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(presentation)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(presentation)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
                  </>
                ) : (
                  <>
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="mb-2">{presentation.title}</h3>
                          <div className="flex flex-wrap gap-4 text-muted-foreground">
                            <span>Last edited: {presentation.lastEdited}</span>
                            <span>•</span>
                            <span>{presentation.slides.length} slide{presentation.slides.length !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => onEditPresentation(presentation)}
                            variant="outline"
                            className="min-h-[44px] gap-2 clay-button border-0 shadow-none"
                          >
                            <Edit className="w-4 h-4" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="min-h-[44px] w-11 p-0 clay-button border-0 shadow-none"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onEditPresentation(presentation)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(presentation)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClick(presentation)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-12 clay-card border-0" style={{ boxShadow: 'var(--clay-shadow)' }}>
            <div className="clay-card w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="mb-2">No presentations found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search query
            </p>
            <Button 
              variant="outline" 
              onClick={() => setSearchQuery('')}
              className="clay-button border-0 shadow-none"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="text-center py-12 clay-card border-0" style={{ boxShadow: 'var(--clay-shadow)' }}>
            <div className="clay-card w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <PresentationIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="mb-2">No presentations yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first AI-powered presentation to get started
            </p>
            <Button onClick={onNewPresentation} className="min-h-[44px] gap-2 clay-primary border-0 shadow-none">
              <FilePlus className="w-5 h-5" />
              Create Your First Presentation
            </Button>
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="clay-card border-0">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Presentation?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{presentationToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="clay-button border-0 shadow-none">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
