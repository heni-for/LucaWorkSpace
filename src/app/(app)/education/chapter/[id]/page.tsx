'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { memory } from '@/lib/memory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, BookOpen, ArrowLeft, CheckCircle2, ExternalLink, Globe, FileText, ListChecks, Lightbulb, Play, Video, Volume2, VolumeX, Pause, Mic } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLucaVoice } from '@/hooks/use-luca-voice';

export default function ChapterDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const chapterId = params.id as string;
  
  const [chapterReminder, setChapterReminder] = React.useState<any>(null);
  const [researchData, setResearchData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [youtubeVideos, setYoutubeVideos] = React.useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = React.useState(false);
  const [autoSpeak, setAutoSpeak] = React.useState(false);
  
  // Use LUCA Voice Assistant
  const { 
    isListening, 
    status, 
    lastCommand, 
    lastResponse, 
    toggleListening, 
    start, 
    speak 
  } = useLucaVoice();
  
  const isSpeaking = status === 'speaking';
  const isProcessing = status === 'processing';

  const searchYouTubeVideos = React.useCallback(async (chapterName: string, courseName?: string) => {
    console.log('🔍 Searching YouTube for:', chapterName);
    setLoadingVideos(true);
    
    try {
      // Call the YouTube search API
      const response = await fetch('/api/education/youtube-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterName,
          courseName,
        }),
      });

      if (!response.ok) {
        throw new Error('YouTube search API failed');
      }

      const data = await response.json();
      
      console.log('✅ Found videos:', data.videos?.length || 0);
      
      if (data.videos && data.videos.length > 0) {
        setYoutubeVideos(data.videos);
      } else {
        setYoutubeVideos([]);
      }
    } catch (error) {
      console.error('❌ Failed to search YouTube videos:', error);
      // Set empty array on error so UI shows "no videos"
      setYoutubeVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  }, []);

  React.useEffect(() => {
    // Load chapter data from memory
    const snapshot = memory.getSnapshot();
    const reminder = snapshot.chapterReminders.find(r => r.id === chapterId);
    
    if (reminder) {
      setChapterReminder(reminder);
      
      // Try to load research data if available
      if (reminder.fullPlan) {
        setResearchData({
          difficulty: reminder.difficulty,
          estimatedHours: reminder.totalHours,
          concepts: reminder.fullPlan.learningPhases?.flatMap((p: any) => p.concepts || []) || [],
        });
      }
      
      // Auto-search for YouTube videos with slight delay to ensure render
      setTimeout(() => {
        searchYouTubeVideos(reminder.chapterName, reminder.courseName);
      }, 100);
    }
    setLoading(false);
  }, [chapterId, searchYouTubeVideos]);

  const updateStatus = (status: 'Not Started' | 'In Progress' | 'Completed') => {
    memory.updateChapterReminder(chapterId, { status });
    setChapterReminder({ ...chapterReminder, status });
  };

  const updatePhase = (phase: number) => {
    memory.updateChapterReminder(chapterId, { currentPhase: phase });
    setChapterReminder({ ...chapterReminder, currentPhase: phase });
  };

  // Get plan from chapterReminder
  const plan = chapterReminder?.fullPlan;

  // Speak chapter overview
  const speakChapterOverview = React.useCallback(async () => {
    if (!chapterReminder || !plan) return;
    
    let textToSpeak = `${chapterReminder.chapterName}. `;
    
    if (plan.overview) {
      textToSpeak += plan.overview;
    }
    
    await speak(textToSpeak);
  }, [chapterReminder, plan, speak]);

  // Auto-speak when page loads if enabled
  React.useEffect(() => {
    if (autoSpeak && chapterReminder && plan && !isSpeaking) {
      setTimeout(() => {
        speakChapterOverview();
      }, 1000);
    }
  }, [autoSpeak, chapterReminder, plan, isSpeaking, speakChapterOverview]);

  // Auto-start listening when component mounts
  React.useEffect(() => {
    // Start LUCA listening in background automatically
    const timer = setTimeout(() => {
      start();
    }, 500);

    return () => clearTimeout(timer);
  }, [start]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading chapter details...</div>
        </div>
      </div>
    );
  }

  if (!chapterReminder) {
    return (
      <div className="p-6">
        <PageHeader title="Chapter Not Found" description="This chapter could not be found." />
        <Card className="mt-6">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">The chapter you're looking for doesn't exist or has been removed.</p>
            <Link href="/memory">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Memory
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPct = chapterReminder.currentPhase && chapterReminder.phaseCount
    ? Math.round(((chapterReminder.currentPhase - 1) / chapterReminder.phaseCount) * 100)
    : 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'hard': return 'destructive';
      case 'medium': return 'default';
      case 'easy': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Link href="/memory">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Memory
          </Button>
        </Link>
      </div>

      <PageHeader 
        title={chapterReminder.chapterName} 
        description={chapterReminder.courseName || 'Chapter Study Plan & Research'}
      />

      {/* AUDIO DIAGNOSTIC - VERY VISIBLE */}
      <Card className="border-4 border-red-500 bg-red-50">
        <CardContent className="py-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-red-900">⚠️ AUDIO TROUBLESHOOTING</h2>
            <p className="text-lg text-red-800 font-semibold">Speech API works but you can't hear anything!</p>
            
            <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4 text-left">
              <h3 className="font-bold text-yellow-900 mb-2">🔍 Quick Fixes:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-900">
                <li><strong>CHECK VOLUME</strong> - Is your system volume turned up? 🔊</li>
                <li><strong>CHECK SPEAKERS</strong> - Are headphones/speakers plugged in and working?</li>
                <li><strong>TEST OTHER AUDIO</strong> - Can you hear YouTube videos? Music?</li>
                <li><strong>CHECK BROWSER TAB</strong> - Is the tab muted? (look for 🔇 icon on tab)</li>
                <li><strong>WINDOWS AUDIO MIXER</strong> - Right-click volume icon → Open Volume Mixer → Check browser volume</li>
                <li><strong>TRY INCOGNITO MODE</strong> - Ctrl+Shift+N → Test there</li>
              </ol>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                size="lg"
                className="h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  // Play a beep sound using Audio API
                  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                  const oscillator = audioContext.createOscillator();
                  const gainNode = audioContext.createGain();
                  
                  oscillator.connect(gainNode);
                  gainNode.connect(audioContext.destination);
                  
                  oscillator.frequency.value = 440; // A note
                  gainNode.gain.value = 0.3;
                  
                  oscillator.start();
                  oscillator.stop(audioContext.currentTime + 0.5);
                  
                  alert('🔊 Did you hear a BEEP sound?\n\nYES ✅ - Audio works, speech synthesis issue\nNO ❌ - System audio problem, check volume/speakers!');
                }}
              >
                🔊 Test Beep Sound
              </Button>
              
              <Button
                size="lg"
                className="h-14 text-lg font-bold bg-green-600 hover:bg-green-700"
                onClick={() => {
                  const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYHGmi77eeeTRALUKfj8LZjHAU5kdfy');
                  audio.play().then(() => {
                    alert('🔊 Did you hear a sound?\n\nYES ✅ - Audio output works!\nNO ❌ - Check volume/speakers/headphones!');
                  }).catch(err => {
                    alert('❌ Audio playback blocked: ' + err.message);
                  });
                }}
              >
                🎵 Test Audio File
              </Button>
            </div>
            
            <p className="text-sm text-red-800">Test if your browser can speak:</p>
            <Button
              size="lg"
              className="text-xl font-bold h-16 px-8 bg-red-600 hover:bg-red-700"
              onClick={() => {
                console.log('=== SIMPLE SPEECH TEST ===');
                try {
                  if (!window.speechSynthesis) {
                    alert('❌ Your browser does not support speech!');
                    return;
                  }
                  
                  // First, load voices
                  const voices = window.speechSynthesis.getVoices();
                  console.log('📊 Available voices:', voices.length);
                  
                  if (voices.length === 0) {
                    console.warn('⚠️ No voices loaded yet, waiting...');
                    // Wait for voices to load
                    window.speechSynthesis.onvoiceschanged = () => {
                      const newVoices = window.speechSynthesis.getVoices();
                      console.log('✅ Voices loaded:', newVoices.length);
                    };
                    alert('⏳ Voices are loading... Click the button again in 2 seconds!');
                    return;
                  }
                  
                  console.log('📋 All voices:', voices.map(v => `${v.name} (${v.lang})`));
                  
                  // Cancel any existing speech
                  window.speechSynthesis.cancel();
                  
                  const msg = new SpeechSynthesisUtterance('Hello. Testing. One two three.');
                  
                  // Use first available voice
                  const defaultVoice = voices[0];
                  if (defaultVoice) {
                    msg.voice = defaultVoice;
                    msg.lang = defaultVoice.lang;
                    console.log('🎙️ Using voice:', defaultVoice.name, defaultVoice.lang);
                  } else {
                    msg.lang = 'en-US';
                  }
                  
                  msg.rate = 1.0;
                  msg.volume = 1.0;
                  
                  msg.onstart = () => {
                    console.log('✅✅✅ SPEECH STARTED! You should hear sound now!');
                  };
                  
                  msg.onend = () => {
                    console.log('✅ Speech ended successfully');
                    alert('✅ Speech test complete! Did you hear "Hello Testing..."?\n\nYes? Speech works! ✅\nNo? Check volume! 🔊');
                  };
                  
                  msg.onerror = (e: any) => {
                    console.error('❌ Speech failed:', e);
                    console.error('Error details:', {
                      error: e.error,
                      type: e.type,
                      currentTarget: e.currentTarget
                    });
                    alert(`❌ Speech error: "${e.error || 'unknown'}"\n\nPossible fixes:\n- Turn up volume 🔊\n- Check speakers/headphones\n- Try Chrome/Edge browser`);
                  };
                  
                  console.log('🔊 Calling speechSynthesis.speak()...');
                  window.speechSynthesis.speak(msg);
                  
                  // Check status after a moment
                  setTimeout(() => {
                    console.log('📊 Is speaking?', window.speechSynthesis.speaking);
                    console.log('📊 Is pending?', window.speechSynthesis.pending);
                    if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
                      console.error('❌ Speech didn\'t start! This might be a browser/system issue.');
                    }
                  }, 100);
                  
                } catch (error) {
                  console.error('❌ Test failed:', error);
                  alert('Test failed: ' + error);
                }
              }}
            >
              🔊 TEST SPEECH NOW - CLICK ME!
            </Button>
            <p className="text-xs text-red-700">If you don't hear "Hello Testing...", check your volume/speakers!</p>
          </div>
        </CardContent>
      </Card>

      {/* Voice Control Panel - LUCA Speaking & Listening - PROMINENT AT TOP */}
      <Card className="border-4 border-purple-500 bg-gradient-to-r from-purple-100 via-blue-100 to-pink-100 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              🎙️ LUCA Voice Assistant
              {isListening && (
                <Badge variant="destructive" className="animate-pulse">
                  🔴 LIVE
                </Badge>
              )}
            </CardTitle>
            
            {/* PROMINENT ENABLE MIC BUTTON */}
            <Button
              onClick={toggleListening}
              variant={isListening ? 'destructive' : 'default'}
              size="lg"
              className={`text-lg font-bold ${isListening ? 'animate-pulse bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isListening ? (
                <>
                  <Mic className="h-5 w-5 mr-2" />
                  🔴 LISTENING... 👂
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 mr-2" />
                  🎤 ENABLE MICROPHONE
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-full ${
                isSpeaking ? 'bg-purple-600 animate-pulse' : 
                isListening ? 'bg-green-600 animate-pulse' : 
                'bg-gray-300'
              }`}>
                {isSpeaking ? (
                  <Volume2 className="h-8 w-8 text-white" />
                ) : isListening ? (
                  <Mic className="h-8 w-8 text-white animate-pulse" />
                ) : (
                  <VolumeX className="h-8 w-8 text-gray-600" />
                )}
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {isSpeaking ? '🔊 Speaking in Arabic/Derja...' : 
                   isProcessing ? '⚙️ Processing your command...' :
                   isListening ? '👂 Listening for "Ahla Beleh" or "LUCA"...' : 
                   '🎤 Click "ENABLE MICROPHONE" to start'}
                </p>
                {lastCommand && (
                  <p className="text-sm text-purple-700 mt-1 font-medium">
                    📝 You said: "{lastCommand}"
                  </p>
                )}
                {lastResponse && (
                  <p className="text-sm text-green-700 mt-1 font-medium">
                    💬 LUCA: "{lastResponse}"
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={autoSpeak}
                  onCheckedChange={setAutoSpeak}
                  id="auto-speak"
                />
                <Label htmlFor="auto-speak" className="text-sm cursor-pointer font-medium">
                  Auto-speak
                </Label>
              </div>
              
              <Button
                onClick={speakChapterOverview}
                variant="default"
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isSpeaking || isProcessing}
              >
                <Volume2 className="h-4 w-4 mr-2" />
                {isSpeaking ? 'Speaking...' : 'Play Overview'}
              </Button>
            </div>
          </div>
          
          {/* Voice Instructions & Test */}
          <div className="bg-white/80 backdrop-blur rounded-lg p-3 border border-purple-200">
            <div className="flex items-start gap-2 text-xs text-purple-900">
              <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong>How to use / كيفاش تستعمل:</strong> 
                 <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Click "🎤 ENABLE MICROPHONE" button above (allow mic when browser asks)</li>
                  <li>Wait for button to turn RED with "🔴 LISTENING"</li>
                  <li>Say <strong>"LUCA"</strong> or <strong>"Ahla Beleh"</strong> clearly into your mic</li>
                  <li>LUCA will respond: <strong>"أني نسمع فيك"</strong> (ani nasma3 fyk)</li>
                  <li>Check console (F12) - you should see "🎤 LUCA HEARD: ..."</li>
                </ol>
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-900">
                  <strong>💡 Troubleshooting:</strong>
                  <ul className="list-disc list-inside mt-1">
                    <li>Press F12 and check console for "🎤 LUCA HEARD" messages</li>
                    <li>Make sure your microphone is working (test in other apps)</li>
                    <li>Use Chrome or Edge browser for best results</li>
                    <li>Speak clearly and not too quietly</li>
                  </ul>
                </div>
                
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      console.log('🧪 DIRECT SPEECH TEST (bypassing LUCA)...');
                      if (typeof window !== 'undefined' && window.speechSynthesis) {
                        window.speechSynthesis.cancel();
                        const utterance = new SpeechSynthesisUtterance('أني نسمع فيك');
                        utterance.lang = 'ar';
                        utterance.rate = 1.0;
                        utterance.volume = 1.0;
                        utterance.onstart = () => console.log('✅ Direct speech started!');
                        utterance.onend = () => console.log('✅ Direct speech ended!');
                        utterance.onerror = (e) => console.error('❌ Direct speech error:', e);
                        console.log('🔊 Calling speak()...');
                        window.speechSynthesis.speak(utterance);
                        console.log('📊 Speaking?', window.speechSynthesis.speaking);
                      } else {
                        alert('❌ Speech synthesis not available!');
                      }
                    }}
                  >
                    🔊 DIRECT TEST (Simple)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      console.log('🧪 Testing LUCA speech system...');
                      await speak('مرحبا! أني LUCA. أني نسمع فيك.');
                    }}
                    disabled={isSpeaking}
                  >
                    🧪 Test LUCA Voice
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('📊 LUCA Status Check:');
                      console.log('  - Is Listening:', isListening);
                      console.log('  - Status:', status);
                      console.log('  - Last Command:', lastCommand || 'none');
                      console.log('  - Last Response:', lastResponse || 'none');
                      const voices = window.speechSynthesis.getVoices();
                      console.log('  - Available voices:', voices.length);
                      console.log('  - Arabic voices:', voices.filter(v => v.lang.startsWith('ar')));
                      alert(`LUCA Status:\n\nListening: ${isListening ? 'YES ✅' : 'NO ❌'}\nStatus: ${status}\nLast heard: ${lastCommand || 'nothing yet'}\nVoices: ${voices.length}`);
                    }}
                  >
                    📊 Check Status
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold">{chapterReminder.totalHours}h</div>
            <div className="text-xs text-muted-foreground">Total Hours</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Badge variant={getDifficultyColor(chapterReminder.difficulty)} className="text-sm">
              {chapterReminder.difficulty}
            </Badge>
            <div className="text-xs text-muted-foreground mt-2">Difficulty</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold">{chapterReminder.phaseCount}</div>
            <div className="text-xs text-muted-foreground">Learning Phases</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold">{progressPct}%</div>
            <div className="text-xs text-muted-foreground">Progress</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
          <TabsTrigger value="plan">Study Plan</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Reminder Message */}
          <Card className="border-blue-200 bg-blue-50/30">
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl">
                  💡
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Your Learning Path</h3>
                  <p className="text-blue-900">{chapterReminder.reminderMessage}</p>
                  <div className="mt-4">
                    <Progress value={progressPct} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Phase {chapterReminder.currentPhase || 1} of {chapterReminder.phaseCount}</span>
                      <span>{progressPct}% Complete</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chapter Content Slide - Always Show */}
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                Chapter Content / محتوى الفصل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* What You Need to Start - Checklist */}
              <div className="bg-white/80 backdrop-blur rounded-lg p-6 border border-green-100">
                <h3 className="text-xl font-bold mb-4 text-green-900 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  ✅ What You Need to Start / ما تحتاج للبدء
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50/50 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm">
                      1
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">Chapter Name / اسم الفصل</h4>
                      <p className="text-sm text-muted-foreground">{chapterReminder.chapterName}</p>
                    </div>
                  </div>
                  
                  {chapterReminder.courseName && (
                    <div className="flex items-start gap-3 p-3 bg-green-50/50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm">
                        2
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">Course / الدورة</h4>
                        <p className="text-sm text-muted-foreground">{chapterReminder.courseName}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50/50 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm">
                      {chapterReminder.courseName ? '3' : '2'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">Total Study Time / الوقت الإجمالي</h4>
                      <p className="text-sm text-muted-foreground">{chapterReminder.totalHours} hours / ساعات</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50/50 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm">
                      {chapterReminder.courseName ? '4' : '3'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">Difficulty Level / مستوى الصعوبة</h4>
                      <Badge variant={getDifficultyColor(chapterReminder.difficulty)} className="mt-1">
                        {chapterReminder.difficulty}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50/50 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm">
                      {chapterReminder.courseName ? '5' : '4'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">Number of Phases / عدد المراحل</h4>
                      <p className="text-sm text-muted-foreground">{chapterReminder.phaseCount} learning phases / مراحل تعليمية</p>
                    </div>
                  </div>
                  
                  {plan && plan.prerequisitesCheck && plan.prerequisitesCheck.required && plan.prerequisitesCheck.required.length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-yellow-50/50 rounded-lg border border-yellow-200">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-600 text-white flex items-center justify-center text-sm">
                        ⚠️
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1 text-yellow-900">Prerequisites Required / المتطلبات السابقة</h4>
                        <ul className="text-xs text-yellow-800 space-y-1 mt-2">
                          {plan.prerequisitesCheck.required.map((prereq: string, i: number) => (
                            <li key={i} className="flex items-center gap-2">
                              <span>•</span>
                              <span>{prereq}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chapter Overview */}
              {plan && plan.overview && (
                <div className="bg-white/80 backdrop-blur rounded-lg p-6 border border-purple-100">
                  <h3 className="text-xl font-bold mb-4 text-purple-900">📚 Overview</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {plan.overview}
                  </p>
                </div>
              )}

                {/* Key Learning Points */}
                {plan.learningPhases && plan.learningPhases.length > 0 && (
                  <div className="bg-white/80 backdrop-blur rounded-lg p-6 border border-blue-100">
                    <h3 className="text-xl font-bold mb-4 text-blue-900">🎯 What You'll Learn</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {plan.learningPhases.map((phase: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">{phase.phaseName}</h4>
                            <p className="text-xs text-muted-foreground">{phase.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* YouTube Videos Section */}
                <div className="bg-white/80 backdrop-blur rounded-lg p-6 border border-red-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-red-900 flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      📺 Best YouTube Videos
                    </h3>
                    <Badge variant="destructive" className="bg-red-600">
                      AI Selected
                    </Badge>
                  </div>
                  
                  <div className="mb-4">
                    <Button
                      onClick={() => searchYouTubeVideos(chapterReminder.chapterName, chapterReminder.courseName)}
                      variant="outline"
                      size="sm"
                      disabled={loadingVideos}
                    >
                      {loadingVideos ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                          Searching...
                        </>
                      ) : (
                        <>
                          🔄 Refresh Videos
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {loadingVideos ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Searching best videos...</p>
                    </div>
                  ) : youtubeVideos.length > 0 ? (
                    <div className="grid md:grid-cols-3 gap-4">
                      {youtubeVideos.map((video) => (
                        <a
                          key={video.id}
                          href={`https://www.youtube.com/watch?v=${video.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block bg-white rounded-lg overflow-hidden border hover:border-red-500 hover:shadow-lg transition-all"
                        >
                          <div className="relative aspect-video bg-gray-200">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <div className="w-16 h-16 rounded-full bg-red-600 group-hover:bg-red-700 flex items-center justify-center transition-colors">
                                <Play className="h-8 w-8 text-white ml-1" fill="white" />
                              </div>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                              {video.duration}
                            </div>
                          </div>
                          <div className="p-3">
                            <h4 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-red-600">
                              {video.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">{video.channel}</p>
                            <p className="text-xs text-muted-foreground">{video.views}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No videos found</p>
                    </div>
                  )}
                  
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-xs text-red-800">
                      💡 <strong>Tip:</strong> Watch these videos to get different perspectives and visual explanations of {chapterReminder.chapterName}
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/80 backdrop-blur rounded-lg p-4 border text-center">
                    <div className="text-2xl font-bold text-purple-600">{plan.totalHours}h</div>
                    <div className="text-xs text-muted-foreground">Study Time</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur rounded-lg p-4 border text-center">
                    <div className="text-2xl font-bold text-blue-600">{plan.learningPhases?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Phases</div>
                  </div>
                  <div className="bg-white/80 backdrop-blur rounded-lg p-4 border text-center">
                    <div className="text-2xl font-bold text-green-600">{youtubeVideos.length}</div>
                    <div className="text-xs text-muted-foreground">Videos</div>
                  </div>
                </div>

                {/* Chapter Division - Learning Phases Breakdown */}
                {plan && plan.learningPhases && plan.learningPhases.length > 0 && (
                  <div className="bg-white/80 backdrop-blur rounded-lg p-6 border border-orange-100">
                    <h3 className="text-xl font-bold mb-4 text-orange-900 flex items-center gap-2">
                      <ListChecks className="h-5 w-5" />
                      📊 Chapter Division / تقسيم الفصل
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This chapter is divided into {plan.learningPhases.length} main phases. Follow them in order:
                    </p>
                    <div className="space-y-3">
                      {plan.learningPhases.map((phase: any, idx: number) => (
                        <div 
                          key={idx} 
                          className={`p-4 rounded-lg border-l-4 ${
                            idx === 0 ? 'border-l-green-500 bg-green-50/50' :
                            idx === plan.learningPhases.length - 1 ? 'border-l-purple-500 bg-purple-50/50' :
                            'border-l-blue-500 bg-blue-50/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-bold">
                                {phase.phase}
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-sm mb-1">{phase.phaseName}</h4>
                              <p className="text-xs text-muted-foreground mb-2">{phase.description}</p>
                              
                              <div className="grid grid-cols-2 gap-2 mt-3">
                                <div className="flex items-center gap-2 text-xs">
                                  <Clock className="h-3 w-3" />
                                  <span>{phase.hours}h</span>
                                </div>
                                {phase.concepts && phase.concepts.length > 0 && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <BookOpen className="h-3 w-3" />
                                    <span>{phase.concepts.length} concepts</span>
                                  </div>
                                )}
                              </div>
                              
                              {phase.concepts && phase.concepts.length > 0 && (
                                <div className="mt-3">
                                  <div className="text-xs font-medium mb-1">Key Concepts:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {phase.concepts.map((concept: string, i: number) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        {concept}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {phase.activities && phase.activities.length > 0 && (
                                <div className="mt-3 space-y-1">
                                  <div className="text-xs font-medium">Activities ({phase.activities.length}):</div>
                                  {phase.activities.slice(0, 2).map((activity: any, i: number) => (
                                    <div key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                                      <span>•</span>
                                      <span>{activity.activity} ({activity.duration})</span>
                                    </div>
                                  ))}
                                  {phase.activities.length > 2 && (
                                    <div className="text-xs text-muted-foreground italic">
                                      + {phase.activities.length - 2} more activities
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

          {/* Prerequisites */}
          {plan && plan.prerequisitesCheck && (
            <Card>
              <CardHeader>
                <CardTitle>Prerequisites / المتطلبات السابقة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant={plan.prerequisitesCheck.ready ? 'default' : 'destructive'}>
                    {plan.prerequisitesCheck.ready ? '✓ Ready to Start' : '⚠ Review Prerequisites'}
                  </Badge>
                </div>
                {plan.prerequisitesCheck.required && plan.prerequisitesCheck.required.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {plan.prerequisitesCheck.required.map((prereq: string, i: number) => (
                      <li key={i}>{prereq}</li>
                    ))}
                  </ul>
                )}
                {plan.prerequisitesCheck.recommendations && (
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                    💡 {plan.prerequisitesCheck.recommendations}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Research Tab */}
        <TabsContent value="research" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Research Summary / ملخص البحث
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {plan && plan.learningPhases && (
                <>
                  <div>
                    <h4 className="font-semibold mb-3">Key Concepts Researched:</h4>
                    <div className="flex flex-wrap gap-2">
                      {plan.learningPhases.flatMap((phase: any) => 
                        phase.concepts || []
                      ).filter((v: any, i: number, a: any[]) => a.indexOf(v) === i)
                      .map((concept: string, i: number) => (
                        <Badge key={i} variant="secondary">
                          {concept}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Research Breakdown by Phase:</h4>
                    <div className="space-y-3">
                      {plan.learningPhases.map((phase: any, idx: number) => (
                        <div key={idx} className="bg-muted/30 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Phase {phase.phase}</Badge>
                            <h5 className="font-medium">{phase.phaseName}</h5>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {phase.description}
                          </p>
                          {phase.concepts && phase.concepts.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {phase.concepts.map((concept: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {concept}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-start gap-2">
                  <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="font-medium text-blue-900 mb-1">Web Research Sources</h5>
                    <p className="text-xs text-blue-800 mb-2">
                      This chapter plan was created using comprehensive web research and AI analysis.
                    </p>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        <span>Educational websites and resources</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        <span>Academic content and study guides</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        <span>AI-powered content analysis</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Study Plan Tab */}
        <TabsContent value="plan" className="space-y-4">
          {/* Learning Phases */}
          {plan && plan.learningPhases && (
            <Card>
              <CardHeader>
                <CardTitle>Learning Phases / مراحل التعلم</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan.learningPhases.map((phase: any, idx: number) => {
                  const isCurrentPhase = phase.phase === chapterReminder.currentPhase;
                  const isCompleted = phase.phase < (chapterReminder.currentPhase || 1);
                  
                  return (
                    <div
                      key={idx}
                      className={`border rounded-lg p-4 ${
                        isCurrentPhase ? 'border-blue-500 bg-blue-50/50' : 
                        isCompleted ? 'border-green-500 bg-green-50/30' : 
                        'bg-background'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                          <div className="flex-1">
                            <h3 className="font-semibold">Phase {phase.phase}: {phase.phaseName}</h3>
                            <p className="text-sm text-muted-foreground">{phase.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              const phaseText = `${phase.phaseName}. ${phase.description}. ${
                                phase.concepts ? 'المفاهيم الرئيسية: ' + phase.concepts.join(', ') + '.' : ''
                              }`;
                              await speak(phaseText);
                            }}
                            disabled={isSpeaking || isProcessing}
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {phase.hours}h
                          </Badge>
                        </div>
                      </div>

                      {phase.activities && phase.activities.length > 0 && (
                        <div className="space-y-2 mt-3">
                          <h4 className="text-sm font-medium">Activities:</h4>
                          {phase.activities.map((activity: any, i: number) => (
                            <div key={i} className="bg-background rounded p-3 text-sm border">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium">{activity.activity}</span>
                                <span className="text-xs text-muted-foreground">{activity.duration}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{activity.description}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {phase.milestones && phase.milestones.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium mb-2">Milestones:</h4>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {phase.milestones.map((milestone: string, i: number) => (
                              <li key={i}>{milestone}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Study Schedule */}
          {plan && plan.studySchedule && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Study Schedule / الجدول الدراسي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {plan.studySchedule.map((day: any, idx: number) => (
                    <div
                      key={idx}
                      className={`border rounded-md p-3 ${
                        day.revision ? 'bg-blue-50 border-blue-200' : 'bg-background'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{day.day}</span>
                          {day.revision && <Badge variant="outline" className="text-xs">🔄 Revision</Badge>}
                        </div>
                        <span className="text-sm text-muted-foreground">{day.duration}</span>
                      </div>
                      <p className="text-sm font-medium mb-1">{day.focus}</p>
                      {day.activities && (
                        <p className="text-xs text-muted-foreground">
                          {day.activities.join(' • ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Study Templates / قوالب الدراسة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Assessment Template */}
              {plan && plan.assessment && (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center gap-2 mb-3">
                    <ListChecks className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Assessment Template</h3>
                  </div>
                  
                  {plan.assessment.checkpoints && plan.assessment.checkpoints.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <h4 className="text-sm font-medium">Checkpoints:</h4>
                      {plan.assessment.checkpoints.map((checkpoint: any, idx: number) => (
                        <div key={idx} className="bg-background rounded p-3 text-sm">
                          <div className="font-medium mb-1">{checkpoint.checkpoint}</div>
                          {checkpoint.questions && (
                            <ul className="list-disc list-inside text-xs text-muted-foreground mt-2">
                              {checkpoint.questions.map((q: string, i: number) => (
                                <li key={i}>{q}</li>
                              ))}
                            </ul>
                          )}
                          <div className="text-xs text-muted-foreground mt-2">
                            <strong>Expected:</strong> {checkpoint.expectedOutcome}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {plan.assessment.finalQuizTopics && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Final Quiz Topics:</h4>
                      <div className="flex flex-wrap gap-1">
                        {plan.assessment.finalQuizTopics.map((topic: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notes Template */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold">Notes Template</h3>
                </div>
                <div className="bg-white rounded p-4 font-mono text-sm">
                  <div className="text-muted-foreground">
                    <div># {chapterReminder.chapterName}</div>
                    <div className="mt-2">## Key Points</div>
                    <div>- </div>
                    <div>- </div>
                    <div>- </div>
                    <div className="mt-2">## Summary</div>
                    <div></div>
                    <div className="mt-2">## Questions</div>
                    <div>Q: </div>
                    <div>A: </div>
                  </div>
                </div>
              </div>

              {/* Flashcard Template */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-semibold">Flashcard Template</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {plan && plan.learningPhases && plan.learningPhases.slice(0, 4).map((phase: any, idx: number) => (
                    phase.concepts && phase.concepts.slice(0, 2).map((concept: string, i: number) => (
                      <div key={`${idx}-${i}`} className="bg-white rounded-lg p-4 border-2 border-dashed">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-2">Front</div>
                          <div className="font-semibold text-sm">{concept}</div>
                          <div className="mt-4 text-xs text-muted-foreground">Back</div>
                          <div className="text-xs text-muted-foreground italic">[Your explanation]</div>
                        </div>
                      </div>
                    ))
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Study Resources & Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tips */}
              {plan && plan.tips && plan.tips.length > 0 && (
                <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Study Tips / نصائح الدراسة
                  </h4>
                  <ul className="list-disc list-inside space-y-2 text-sm text-green-900">
                    {plan.tips.map((tip: string, i: number) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Common Mistakes */}
              {plan && plan.commonMistakes && plan.commonMistakes.length > 0 && (
                <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                  <h4 className="font-semibold text-red-900 mb-3">⚠️ Common Mistakes / الأخطاء الشائعة</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm text-red-900">
                    {plan.commonMistakes.map((mistake: string, i: number) => (
                      <li key={i}>{mistake}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Additional Resources */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">📚 Recommended Resources</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Web Research Sources</div>
                      <div className="text-xs text-muted-foreground">
                        This plan was created using comprehensive web research from educational websites
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Study Materials</div>
                      <div className="text-xs text-muted-foreground">
                        Use your course textbook and lecture notes alongside this plan
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Globe className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Online Learning</div>
                      <div className="text-xs text-muted-foreground">
                        Search for "{chapterReminder.chapterName}" on educational platforms for videos and exercises
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Context */}
              {chapterReminder.courseName && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">📖 Course Context</h4>
                  <p className="text-sm text-purple-800">
                    This chapter is part of: <strong>{chapterReminder.courseName}</strong>
                  </p>
                  <p className="text-xs text-purple-700 mt-2">
                    Make sure to review previous chapters and understand how this fits into the overall course structure.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardContent className="py-6">
          <div className="grid grid-cols-2 gap-4">
            <Link href="/memory">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Memory
              </Button>
            </Link>
            <Button
              variant="default"
              className="w-full"
              onClick={() => {
                if (chapterReminder.currentPhase < chapterReminder.phaseCount) {
                  updatePhase(chapterReminder.currentPhase + 1);
                } else {
                  updateStatus('Completed');
                }
              }}
            >
              {chapterReminder.currentPhase < chapterReminder.phaseCount ? (
                <>Move to Next Phase</>
              ) : chapterReminder.status === 'Completed' ? (
                <>✓ Chapter Completed</>
              ) : (
                <>Complete Chapter</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

