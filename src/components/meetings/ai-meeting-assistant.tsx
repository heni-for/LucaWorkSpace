'use client';

import * as React from 'react';
import { 
  Bot, 
  Languages, 
  Sparkles, 
  Mic, 
  MicOff, 
  Settings, 
  MessageSquare, 
  Copy, 
  Share2, 
  CheckCircle2, 
  Info, 
  Clock, 
  Users, 
  Globe, 
  Heart, 
  Smile, 
  Frown, 
  Meh, 
  HelpCircle, 
  Lightbulb, 
  Target, 
  Filter, 
  Minimize2,
  Maximize2,
  X,
  Check,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RealAudioProcessor } from '@/lib/real-audio-processor';
import { AudioControls } from './audio-visualizer';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { AdvancedCard } from '@/components/ui/advanced-card';

interface AIAssistantProps {
  meetingId: string;
  isActive: boolean;
  onToggle: () => void;
  className?: string;
}

interface TranscriptionEntry {
  id: string;
  speaker: string;
  text: string;
  language: string;
  timestamp: string;
  confidence: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  translatedText?: string;
}

interface AIInsight {
  id: string;
  type: 'action_item' | 'decision' | 'topic' | 'sentiment' | 'question' | 'suggestion';
  content: string;
  confidence: number;
  timestamp: string;
  speaker?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'new' | 'acknowledged' | 'resolved';
}

interface LanguageDetection {
  language: string;
  confidence: number;
  isPrimary: boolean;
}

const mockTranscriptions: TranscriptionEntry[] = [
  {
    id: '1',
    speaker: 'Amira',
    text: 'نحنا نحتاجو نزيدو الفريق ديما...',
    language: 'ar-TN',
    timestamp: '10:15:32',
    confidence: 0.92,
    sentiment: 'positive',
    translatedText: 'We need to expand the team...'
  },
  {
    id: '2',
    speaker: 'Karim',
    text: 'Je suis d\'accord avec cette proposition...',
    language: 'fr-FR',
    timestamp: '10:16:45',
    confidence: 0.88,
    sentiment: 'positive',
    translatedText: 'I agree with this proposal...'
  }
];

const mockInsights: AIInsight[] = [
  {
    id: '1',
    type: 'action_item',
    content: 'Karim to prepare budget proposal by Friday',
    confidence: 0.89,
    timestamp: '10:16:45',
    speaker: 'Karim',
    priority: 'high',
    status: 'new'
  },
  {
    id: '2',
    type: 'decision',
    content: 'Approved hiring 3 new developers for Q3',
    confidence: 0.94,
    timestamp: '11:00 AM',
    speaker: 'Amira',
    priority: 'high',
    status: 'new'
  }
];

const detectedLanguages: LanguageDetection[] = [
  { language: 'Derja (Tunisian Arabic)', confidence: 0.45, isPrimary: true },
  { language: 'French', confidence: 0.35, isPrimary: false },
  { language: 'English', confidence: 0.20, isPrimary: false }
];

