'use client';

import * as React from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  Mic, 
  MapPin, 
  Globe, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Share2, 
  Send, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Settings, 
  Bell, 
  Mail, 
  Phone, 
  MessageSquare, 
  FileText, 
  Download, 
  Upload, 
  Star, 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  Smile, 
  Frown, 
  Bot, 
  Sparkles, 
  Zap, 
  Shield, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  MoreHorizontal, 
  MoreVertical, 
  Grid3X3, 
  List, 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Cpu, 
  Network, 
  Wifi, 
  Battery, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Headphones, 
  Camera, 
  Image, 
  File, 
  Folder, 
  Archive, 
  Trash2 as Trash2Icon, 
  Edit as EditIcon, 
  Copy as CopyIcon, 
  Share2 as Share2Icon, 
  Send as SendIcon, 
  Check as CheckIcon, 
  X as XIcon, 
  ChevronDown as ChevronDownIcon, 
  ChevronUp as ChevronUpIcon, 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon, 
  Search as SearchIcon, 
  Filter as FilterIcon, 
  Settings as SettingsIcon, 
  Bell as BellIcon, 
  Mail as MailIcon, 
  Phone as PhoneIcon, 
  MessageSquare as MessageSquareIcon, 
  FileText as FileTextIcon, 
  Download as DownloadIcon, 
  Upload as UploadIcon, 
  Star as StarIcon, 
  Heart as HeartIcon, 
  ThumbsUp as ThumbsUpIcon, 
  ThumbsDown as ThumbsDownIcon, 
  Smile as SmileIcon, 
  Frown as FrownIcon, 
  Bot as BotIcon, 
  Sparkles as SparklesIcon, 
  Zap as ZapIcon, 
  Shield as ShieldIcon, 
  Lock as LockIcon, 
  Unlock as UnlockIcon, 
  Eye as EyeIcon, 
  EyeOff as EyeOffIcon, 
  MoreHorizontal as MoreHorizontalIcon, 
  MoreVertical as MoreVerticalIcon, 
  Grid3X3 as Grid3X3Icon, 
  List as ListIcon, 
  BarChart3 as BarChart3Icon, 
  TrendingUp as TrendingUpIcon, 
  Activity as ActivityIcon, 
  Cpu as CpuIcon, 
  Network as NetworkIcon, 
  Wifi as WifiIcon, 
  Battery as BatteryIcon, 
  Monitor as MonitorIcon, 
  Smartphone as SmartphoneIcon, 
  Tablet as TabletIcon, 
  Headphones as HeadphonesIcon, 
  Camera as CameraIcon, 
  Image as ImageIcon, 
  File as FileIcon, 
  Folder as FolderIcon, 
  Archive as ArchiveIcon,
  Repeat
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

interface ScheduledMeeting {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: string;
  participants: string[];
  type: 'video' | 'audio' | 'hybrid';
  location?: string;
  meetingLink: string;
  isRecurring: boolean;
  recurrence?: 'daily' | 'weekly' | 'monthly';
  aiFeatures: string[];
  status: 'scheduled' | 'confirmed' | 'cancelled';
}

const mockScheduledMeetings: ScheduledMeeting[] = [
  {
    id: '1',
    title: 'Weekly Team Sync',
    description: 'Regular team synchronization meeting',
    startTime: '09:00',
    endTime: '10:00',
    date: '2024-01-15',
    participants: ['amira@luca-platform.com', 'karim@luca-platform.com', 'selma@luca-platform.com'],
    type: 'video',
    meetingLink: 'https://meet.luca-platform.com/weekly-sync',
    isRecurring: true,
    recurrence: 'weekly',
    aiFeatures: ['transcription', 'translation', 'assistant'],
    status: 'confirmed'
  },
  {
    id: '2',
    title: 'Client Presentation',
    description: 'Presenting new features to key client',
    startTime: '14:00',
    endTime: '15:00',
    date: '2024-01-16',
    participants: ['yassine@innovateTN.com'],
    type: 'video',
    meetingLink: 'https://meet.luca-platform.com/client-presentation',
    isRecurring: false,
    aiFeatures: ['transcription', 'assistant'],
    status: 'scheduled'
  }
];

