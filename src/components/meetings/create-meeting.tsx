'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar,
  Clock,
  Users,
  Video,
  X,
  Plus,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateMeetingProps {
  onClose: () => void;
  onCreateMeeting: (meetingData: {
    title: string;
    description: string;
    date: string;
    time: string;
    duration: number;
    isInstant: boolean;
  }) => void;
  className?: string;
}

export function CreateMeeting({ onClose, onCreateMeeting, className }: CreateMeetingProps) {
  const [meetingData, setMeetingData] = React.useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    duration: 60,
    isInstant: false
  });

  const [isInstantMeeting, setIsInstantMeeting] = React.useState(false);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateMeeting({
      ...meetingData,
      isInstant: isInstantMeeting
    });
    onClose();
  };

  // Start instant meeting
  const startInstantMeeting = () => {
    onCreateMeeting({
      title: 'Instant Meeting',
      description: 'Quick meeting session',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      duration: 60,
      isInstant: true
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn("fixed inset-0 bg-black/50 flex items-center justify-center z-50", className)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-background rounded-lg shadow-lg w-full max-w-lg mx-4"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Create Meeting</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Instant Meeting Option */}
            <div className="text-center space-y-3">
              <Button
                onClick={startInstantMeeting}
                className="w-full h-16 text-lg font-semibold"
                size="lg"
              >
                <Video className="h-5 w-5 mr-2" />
                Start Instant Meeting
              </Button>
              <p className="text-sm text-muted-foreground">
                Start a meeting immediately with your current team
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Scheduled Meeting Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Meeting Title</Label>
                <Input
                  id="title"
                  placeholder="Enter meeting title"
                  value={meetingData.title}
                  onChange={(e) => setMeetingData({ ...meetingData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Enter meeting description"
                  value={meetingData.description}
                  onChange={(e) => setMeetingData({ ...meetingData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={meetingData.date}
                    onChange={(e) => setMeetingData({ ...meetingData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={meetingData.time}
                    onChange={(e) => setMeetingData({ ...meetingData, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <select
                  id="duration"
                  value={meetingData.duration}
                  onChange={(e) => setMeetingData({ ...meetingData, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                </select>
              </div>

              {/* Meeting Settings */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Meeting Settings</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Enable AI Assistant</span>
                    <Button variant="outline" size="sm">ON</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-record</span>
                    <Button variant="outline" size="sm">OFF</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Waiting room</span>
                    <Button variant="outline" size="sm">ON</Button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  Schedule Meeting
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
