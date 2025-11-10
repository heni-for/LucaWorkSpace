'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock,
  Users,
  Mail,
  Copy,
  Send,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Invitee {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined';
}

interface MeetingInviteProps {
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;
  meetingTime: string;
  duration: number;
  onClose: () => void;
  onSendInvites: (invitees: Invitee[]) => void;
  className?: string;
}

export function MeetingInvite({ 
  meetingId, 
  meetingTitle, 
  meetingDate, 
  meetingTime, 
  duration,
  onClose, 
  onSendInvites,
  className 
}: MeetingInviteProps) {
  const [invitees, setInvitees] = React.useState<Invitee[]>([]);
  const [newInvitee, setNewInvitee] = React.useState({ name: '', email: '' });
  const [meetingLink, setMeetingLink] = React.useState('');

  React.useEffect(() => {
    setMeetingLink(`${window.location.origin}/meetings/${meetingId}`);
  }, [meetingId]);

  // Add invitee
  const addInvitee = () => {
    if (newInvitee.name && newInvitee.email) {
      const invitee: Invitee = {
        id: Date.now().toString(),
        name: newInvitee.name,
        email: newInvitee.email,
        status: 'pending'
      };
      setInvitees([...invitees, invitee]);
      setNewInvitee({ name: '', email: '' });
    }
  };

  // Remove invitee
  const removeInvitee = (id: string) => {
    setInvitees(invitees.filter(invitee => invitee.id !== id));
  };

  // Copy meeting link
  const copyMeetingLink = () => {
    navigator.clipboard.writeText(meetingLink);
  };

  // Send invites
  const handleSendInvites = () => {
    onSendInvites(invitees);
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
        className="bg-background rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Invite Participants</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Meeting Details */}
            <div className="space-y-3">
              <h3 className="font-semibold">Meeting Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Title</Label>
                  <p className="font-medium">{meetingTitle}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Meeting ID</Label>
                  <p className="font-medium">{meetingId}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Date</Label>
                  <p className="font-medium">{meetingDate}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Time</Label>
                  <p className="font-medium">{meetingTime} ({duration} min)</p>
                </div>
              </div>
            </div>

            {/* Meeting Link */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Meeting Link</Label>
              <div className="flex gap-2">
                <Input
                  value={meetingLink}
                  readOnly
                  className="flex-1"
                />
                <Button variant="outline" onClick={copyMeetingLink}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
            </div>

            {/* Add Invitees */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Add Participants</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Name"
                  value={newInvitee.name}
                  onChange={(e) => setNewInvitee({ ...newInvitee, name: e.target.value })}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={newInvitee.email}
                  onChange={(e) => setNewInvitee({ ...newInvitee, email: e.target.value })}
                />
              </div>
              <Button onClick={addInvitee} className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                Add Participant
              </Button>
            </div>

            {/* Invitees List */}
            {invitees.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Participants ({invitees.length})</Label>
                <div className="space-y-2">
                  <AnimatePresence>
                    {invitees.map((invitee) => (
                      <motion.div
                        key={invitee.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">
                              {invitee.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{invitee.name}</p>
                            <p className="text-xs text-muted-foreground">{invitee.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {invitee.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInvitee(invitee.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleSendInvites} 
                className="flex-1"
                disabled={invitees.length === 0}
              >
                <Send className="h-4 w-4 mr-1" />
                Send Invites ({invitees.length})
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