export function MeetingScheduler() {
  const [activeTab, setActiveTab] = React.useState('schedule');
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [meetings, setMeetings] = React.useState<ScheduledMeeting[]>(mockScheduledMeetings);
  const [isCreating, setIsCreating] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredMeetings = React.useMemo(() => {
    if (!searchQuery) return meetings;
    return meetings.filter(meeting => 
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.participants.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [meetings, searchQuery]);

  const handleCreateMeeting = () => {
    setIsCreating(true);
  };

  const handleDeleteMeeting = (id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
  };

  const getStatusColor = (status: ScheduledMeeting['status']) => {
    switch (status) {
      case 'scheduled': return 'text-blue-500';
      case 'confirmed': return 'text-green-500';
      case 'cancelled': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-headline text-xl font-bold">Meeting Scheduler</h2>
            <p className="text-sm text-muted-foreground">Schedule and manage AI-powered meetings</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm" onClick={handleCreateMeeting}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Meeting
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 border-r bg-card/30 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search meetings..." 
                className="pl-10 bg-background/50 border-border/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Calendar */}
          <div className="p-4 border-b">
            <h3 className="font-semibold text-sm mb-3">Calendar</h3>
            <div className="space-y-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">15</div>
                <div className="text-sm text-muted-foreground">January 2024</div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                  <div key={day} className="text-center text-muted-foreground p-1">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 31 }, (_, i) => (
                  <div 
                    key={i + 1} 
                    className={cn(
                      "text-center p-1 rounded cursor-pointer hover:bg-primary/10",
                      i + 1 === 15 && "bg-primary text-primary-foreground"
                    )}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-4">
            <h3 className="font-semibold text-sm mb-3">Today's Schedule</h3>
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
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b bg-card/50">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="schedule" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center gap-2">
                  <FileTextIcon className="h-4 w-4" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <SettingsIcon className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="flex-1 p-6">
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
                          <Badge variant="outline" className={getStatusColor(meeting.status)}>
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
                          {meeting.isRecurring && (
                            <div className="flex items-center gap-2">
                              <Repeat className="h-4 w-4 text-muted-foreground" />
                              <span>{meeting.recurrence}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {meeting.aiFeatures.map((feature) => (
                              <Tooltip key={feature}>
                                <TooltipTrigger asChild>
                                  <div className="p-1 rounded bg-primary/10">
                                    <BotIcon className="h-3 w-3 text-primary" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>{feature}</TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">
                              <EditIcon className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <CopyIcon className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Share2Icon className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteMeeting(meeting.id)}
                            >
                              <Trash2Icon className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </AdvancedCard>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="flex-1 p-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    name: 'Team Standup',
                    description: 'Daily team synchronization',
                    duration: '15 min',
                    participants: 'Team members',
                    aiFeatures: ['transcription', 'action_items']
                  },
                  {
                    name: 'Client Meeting',
                    description: 'Client presentation and discussion',
                    duration: '60 min',
                    participants: 'Client + Team',
                    aiFeatures: ['transcription', 'translation', 'assistant']
                  },
                  {
                    name: 'Brainstorming Session',
                    description: 'Creative ideation meeting',
                    duration: '90 min',
                    participants: 'Creative team',
                    aiFeatures: ['transcription', 'topic_extraction', 'assistant']
                  }
                ].map((template, index) => (
                  <motion.div
                    key={template.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AdvancedCard
                      title={template.name}
                      description={template.description}
                      variant="glass"
                      size="md"
                      interactive
                      hoverable
                      className="cursor-pointer"
                    >
                      <div className="space-y-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{template.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{template.participants}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {template.aiFeatures.map((feature) => (
                              <Tooltip key={feature}>
                                <TooltipTrigger asChild>
                                  <div className="p-1 rounded bg-primary/10">
                                    <BotIcon className="h-3 w-3 text-primary" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>{feature}</TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                          <Button size="sm">
                            <Plus className="h-3 w-3 mr-1" />
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </AdvancedCard>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="flex-1 p-6">
              <div className="max-w-2xl space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Meeting Defaults</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Default meeting duration</span>
                      <Badge variant="outline">60 minutes</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Default meeting type</span>
                      <Badge variant="outline">Video</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto-enable AI features</span>
                      <Button variant="outline" size="sm">ON</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>AI Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Real-time transcription</span>
                      <Button variant="outline" size="sm">ON</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Multi-language translation</span>
                      <Button variant="outline" size="sm">ON</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">AI meeting assistant</span>
                      <Button variant="outline" size="sm">ON</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Action item detection</span>
                      <Button variant="outline" size="sm">ON</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default MeetingScheduler;
