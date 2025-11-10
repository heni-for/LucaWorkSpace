'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, BookOpen, Loader2 } from 'lucide-react';

function EducationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [chapterName, setChapterName] = React.useState('');
  const [courseName, setCourseName] = React.useState('');
  const [studentLevel, setStudentLevel] = React.useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [preferredMethod, setPreferredMethod] = React.useState<'reading' | 'listening' | 'practical' | 'mixed'>('mixed');
  
  const [searching, setSearching] = React.useState(false);
  const [researchData, setResearchData] = React.useState<any>(null);
  const [chapterPlan, setChapterPlan] = React.useState<any>(null);

  const searchChapter = async () => {
    if (!chapterName.trim()) {
      alert('Please enter a chapter name');
      return;
    }

    setSearching(true);
    try {
      // Step 1: Research the chapter
      const researchRes = await fetch('/api/education/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterName,
          courseName: courseName || undefined,
          currentLevel: studentLevel,
          language: 'derja',
          enableWebSearch: true,
        }),
      });

      if (!researchRes.ok) {
        throw new Error('Failed to research chapter');
      }

      const research = await researchRes.json();
      setResearchData(research);

      // Step 2: Generate chapter plan
      const planRes = await fetch('/api/education/chapter-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterName,
          courseName: courseName || undefined,
          researchData: research,
          studentLevel,
          preferredMethod,
        }),
      });

      if (!planRes.ok) {
        throw new Error('Failed to generate chapter plan');
      }

      const planData = await planRes.json();
      setChapterPlan(planData.chapterPlan);

      // Save to memory
      if (planData.chapterReminder) {
        const { memory } = await import('@/lib/memory');
        memory.addChapterReminder(planData.chapterReminder);
      }

      alert(`✅ Chapter plan created!\n\nThe chapter "${chapterName}" has been researched and planned. Check your Memory section to view and start studying.`);
    } catch (error: any) {
      console.error('Chapter search error:', error);
      alert(`Failed to search chapter: ${error?.message || 'Unknown error'}`);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader 
        title="LUCA Education Assistant" 
        description="Search and create detailed study plans for any chapter"
      />

      {/* Welcome Card */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <div className="text-5xl">🔍</div>
            <h2 className="text-2xl font-bold">Search for Any Chapter</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enter a chapter name and LUCA will search the web, analyze the content, and create a complete study plan for you in Tunisian Derja.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              <Badge variant="secondary">🌐 Web Research</Badge>
              <Badge variant="secondary">📋 Detailed Plans</Badge>
              <Badge variant="secondary">📝 Auto Quiz Generation</Badge>
              <Badge variant="secondary">💾 Save to Memory</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Chapter Search / البحث عن فصل
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chapter-name">
              Chapter Name / اسم الفصل <span className="text-red-500">*</span>
            </Label>
            <Input
              id="chapter-name"
              placeholder="Example: Photosynthesis, Introduction to Python, etc."
              value={chapterName}
              onChange={(e) => setChapterName(e.target.value)}
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground">
              Enter the topic or chapter you want to learn about
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-name">Course Name / اسم الدورة (Optional)</Label>
            <Input
              id="course-name"
              placeholder="Example: Biology 101, Computer Science, etc."
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Adding a course name helps provide more context
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Your Current Level / مستواك</Label>
              <Select value={studentLevel} onValueChange={(v: any) => setStudentLevel(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner / مبتدئ</SelectItem>
                  <SelectItem value="intermediate">Intermediate / متوسط</SelectItem>
                  <SelectItem value="advanced">Advanced / متقدم</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Preferred Learning Method / طريقة التعلم</Label>
              <Select value={preferredMethod} onValueChange={(v: any) => setPreferredMethod(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reading">Reading / قراءة</SelectItem>
                  <SelectItem value="listening">Listening / استماع</SelectItem>
                  <SelectItem value="practical">Practical / عملي</SelectItem>
                  <SelectItem value="mixed">Mixed / مختلط</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={searchChapter}
            disabled={!chapterName.trim() || searching}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {searching ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Searching and creating plan...
              </>
            ) : (
              <>
                <Search className="h-5 w-5 mr-2" />
                Search Chapter and Create Plan
              </>
            )}
          </Button>

          {searching && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="font-medium text-blue-900">Step 1: Researching chapter from web sources...</span>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  <div className="h-4 w-4" />
                  <span className="text-muted-foreground">Step 2: Generating detailed study plan...</span>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  <div className="h-4 w-4" />
                  <span className="text-muted-foreground">Step 3: Saving to memory...</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Research Results Preview */}
      {researchData && !searching && (
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              ✅ Chapter Research Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Difficulty</div>
                <div className="text-lg font-bold capitalize">{researchData.difficulty || 'N/A'}</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Estimated Hours</div>
                <div className="text-lg font-bold">{researchData.estimatedHours || 'N/A'}h</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Key Concepts</div>
                <div className="text-lg font-bold">{researchData.keyConcepts?.length || 0}</div>
              </div>
            </div>

            {researchData.researchSummary && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold mb-2">Research Summary:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {researchData.researchSummary}
                </p>
              </div>
            )}

            {researchData.keyConcepts && researchData.keyConcepts.length > 0 && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold mb-2">Key Concepts:</h4>
                <div className="flex flex-wrap gap-2">
                  {researchData.keyConcepts.map((concept: any, i: number) => (
                    <Badge
                      key={i}
                      variant={
                        concept.importance === 'critical' ? 'destructive' :
                        concept.importance === 'important' ? 'default' : 'secondary'
                      }
                    >
                      {concept.concept}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chapter Plan Preview */}
      {chapterPlan && !searching && (
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              📋 Study Plan Created
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold mb-2">Overview:</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {chapterPlan.overview}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Total Hours</div>
                <div className="text-lg font-bold">{chapterPlan.totalHours}h</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Learning Phases</div>
                <div className="text-lg font-bold">{chapterPlan.learningPhases?.length || 0}</div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">
                ✅ Your chapter plan has been saved to Memory!
              </p>
              <p className="text-xs text-muted-foreground">
                Go to the Memory section to view the complete plan, start studying, and track your progress.
              </p>
              <Button
                onClick={() => router.push('/memory')}
                variant="default"
                className="w-full mt-3"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Go to Memory Section
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works / كيفاش يخدم</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold">Enter Chapter Name</h4>
                <p className="text-sm text-muted-foreground">
                  Type the topic you want to learn about (e.g., "Photosynthesis", "Machine Learning Basics")
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold">LUCA Searches the Web</h4>
                <p className="text-sm text-muted-foreground">
                  LUCA finds reliable educational content from the internet and analyzes it
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold">Complete Study Plan Generated</h4>
                <p className="text-sm text-muted-foreground">
                  Get a detailed plan with learning phases, schedules, quizzes, and tips in Derja
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold">Saved to Memory</h4>
                <p className="text-sm text-muted-foreground">
                  Your plan is automatically saved. View it anytime in the Memory section and track your progress
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EducationPage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <PageHeader title="LUCA Education Assistant" description="Search and create detailed study plans for any chapter" />
        <Card className="mt-6">
          <CardContent className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <EducationPageContent />
    </Suspense>
  );
}