export function AIMeetingAssistant({ meetingId, isActive, onToggle, className }: AIAssistantProps) {
  const [activeTab, setActiveTab] = React.useState('transcription');
  const [transcriptions, setTranscriptions] = React.useState<TranscriptionEntry[]>(mockTranscriptions);
  const [insights, setInsights] = React.useState<AIInsight[]>(mockInsights);
  const [isListening, setIsListening] = React.useState(true);
  const [isTranslating, setIsTranslating] = React.useState(true);
  const [selectedLanguage, setSelectedLanguage] = React.useState('auto');
  const [insightFilter, setInsightFilter] = React.useState<string>('all');
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [currentSpeaker, setCurrentSpeaker] = React.useState('Amira Gharbi');
  const [audioProcessor] = React.useState(() => RealAudioProcessor.getInstance());
  const [audioLevel, setAudioLevel] = React.useState(0);
  const [microphonePermission, setMicrophonePermission] = React.useState(false);

  const filteredInsights = React.useMemo(() => {
    if (insightFilter === 'all') return insights;
    return insights.filter(insight => insight.type === insightFilter);
  }, [insights, insightFilter]);

  // Real-time AI Processing Functions
  const processAIInput = async (text: string, speaker: string) => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/ai-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process_meeting_input',
          data: {
            text: text,
            speaker: speaker,
            language: selectedLanguage
          }
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        const { transcription, translation, sentiment, actionItems } = result.data;
        
        // Update transcription
        if (transcription) {
          const newTranscription: TranscriptionEntry = {
            id: Date.now().toString(),
            speaker: speaker,
            text: transcription.text,
            language: transcription.detectedLanguage,
            timestamp: new Date().toLocaleTimeString(),
            confidence: transcription.confidence,
            sentiment: sentiment?.sentiment || 'neutral',
            translatedText: translation?.translatedText
          };
          
          setTranscriptions(prev => [...prev, newTranscription]);
        }
        
        // Update insights
        if (sentiment) {
          const newInsight: AIInsight = {
            id: Date.now().toString(),
            type: 'sentiment',
            content: `Sentiment: ${sentiment.sentiment} (${Math.round(sentiment.confidence * 100)}% confidence)`,
            confidence: sentiment.confidence,
            timestamp: new Date().toLocaleTimeString(),
            speaker: speaker,
            priority: 'low',
            status: 'new'
          };
          
          setInsights(prev => [...prev, newInsight]);
        }
        
        // Update action items
        if (actionItems && actionItems.actionItems.length > 0) {
          actionItems.actionItems.forEach((item: any) => {
            const newInsight: AIInsight = {
              id: Date.now().toString() + Math.random(),
              type: 'action_item',
              content: item.text,
              confidence: item.confidence,
              timestamp: new Date().toLocaleTimeString(),
              speaker: speaker,
              priority: item.priority,
              status: 'new'
            };
            
            setInsights(prev => [...prev, newInsight]);
          });
        }
      }
    } catch (error) {
      console.error('AI processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Initialize Real Audio Processing
  React.useEffect(() => {
    const initializeAudio = async () => {
      // Check microphone permission
      const hasPermission = await audioProcessor.checkMicrophonePermission();
      setMicrophonePermission(hasPermission);
      
      if (hasPermission) {
        // Set up transcription callback
        audioProcessor.setTranscriptionCallback((text: string, confidence: number) => {
          if (text.trim()) {
            processAIInput(text, currentSpeaker);
          }
        });
        
        // Set up audio level callback
        audioProcessor.setAudioLevelCallback((level: number) => {
          setAudioLevel(level);
        });
      }
    };
    
    initializeAudio();
    
    // Cleanup on unmount
    return () => {
      audioProcessor.cleanup();
    };
  }, [currentSpeaker]);

  // Handle real-time recording toggle
  const toggleListening = async () => {
    if (!microphonePermission) {
      alert('Microphone permission is required for real-time transcription');
      return;
    }
    
    if (isListening) {
      audioProcessor.stopRecording();
      setIsListening(false);
    } else {
      const started = await audioProcessor.startRecording();
      if (started) {
        setIsListening(true);
      } else {
        alert('Failed to start recording. Please check your microphone.');
      }
    }
  };

  // Handle language change
  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    audioProcessor.setLanguage(language);
  };

  const getSentimentIcon = (sentiment: TranscriptionEntry['sentiment']) => {
    switch (sentiment) {
      case 'positive': return Smile;
      case 'negative': return Frown;
      case 'neutral': return Meh;
      default: return Meh;
    }
  };

  const getSentimentColor = (sentiment: TranscriptionEntry['sentiment']) => {
    switch (sentiment) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      case 'neutral': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'action_item': return CheckCircle2;
      case 'decision': return Target;
      case 'topic': return MessageSquare;
      case 'sentiment': return Heart;
      case 'question': return HelpCircle;
      case 'suggestion': return Lightbulb;
      default: return Info;
    }
  };

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'action_item': return 'text-blue-500';
      case 'decision': return 'text-green-500';
      case 'topic': return 'text-purple-500';
      case 'sentiment': return 'text-pink-500';
      case 'question': return 'text-orange-500';
      case 'suggestion': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityColor = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  if (!isActive) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("fixed bottom-4 right-4 z-50", className)}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90 shadow-lg"
              onClick={onToggle}
            >
              <Bot className="h-8 w-8" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Activate AI Meeting Assistant</TooltipContent>
        </Tooltip>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={cn(
        "fixed bottom-4 right-4 w-96 h-[600px] z-50 bg-background border rounded-lg shadow-xl",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">AI Meeting Assistant</h3>
            <p className="text-xs text-muted-foreground">Powered by LUCA AI</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isExpanded ? 'Minimize' : 'Maximize'}</TooltipContent>
          </Tooltip>
          
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="flex flex-col h-[calc(100%-80px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="transcription" className="flex items-center gap-1">
                  <Languages className="h-3 w-3" />
                  Live
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Insights
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-1">
                  <Settings className="h-3 w-3" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Live Transcription */}
            <TabsContent value="transcription" className="flex-1 flex flex-col">
              <div className="p-4 border-b bg-card/30">
                {/* Real Audio Controls */}
                <AudioControls
                  isRecording={isListening}
                  onToggleRecording={toggleListening}
                  onLanguageChange={handleLanguageChange}
                  selectedLanguage={selectedLanguage}
                  audioLevel={audioLevel}
                  isProcessing={isProcessing}
                  className="mb-4"
                />
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", isListening ? "bg-green-500" : "bg-gray-500")}></div>
                    <span className="text-sm font-medium">Live Transcription</span>
                    {isProcessing && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <span className="text-xs text-blue-500">Processing...</span>
                      </div>
                    )}
                    {!microphonePermission && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-xs text-red-500">No Microphone Access</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant={isTranslating ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsTranslating(!isTranslating)}
                    >
                      <Languages className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {/* Language Detection */}
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Detected Languages:</div>
                  <div className="flex gap-1">
                    {detectedLanguages.map((lang, index) => (
                      <Badge
                        key={index}
                        variant={lang.isPrimary ? "default" : "outline"}
                        className="text-xs"
                      >
                        {lang.language} ({Math.round(lang.confidence * 100)}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {transcriptions.map((entry, index) => {
                    const SentimentIcon = getSentimentIcon(entry.sentiment);
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-2"
                      >
                        {/* Speaker and Quote Format */}
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-primary text-sm">{entry.speaker}:</span>
                          <div className="flex-1">
                            <span className="text-sm">"{entry.text}"</span>
                            {isTranslating && entry.translatedText && (
                              <span className="text-sm text-muted-foreground italic ml-2">
                                ({entry.translatedText})
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Metadata */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground ml-4">
                          <Badge variant="outline" className="text-xs">
                            {entry.language}
                          </Badge>
                          <span>{entry.timestamp}</span>
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(entry.confidence * 100)}%
                          </Badge>
                          <SentimentIcon className={cn("h-3 w-3", getSentimentColor(entry.sentiment))} />
                        </div>
                      </motion.div>
                    );
                  })}
                  
                  {/* Empty State */}
                  {transcriptions.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                      <Mic className="h-8 w-8 mb-2" />
                      <p className="text-sm">Start speaking to see live transcription</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* AI Insights */}
            <TabsContent value="insights" className="flex-1 flex flex-col">
              <div className="p-4 border-b bg-card/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">AI Insights</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-3 w-3 mr-1" />
                        Filter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setInsightFilter('all')}>
                        All Insights
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setInsightFilter('action_item')}>
                        Action Items
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setInsightFilter('decision')}>
                        Decisions
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setInsightFilter('topic')}>
                        Topics
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setInsightFilter('sentiment')}>
                        Sentiment
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="flex gap-1">
                  <Badge variant="outline" className="text-xs">
                    {insights.length} insights
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {insights.filter(i => i.status === 'new').length} new
                  </Badge>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {filteredInsights.map((insight, index) => {
                    const InsightIcon = getInsightIcon(insight.type);
                    return (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-2"
                      >
                        {/* Insight Type and Content */}
                        <div className="flex items-start gap-2">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                            getInsightColor(insight.type)
                          )}>
                            <InsightIcon className="h-3 w-3 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {insight.type.replace('_', ' ')}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{insight.timestamp}</span>
                              {insight.status === 'new' && (
                                <Badge variant="destructive" className="text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm">{insight.content}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <span>{insight.speaker}</span>
                              <Badge variant="secondary" className="text-xs">
                                {insight.priority}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {Math.round(insight.confidence * 100)}%
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  
                  {/* Empty State */}
                  {filteredInsights.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                      <Brain className="h-8 w-8 mb-2" />
                      <p className="text-sm">AI insights will appear here as the meeting progresses</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings" className="flex-1 p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Transcription Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto-detect language</span>
                      <Button variant="outline" size="sm">
                        {selectedLanguage === 'auto' ? 'ON' : 'OFF'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Real-time translation</span>
                      <Button variant="outline" size="sm">
                        {isTranslating ? 'ON' : 'OFF'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Confidence threshold</span>
                      <Badge variant="outline">90%</Badge>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-3">AI Features</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Action item detection</span>
                      <Button variant="outline" size="sm">ON</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sentiment analysis</span>
                      <Button variant="outline" size="sm">ON</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Topic extraction</span>
                      <Button variant="outline" size="sm">ON</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Decision tracking</span>
                      <Button variant="outline" size="sm">ON</Button>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-3">Languages</h4>
                  <div className="space-y-2">
                    {detectedLanguages.map((lang, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{lang.language}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={lang.confidence * 100} className="w-16 h-2" />
                          <span className="text-xs text-muted-foreground">
                            {Math.round(lang.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </motion.div>
  );
}

export default AIMeetingAssistant;