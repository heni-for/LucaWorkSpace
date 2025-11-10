'use client';

import * as React from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Users, 
  Settings, 
  Share2, 
  Copy, 
  Calendar, 
  Clock, 
  MapPin, 
  MessageSquare, 
  FileText, 
  Download,
  Camera, 
  Plus, 
  Search, 
  Play, 
  Square, 
  Volume2, 
  ScreenShare, 
  ScreenShareOff, 
  Smile, 
  Bot, 
  Languages, 
  Sparkles, 
  Globe, 
  BarChart3, 
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { AdvancedCard } from '@/components/ui/advanced-card';
import { AIMeetingAssistant } from '@/components/meetings/ai-meeting-assistant';
import { MeetingRoom } from '@/components/meetings/meeting-room';
import { CreateMeeting } from '@/components/meetings/create-meeting';
import { MeetingInvite } from '@/components/meetings/meeting-invite';
import { CameraTest } from '@/components/meetings/camera-test';
import { CameraDiagnostic } from '@/components/meetings/camera-diagnostic';

// Mock data for meetings
interface Meeting {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: string;
  participants: Participant[];
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  type: 'video' | 'audio' | 'hybrid';
  isRecurring: boolean;
  location?: string;
  meetingLink: string;
  aiFeatures: AIFeature[];
}

interface Participant {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'host' | 'participant' | 'guest';
  status: 'joined' | 'invited' | 'declined' | 'pending';
  isMuted: boolean;
  isVideoOn: boolean;
  isSpeaking: boolean;
  joinTime?: string;
}

interface AIFeature {
  id: string;
  name: string;
  type: 'transcription' | 'translation' | 'summary' | 'insights' | 'assistant';
  isEnabled: boolean;
}

const mockMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Q3 Planning Meeting',
    description: 'Quarterly planning session for Q3 2024',
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    date: '2024-01-15',
    participants: [
      {
        id: '1',
        name: 'Amira Gharbi',
        email: 'amira@luca-platform.com',
        avatar: 'AG',
        role: 'host',
        status: 'joined',
        isMuted: false,
        isVideoOn: true,
        isSpeaking: true,
        joinTime: '10:00 AM'
      },
      {
        id: '2',
        name: 'Karim Trabelsi',
        email: 'karim@luca-platform.com',
        avatar: 'KT',
        role: 'participant',
        status: 'joined',
        isMuted: false,
        isVideoOn: true,
        isSpeaking: false,
        joinTime: '10:05 AM'
      }
    ],
    status: 'ongoing',
    type: 'video',
    isRecurring: false,
    location: 'Conference Room A',
    meetingLink: 'https://meet.luca-platform.com/abc123',
    aiFeatures: [
      {
        id: '1',
        name: 'Real-time Transcription',
        type: 'transcription',
        isEnabled: true
      },
      {
        id: '2',
        name: 'AI Translation',
        type: 'translation',
        isEnabled: true
      },
      {
        id: '3',
        name: 'Meeting Assistant',
        type: 'assistant',
        isEnabled: true
      }
    ]
  }
];

export default function MeetingsPage() {
  const [activeTab, setActiveTab] = React.useState('upcoming');
  const [selectedMeeting, setSelectedMeeting] = React.useState<Meeting | null>(null);
  const [isInMeeting, setIsInMeeting] = React.useState(false);
  const [meetingSettings, setMeetingSettings] = React.useState({
    micEnabled: true,
    videoEnabled: true,
    screenShareEnabled: false,
    aiTranscription: true,
    aiTranslation: true,
    aiAssistant: true
  });
  const [searchQuery, setSearchQuery] = React.useState('');
  const [aiAssistantActive, setAiAssistantActive] = React.useState(false);
  const [showCreateMeeting, setShowCreateMeeting] = React.useState(false);
  const [showMeetingInvite, setShowMeetingInvite] = React.useState(false);
  const [currentMeeting, setCurrentMeeting] = React.useState<Meeting | null>(null);
  const [showCameraTest, setShowCameraTest] = React.useState(false);
  const [showCameraDiagnostic, setShowCameraDiagnostic] = React.useState(false);

  const filteredMeetings = React.useMemo(() => {
    let filtered = mockMeetings;
    
    if (searchQuery) {
      filtered = filtered.filter(meeting => 
        meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meeting.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meeting.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    switch (activeTab) {
      case 'upcoming':
        filtered = filtered.filter(m => m.status === 'scheduled');
        break;
      case 'ongoing':
        filtered = filtered.filter(m => m.status === 'ongoing');
        break;
      case 'completed':
        filtered = filtered.filter(m => m.status === 'completed');
        break;
    }
    
    return filtered;
  }, [searchQuery, activeTab]);

  const handleStartMeeting = () => {
    setShowCreateMeeting(true);
  };

  const handleCreateMeeting = (meetingData: any) => {
    const newMeeting: Meeting = {
      id: `meeting-${Date.now()}`,
      title: meetingData.title,
      description: meetingData.description,
      startTime: meetingData.time,
      endTime: '',
      date: meetingData.date,
      participants: [],
      status: 'ongoing',
      type: 'video',
      isRecurring: false,
      meetingLink: `${window.location.origin}/meetings/meeting-${Date.now()}`,
      aiFeatures: [
        {
          id: '1',
          name: 'Real-time Transcription',
          type: 'transcription',
          isEnabled: true
        },
        {
          id: '2',
          name: 'AI Translation',
          type: 'translation',
          isEnabled: true
        },
        {
          id: '3',
          name: 'Meeting Assistant',
          type: 'assistant',
          isEnabled: true
        }
      ]
    };

    setCurrentMeeting(newMeeting);
    setIsInMeeting(true);
    setShowCreateMeeting(false);
    
    if (!meetingData.isInstant) {
      setShowMeetingInvite(true);
    }
  };

  const handleJoinMeeting = (meeting: Meeting) => {
    setCurrentMeeting(meeting);
    setIsInMeeting(true);
  };

  const handleLeaveMeeting = () => {
    setIsInMeeting(false);
    setCurrentMeeting(null);
    setShowMeetingInvite(false);
  };

  const handleSendInvites = (invitees: any[]) => {
    console.log('Sending invites to:', invitees);
    setShowMeetingInvite(false);
  };

  const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'scheduled': return 'text-blue-500';
      case 'ongoing': return 'text-green-500';
      case 'completed': return 'text-gray-500';
      case 'cancelled': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: Meeting['status']) => {
    switch (status) {
      case 'scheduled': return Clock;
      case 'ongoing': return Play;
      case 'completed': return Square;
      case 'cancelled': return Square;
      default: return Clock;
    }
  };

  if (isInMeeting && selectedMeeting) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-black">
        {/* Meeting Header */}
        <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <Video className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h1 className="font-semibold text-white">{selectedMeeting.title}</h1>
              <p className="text-sm text-gray-400">
                {selectedMeeting.participants.length} participant{selectedMeeting.participants.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-500 border-green-500">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              Live
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setIsInMeeting(false)}>
              <PhoneOff className="h-4 w-4 mr-2" />
              Leave
            </Button>
          </div>
        </div>

        {/* Meeting Content */}
        <div className="flex-1 flex">
          {/* Main Video Area */}
          <div className="flex-1 flex flex-col">
            {/* Video Grid */}
            <div className="flex-1 p-4">
              <div className="grid grid-cols-2 gap-4 h-full">
                {selectedMeeting.participants.map((participant, index) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative bg-gray-800 rounded-lg overflow-hidden"
                  >
                    {/* Video Placeholder */}
                    <div className="w-full h-full flex items-center justify-center bg-gray-700">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                          <span className="text-2xl font-bold text-primary">
                            {participant.avatar}
                          </span>
                        </div>
                        <p className="text-white font-medium">{participant.name}</p>
                        <p className="text-gray-400 text-sm">{participant.role}</p>
                      </div>
                    </div>
                    
                    {/* Participant Status */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {participant.isMuted && (
                        <div className="p-1 rounded bg-red-500">
                          <MicOff className="h-3 w-3 text-white" />
                        </div>
                      )}
                      {!participant.isVideoOn && (
                        <div className="p-1 rounded bg-gray-600">
                          <VideoOff className="h-3 w-3 text-white" />
                        </div>
                      )}
                      {participant.isSpeaking && (
                        <div className="p-1 rounded bg-green-500">
                          <Volume2 className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* AI Assistant Panel */}
            <div className="border-t border-gray-700 bg-gray-900 p-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-headline text-white">AI Meeting Assistant</CardTitle>
                    <p className="text-sm text-gray-400">Real-time transcription and insights</p>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Live Transcription */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-white">Live Transcription</span>
                      <Badge variant="outline" className="text-xs">Derja + French + English</Badge>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3 max-h-32 overflow-y-auto">
                      <p className="text-sm text-gray-300">
                        <span className="text-blue-400">Amira:</span> "نحنا نحتاجو نزيدو الفريق ديما..." 
                        <span className="text-gray-500 ml-2">(We need to expand the team...)</span>
                      </p>
                      <p className="text-sm text-gray-300">
                        <span className="text-green-400">Karim:</span> "Je suis d'accord avec cette proposition..."
                        <span className="text-gray-500 ml-2">(I agree with this proposal...)</span>
                      </p>
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-white">AI Insights</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-gray-700 rounded-lg p-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">action_item</Badge>
                          <span className="text-xs text-gray-400">10:16:45</span>
                        </div>
                        <p className="text-sm text-gray-300">Karim to prepare budget proposal by Friday</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">decision</Badge>
                          <span className="text-xs text-gray-400">11:00 AM</span>
                        </div>
                        <p className="text-sm text-gray-300">Approved hiring 3 new developers for Q3</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Meeting Controls */}
            <div className="flex items-center justify-center gap-4 p-4 bg-gray-900 border-t border-gray-700">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={meetingSettings.micEnabled ? "default" : "destructive"}
                    size="sm"
                    onClick={() => setMeetingSettings(prev => ({ ...prev, micEnabled: !prev.micEnabled }))}
                  >
                    {meetingSettings.micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{meetingSettings.micEnabled ? 'Mute' : 'Unmute'}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={meetingSettings.videoEnabled ? "default" : "destructive"}
                    size="sm"
                    onClick={() => setMeetingSettings(prev => ({ ...prev, videoEnabled: !prev.videoEnabled }))}
                  >
                    {meetingSettings.videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{meetingSettings.videoEnabled ? 'Turn off camera' : 'Turn on camera'}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={meetingSettings.screenShareEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMeetingSettings(prev => ({ ...prev, screenShareEnabled: !prev.screenShareEnabled }))}
                  >
                    {meetingSettings.screenShareEnabled ? <ScreenShareOff className="h-4 w-4" /> : <ScreenShare className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{meetingSettings.screenShareEnabled ? 'Stop sharing' : 'Share screen'}</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-8" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Participants</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Chat</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>

              <Button variant="destructive" size="sm" onClick={() => setIsInMeeting(false)}>
                <PhoneOff className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l border-gray-700 bg-gray-900 flex flex-col">
            {/* Participants */}
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold text-white mb-3">Participants ({selectedMeeting.participants.length})</h3>
              <div className="space-y-2">
                {selectedMeeting.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-800">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{participant.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{participant.name}</p>
                      <p className="text-xs text-gray-400">{participant.role}</p>
                    </div>
                    <div className="flex gap-1">
                      {participant.isMuted && <MicOff className="h-3 w-3 text-red-500" />}
                      {!participant.isVideoOn && <VideoOff className="h-3 w-3 text-gray-500" />}
                      {participant.isSpeaking && <Volume2 className="h-3 w-3 text-green-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Features */}
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold text-white mb-3">AI Features</h3>
              <div className="space-y-2">
                {selectedMeeting.aiFeatures.map((feature) => (
                  <div key={feature.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-800">
                    <div className="p-1 rounded bg-primary/20">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{feature.name}</p>
                      <p className="text-xs text-gray-400">{feature.type}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {feature.isEnabled ? 'ON' : 'OFF'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Meeting Info */}
            <div className="p-4">
              <h3 className="font-semibold text-white mb-3">Meeting Info</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{selectedMeeting.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{selectedMeeting.startTime} - {selectedMeeting.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  <span>{selectedMeeting.type} meeting</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="truncate">{selectedMeeting.meetingLink}</span>
                </div>
              </div>
          </div>
        </div>
      </div>
      
      {/* AI Meeting Assistant */}
      <AIMeetingAssistant 
        meetingId={selectedMeeting.id}
        isActive={aiAssistantActive}
        onToggle={() => setAiAssistantActive(!aiAssistantActive)}
      />
    </div>
  );
}

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-background">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Video className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold">AI Meeting Space</h1>
            <p className="text-sm text-muted-foreground">
              Intelligent meetings powered by AI for Tunisian professionals
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button 
            variant={aiAssistantActive ? "default" : "outline"} 
            size="sm"
            onClick={() => setAiAssistantActive(!aiAssistantActive)}
          >
            <Bot className="h-4 w-4 mr-2" />
            AI Assistant
          </Button>
          <Button size="sm" onClick={handleStartMeeting}>
            <Plus className="h-4 w-4 mr-2" />
            Start Meeting
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowCameraTest(true)}>
            <Camera className="h-4 w-4 mr-2" />
            Test Camera
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowCameraDiagnostic(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Diagnose Camera
          </Button>
        </div>
      </motion.div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-80 border-r bg-card/30 backdrop-blur-sm flex flex-col"
        >
          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search meetings..." 
                className="pl-10 bg-background/50 border-border/50 focus:bg-background transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* AI Features Overview */}
          <div className="p-4 border-b">
            <h3 className="font-semibold text-sm mb-3">AI Features</h3>
            <div className="space-y-2">
              {[
                { name: 'Real-time Transcription', icon: Languages, enabled: true },
                { name: 'Multi-language Translation', icon: Globe, enabled: true },
                { name: 'AI Meeting Assistant', icon: Bot, enabled: true },
                { name: 'Sentiment Analysis', icon: Smile, enabled: true },
                { name: 'Action Items Detection', icon: CheckCircle2, enabled: true }
              ].map((feature, index) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-card/50"
                >
                  <feature.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{feature.name}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {feature.enabled ? 'ON' : 'OFF'}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-4">
            <h3 className="font-semibold text-sm mb-3">Today's Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Meetings</span>
                <span className="font-semibold">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Duration</span>
                <span className="font-semibold">2h 30m</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Participants</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">AI Insights</span>
                <span className="font-semibold">47</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b bg-card/50 backdrop-blur-sm">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="upcoming" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Upcoming
                </TabsTrigger>
                <TabsTrigger value="ongoing" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Ongoing
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex items-center gap-2">
                  <Square className="h-4 w-4" />
                  Completed
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Insights
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Upcoming Meetings */}
            <TabsContent value="upcoming" className="flex-1 p-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredMeetings.map((meeting, index) => {
                  const StatusIcon = getStatusIcon(meeting.status);
                  return (
                    <motion.div
                      key={meeting.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <AdvancedCard
                        title={meeting.title}
                        description={meeting.description}
                        variant="glass"
                        size="md"
                        interactive
                        hoverable
                        className="cursor-pointer"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {meeting.status}
                            </Badge>
                            <Badge variant="outline">{meeting.type}</Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{meeting.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{meeting.startTime} - {meeting.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{meeting.participants.length} participants</span>
                            </div>
                            {meeting.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{meeting.location}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              {meeting.aiFeatures.map((feature) => (
                                <Tooltip key={feature.id}>
                                  <TooltipTrigger asChild>
                                    <div className="p-1 rounded bg-primary/10">
                                      <Bot className="h-3 w-3 text-primary" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>{feature.name}</TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm">
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Share2 className="h-3 w-3" />
                              </Button>
                              <Button size="sm" onClick={() => handleJoinMeeting(meeting)}>
                                <Play className="h-3 w-3 mr-1" />
                                Join
                              </Button>
                            </div>
                          </div>
                        </div>
                      </AdvancedCard>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Ongoing Meetings */}
            <TabsContent value="ongoing" className="flex-1 p-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredMeetings.map((meeting, index) => (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AdvancedCard
                      title={meeting.title}
                      description={meeting.description}
                      variant="glass"
                      size="md"
                      interactive
                      hoverable
                      className="cursor-pointer border-green-500/20"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="flex items-center gap-1 text-green-500 border-green-500">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            Live
                          </Badge>
                          <Badge variant="outline">{meeting.type}</Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{meeting.participants.length} participants</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Started {meeting.startTime}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {meeting.aiFeatures.map((feature) => (
                              <Tooltip key={feature.id}>
                                <TooltipTrigger asChild>
                                  <div className="p-1 rounded bg-primary/10">
                                    <Bot className="h-3 w-3 text-primary" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>{feature.name}</TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                          <Button size="sm" onClick={() => handleJoinMeeting(meeting)}>
                            <Play className="h-3 w-3 mr-1" />
                            Join
                          </Button>
                        </div>
                      </div>
                    </AdvancedCard>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Completed Meetings */}
            <TabsContent value="completed" className="flex-1 p-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredMeetings.map((meeting, index) => (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AdvancedCard
                      title={meeting.title}
                      description={meeting.description}
                      variant="glass"
                      size="md"
                      interactive
                      hoverable
                      className="cursor-pointer"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Square className="h-3 w-3" />
                            Completed
                          </Badge>
                          <Badge variant="outline">{meeting.type}</Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{meeting.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{meeting.startTime} - {meeting.endTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{meeting.participants.length} participants</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {meeting.aiFeatures.map((feature) => (
                              <Tooltip key={feature.id}>
                                <TooltipTrigger asChild>
                                  <div className="p-1 rounded bg-primary/10">
                                    <Bot className="h-3 w-3 text-primary" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>{feature.name}</TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <FileText className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <BarChart3 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </AdvancedCard>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* AI Insights */}
            <TabsContent value="insights" className="flex-1 p-6">
              <div className="space-y-6">
                {/* Meeting Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Meeting Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">12</div>
                        <div className="text-sm text-muted-foreground">Total Meetings</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">8h 30m</div>
                        <div className="text-sm text-muted-foreground">Total Duration</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-500">47</div>
                        <div className="text-sm text-muted-foreground">Participants</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-500">156</div>
                        <div className="text-sm text-muted-foreground">AI Insights</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Recent AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">action_item</Badge>
                            <span className="text-xs text-muted-foreground">10:16:45</span>
                            <span className="text-xs text-muted-foreground">89% confidence</span>
                          </div>
                          <p className="text-sm">Karim to prepare budget proposal for team expansion by Friday</p>
                          <p className="text-xs text-muted-foreground mt-1">Detected from: Karim Trabelsi</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">decision</Badge>
                            <span className="text-xs text-muted-foreground">11:00 AM</span>
                            <span className="text-xs text-muted-foreground">94% confidence</span>
                          </div>
                          <p className="text-sm">Approved hiring 3 new developers for Q3</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* AI Meeting Assistant */}
      <AIMeetingAssistant 
        meetingId="main"
        isActive={aiAssistantActive}
        onToggle={() => setAiAssistantActive(!aiAssistantActive)}
      />
      
      {/* Real Meeting Room */}
      {isInMeeting && currentMeeting && (
        <MeetingRoom
          meetingId={currentMeeting.id}
          meetingTitle={currentMeeting.title}
          participants={[
            {
              id: '1',
              name: 'You',
              email: 'you@luca-platform.com',
              isVideoOn: true,
              isAudioOn: true,
              isScreenSharing: false,
              isHost: true
            }
          ]}
          onLeave={handleLeaveMeeting}
          onInvite={() => setShowMeetingInvite(true)}
        />
      )}
      
      {/* Modals */}
      {showCreateMeeting && (
        <CreateMeeting
          onClose={() => setShowCreateMeeting(false)}
          onCreateMeeting={handleCreateMeeting}
        />
      )}
      
      {showMeetingInvite && currentMeeting && (
        <MeetingInvite
          meetingId={currentMeeting.id}
          meetingTitle={currentMeeting.title}
          meetingDate={currentMeeting.date}
          meetingTime={currentMeeting.startTime}
          duration={60}
          onClose={() => setShowMeetingInvite(false)}
          onSendInvites={handleSendInvites}
        />
      )}
      
      {/* Camera Test */}
      {showCameraTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Camera Test</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowCameraTest(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CameraTest />
          </div>
        </div>
      )}
      
      {/* Camera Diagnostic */}
      {showCameraDiagnostic && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Camera Diagnostic Tool</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowCameraDiagnostic(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CameraDiagnostic />
          </div>
        </div>
      )}
    </div>
  );
}