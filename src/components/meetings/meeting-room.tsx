'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Share2,
  Users,
  Settings,
  Copy,
  Share,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  FileText,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Participant {
  id: string;
  name: string;
  email: string;
  isVideoOn: boolean;
  isAudioOn: boolean;
  isScreenSharing: boolean;
  isHost: boolean;
  avatar?: string;
}

interface MeetingRoomProps {
  meetingId: string;
  meetingTitle: string;
  participants: Participant[];
  onLeave: () => void;
  onInvite: () => void;
  className?: string;
}

export function MeetingRoom({ 
  meetingId, 
  meetingTitle, 
  participants, 
  onLeave, 
  onInvite,
  className 
}: MeetingRoomProps) {
  const [isVideoOn, setIsVideoOn] = React.useState(true);
  const [isAudioOn, setIsAudioOn] = React.useState(true);
  const [isScreenSharing, setIsScreenSharing] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [localStream, setLocalStream] = React.useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = React.useState<Map<string, MediaStream>>(new Map());
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [showReport, setShowReport] = React.useState(false);
  const [meetingReport, setMeetingReport] = React.useState<any>(null);
  const [isGeneratingReport, setIsGeneratingReport] = React.useState(false);

  // Comprehensive system check and auto-initialize camera
  React.useEffect(() => {
    const performSystemCheck = async () => {
      console.log('🔍 Performing comprehensive system check...');
      
      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Your browser does not support camera access. Please use Chrome, Firefox, or Edge.');
        return;
      }

      console.log('✅ Browser supports camera access');
      
      // Check permissions
      try {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        console.log('📋 Camera permission status:', cameraPermission.state);
        
        const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        console.log('🎤 Microphone permission status:', micPermission.state);
      } catch (e) {
        console.log('⚠️ Could not check permissions:', e);
      }
      
      // Enumerate devices
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        const audioDevices = devices.filter(d => d.kind === 'audioinput');
        
        console.log(`📱 Found ${videoDevices.length} video devices`);
        console.log(`🎤 Found ${audioDevices.length} audio devices`);
        
        if (videoDevices.length === 0) {
          setCameraError('❌ NO CAMERA DEVICES FOUND!\n\n🔧 SOLUTIONS:\n1. 🔌 Check camera connection\n2. 🔧 Update camera drivers\n3. 🖥️ Test Windows Camera app\n4. 🔄 Restart computer');
          return;
        }
        
        // Log device details
        videoDevices.forEach((device, index) => {
          console.log(`📹 Video device ${index}:`, device.label || 'Unknown', device.deviceId);
        });
        
      } catch (e) {
        console.log('⚠️ Could not enumerate devices:', e);
      }
      
      console.log('🎥 System check complete. Auto-initializing camera...');
      
      // Auto-initialize camera after a short delay to ensure component is ready
      const timer = setTimeout(() => {
        initializeCamera();
      }, 1000);

      return () => clearTimeout(timer);
    };

    performSystemCheck();
  }, []);

  // Enhanced camera initialization with multiple fallback strategies
  const initializeCamera = async () => {
    try {
      setIsConnecting(true);
      setCameraError(null);
      
      console.log('🎥 Starting ENHANCED camera initialization...');
      
      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser does not support camera access');
      }

      // Enhanced strategy with more fallbacks
      let mediaStream: MediaStream | null = null;
      
      // Strategy 1: Simple video only
      try {
        console.log('🎯 Strategy 1: Simple video only...');
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        console.log('✅ Strategy 1 succeeded with video only');
      } catch (error) {
        console.log('❌ Strategy 1 failed:', error);
        
        // Strategy 2: Try with audio too
        try {
          console.log('🎯 Strategy 2: Video + Audio...');
          mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
          });
          console.log('✅ Strategy 2 succeeded with video + audio');
        } catch (audioError) {
          console.log('❌ Strategy 2 failed:', audioError);
          
          // Strategy 3: Different constraints
          try {
            console.log('🎯 Strategy 3: Different constraints...');
            mediaStream = await navigator.mediaDevices.getUserMedia({
              video: {
                width: { min: 320, ideal: 640 },
                height: { min: 240, ideal: 480 }
              }
            });
            console.log('✅ Strategy 3 succeeded with different constraints');
          } catch (constraintError) {
            console.log('❌ Strategy 3 failed:', constraintError);
            
            // Strategy 4: Minimal constraints
            try {
              console.log('🎯 Strategy 4: Minimal constraints...');
              mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 320, height: 240 }
              });
              console.log('✅ Strategy 4 succeeded with minimal constraints');
            } catch (minimalError) {
              console.log('❌ Strategy 4 failed:', minimalError);
              
              // Strategy 5: Audio only (as last resort)
              try {
                console.log('🎯 Strategy 5: Audio only (last resort)...');
                mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                console.log('✅ Strategy 5 succeeded with audio only');
              } catch (audioOnlyError) {
                console.log('❌ Strategy 5 failed:', audioOnlyError);
                throw audioOnlyError;
              }
            }
          }
        }
      }
      
      if (!mediaStream) {
        throw new Error('Failed to get any media stream');
      }
      
      console.log('🎉 Camera access successful!');
      console.log('📹 Video tracks:', mediaStream.getVideoTracks().length);
      console.log('🎤 Audio tracks:', mediaStream.getAudioTracks().length);
      
      // Log detailed track information
      mediaStream.getVideoTracks().forEach((track, index) => {
        console.log(`📹 Video track ${index}:`, track.getSettings());
      });
      mediaStream.getAudioTracks().forEach((track, index) => {
        console.log(`🎤 Audio track ${index}:`, track.getSettings());
      });
      
      setLocalStream(mediaStream);
      setIsConnecting(false);
      
    } catch (err) {
      console.error('❌ ALL camera strategies failed:', err);
      setIsConnecting(false);
      
      // Enhanced error handling with more specific solutions
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setCameraError('❌ CAMERA PERMISSION DENIED!\n\n🔧 SOLUTIONS:\n1. 🔄 Refresh page (Ctrl+F5)\n2. 🚫 Close ALL video apps (Zoom, Teams, Skype, Discord)\n3. 🔄 Try incognito/private mode\n4. 🔧 Check browser camera permissions\n5. 🔄 Restart browser completely');
        } else if (err.name === 'NotFoundError') {
          setCameraError('❌ NO CAMERA FOUND!\n\n🔧 SOLUTIONS:\n1. 🔌 Check camera connection\n2. 🔧 Update camera drivers\n3. 🖥️ Test Windows Camera app\n4. 🔄 Restart computer\n5. 🔌 Try different USB port');
        } else if (err.name === 'NotReadableError') {
          setCameraError('❌ CAMERA IN USE!\n\n🔧 SOLUTIONS:\n1. 🚫 Close ALL video applications\n2. 🚫 Close other browser tabs\n3. 🔄 Restart browser\n4. 🔄 Restart computer\n5. 🔧 Check Windows camera settings');
        } else if (err.name === 'OverconstrainedError') {
          setCameraError('❌ CAMERA CONSTRAINTS ERROR!\n\n🔧 SOLUTIONS:\n1. 🔄 Refresh page\n2. 🔧 Try different browser\n3. 🔄 Restart browser\n4. 🔧 Check camera settings');
        } else {
          setCameraError(`❌ CAMERA ERROR: ${err.message}\n\n🔧 SOLUTIONS:\n1. 🔄 Refresh page\n2. 🔄 Restart browser\n3. 🔄 Restart computer\n4. 🔧 Check camera hardware`);
        }
      } else {
        setCameraError('❌ UNKNOWN CAMERA ERROR!\n\n🔧 SOLUTIONS:\n1. 🔄 Refresh page\n2. 🔄 Restart browser\n3. 🔄 Restart computer');
      }
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => {
          track.stop();
          console.log('🛑 Stopped track:', track.kind);
        });
      }
    };
  }, [localStream]);

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  // Start screen sharing
  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      // Replace video track with screen share
      if (localStream) {
        const videoTrack = screenStream.getVideoTracks()[0];
        const audioTrack = screenStream.getAudioTracks()[0];
        
        if (videoTrack) {
          localStream.removeTrack(localStream.getVideoTracks()[0]);
          localStream.addTrack(videoTrack);
        }
        
        if (audioTrack) {
          localStream.removeTrack(localStream.getAudioTracks()[0]);
          localStream.addTrack(audioTrack);
        }
      }
      
      setIsScreenSharing(true);
      
      // Stop screen share when user clicks stop
      screenStream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false);
      };
    } catch (error) {
      console.error('Failed to start screen sharing:', error);
    }
  };

  // Copy meeting link
  const copyMeetingLink = () => {
    const link = `${window.location.origin}/meetings/${meetingId}`;
    navigator.clipboard.writeText(link);
  };

  // Force camera access - bypass all checks and try immediate access
  const forceCameraAccess = async () => {
    console.log('🚀 FORCING camera access...');
    setCameraError(null);
    setIsConnecting(true);
    
    try {
      // Try the most basic approach first
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      console.log('🚀 FORCE camera access successful!');
      setLocalStream(stream);
      setIsConnecting(false);
    } catch (error) {
      console.error('🚀 FORCE camera access failed:', error);
      setIsConnecting(false);
      setCameraError('🚀 FORCE ACCESS FAILED!\n\nThis means there is a fundamental issue:\n1. 🔌 Camera hardware problem\n2. 🔧 Driver issues\n3. 🚫 System-level blocking\n4. 🔄 Try restarting computer');
    }
  };

  // Retry camera access using the same working strategy
  const retryCameraAccess = async () => {
    setCameraError(null);
    setIsConnecting(true);
    
    try {
      console.log('🔄 Retrying camera access...');
      
      // Use the same working strategy as camera test
      let mediaStream: MediaStream | null = null;
      
      // Strategy 1: Simple video only
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        console.log('✅ Retry Strategy 1 succeeded');
      } catch (error) {
        // Strategy 2: Try with audio
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
          });
          console.log('✅ Retry Strategy 2 succeeded');
        } catch (audioError) {
          // Strategy 3: Different constraints
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { min: 320, ideal: 640 },
              height: { min: 240, ideal: 480 }
            }
          });
          console.log('✅ Retry Strategy 3 succeeded');
        }
      }
      
      setLocalStream(mediaStream);
      setIsConnecting(false);
      console.log('✅ Camera access retry successful');
      
    } catch (error) {
      console.error('❌ Camera retry failed:', error);
      setIsConnecting(false);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setCameraError('❌ Camera permission denied.\n\nTry:\n1. 🔄 Refresh page (Ctrl+F5)\n2. 🚫 Close other video apps\n3. 🔄 Try incognito mode');
        } else if (error.name === 'NotFoundError') {
          setCameraError('❌ No camera found. Please connect a camera device.');
        } else if (error.name === 'NotReadableError') {
          setCameraError('❌ Camera is being used by another application. Please close Zoom, Teams, or other video apps.');
        } else {
          setCameraError(`❌ Camera error: ${error.message}`);
        }
      }
    }
  };

  // Get participant count
  const participantCount = participants.length;

  return (
    <div className={cn(
      "flex flex-col h-full bg-background",
      isFullscreen && "fixed inset-0 z-50",
      className
    )}>
      {/* Meeting Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">LIVE</span>
          </div>
          <div>
            <h2 className="font-semibold">{meetingTitle}</h2>
            <p className="text-sm text-muted-foreground">
              Meeting ID: {meetingId}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {participantCount} participants
          </Badge>
          
          <Button variant="outline" size="sm" onClick={copyMeetingLink}>
            <Copy className="h-3 w-3 mr-1" />
            Copy Link
          </Button>
          
          <Button variant="outline" size="sm" onClick={onInvite}>
            <Share className="h-3 w-3 mr-1" />
            Invite
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
          {/* Local Video */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-0 h-48">
              {cameraError ? (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <VideoOff className="h-8 w-8 text-red-500" />
                    </div>
                    <p className="text-sm text-red-600 mb-2">Camera Error</p>
                    <div className="text-xs text-muted-foreground mb-3 whitespace-pre-line">
                      {cameraError}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" onClick={initializeCamera} variant="outline">
                        Try Again
                      </Button>
                      <Button size="sm" onClick={retryCameraAccess} variant="outline">
                        Retry Camera
                      </Button>
                      <Button size="sm" onClick={forceCameraAccess} variant="default">
                        Force Camera
                      </Button>
                      <Button size="sm" onClick={() => window.open('/meetings?diagnostic=true', '_blank')} variant="outline">
                        Full Diagnostic
                      </Button>
                      <Button size="sm" onClick={() => window.location.reload()} variant="destructive">
                        Refresh Page
                      </Button>
                    </div>
                  </div>
                </div>
              ) : !localStream ? (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Video className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-sm font-medium mb-2">Start Camera</p>
                    <p className="text-xs text-muted-foreground mb-3">Click to enable camera and microphone</p>
                    <div className="flex gap-2 flex-wrap justify-center">
                      <Button size="sm" onClick={initializeCamera} disabled={isConnecting}>
                        {isConnecting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Video className="h-4 w-4 mr-2" />
                            Start Camera
                          </>
                        )}
                      </Button>
                      <Button size="sm" onClick={forceCameraAccess} variant="outline" disabled={isConnecting}>
                        <Video className="h-4 w-4 mr-2" />
                        Force Camera
                      </Button>
                    </div>
                  </div>
                </div>
              ) : isConnecting ? (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Connecting camera...</p>
                  </div>
                </div>
              ) : localStream && isVideoOn ? (
                <video
                  ref={(video) => {
                    if (video && localStream) {
                      video.srcObject = localStream;
                      video.onloadedmetadata = () => {
                        console.log('✅ Video loaded successfully');
                      };
                      video.onerror = (e) => {
                        console.error('❌ Video error:', e);
                        // If video fails to load, try to reinitialize
                        setTimeout(() => {
                          if (video.srcObject !== localStream) {
                            video.srcObject = localStream;
                          }
                        }, 1000);
                      };
                    }
                  }}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl font-bold text-primary">
                        {participants[0]?.name?.charAt(0) || 'Y'}
                      </span>
                    </div>
                    <p className="text-sm font-medium">You</p>
                    {!isVideoOn && (
                      <p className="text-xs text-muted-foreground mt-1">Camera off</p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Local Video Controls Overlay */}
              <div className="absolute bottom-2 left-2 right-2">
                <div className="flex items-center justify-between bg-black/50 rounded-lg p-2">
                  <span className="text-white text-sm font-medium">You</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={isVideoOn ? "secondary" : "destructive"}
                      onClick={toggleVideo}
                      className="h-6 w-6 p-0"
                    >
                      {isVideoOn ? <Video className="h-3 w-3" /> : <VideoOff className="h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant={isAudioOn ? "secondary" : "destructive"}
                      onClick={toggleAudio}
                      className="h-6 w-6 p-0"
                    >
                      {isAudioOn ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Debug Info Overlay (only show when camera is working) */}
              {localStream && (
                <div className="absolute top-2 left-2 bg-green-500/90 text-white text-xs px-2 py-1 rounded">
                  ✅ Camera: {localStream.getVideoTracks().length} video, {localStream.getAudioTracks().length} audio
                </div>
              )}
            </CardContent>
          </Card>

          {/* Remote Participants */}
          <AnimatePresence>
            {participants.slice(1).map((participant, index) => (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="relative overflow-hidden">
                  <CardContent className="p-0 h-48">
                    {participant.isVideoOn ? (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-2xl font-bold text-primary">
                              {participant.name.charAt(0)}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{participant.name}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-2xl font-bold text-primary">
                              {participant.name.charAt(0)}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{participant.name}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Participant Status Overlay */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex items-center justify-between bg-black/50 rounded-lg p-2">
                        <span className="text-white text-sm font-medium">{participant.name}</span>
                        <div className="flex gap-1">
                          {!participant.isVideoOn && (
                            <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                              <VideoOff className="h-3 w-3 text-white" />
                            </div>
                          )}
                          {!participant.isAudioOn && (
                            <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                              <MicOff className="h-3 w-3 text-white" />
                            </div>
                          )}
                          {participant.isScreenSharing && (
                            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                              <Share2 className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Join Meeting Card */}
          {participantCount < 8 && (
            <Card className="border-dashed border-2 border-muted-foreground/25">
              <CardContent className="p-0 h-48 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Waiting for participants</p>
                  <Button size="sm" onClick={onInvite}>
                    Invite People
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Meeting Controls */}
      <div className="flex items-center justify-center gap-4 p-4 border-t bg-card/50">
        <Button
          variant={isAudioOn ? "default" : "destructive"}
          size="lg"
          onClick={toggleAudio}
          className="rounded-full w-12 h-12"
        >
          {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
        
        <Button
          variant={isVideoOn ? "default" : "destructive"}
          size="lg"
          onClick={toggleVideo}
          className="rounded-full w-12 h-12"
        >
          {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>
        
        <Button
          variant={isScreenSharing ? "default" : "outline"}
          size="lg"
          onClick={startScreenShare}
          className="rounded-full w-12 h-12"
        >
          <Share2 className="h-5 w-5" />
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-12 h-12"
        >
          <Settings className="h-5 w-5" />
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          onClick={() => setShowReport(true)}
          className="rounded-full w-12 h-12"
          title="Meeting Report"
        >
          <FileText className="h-5 w-5" />
        </Button>

        <Button
          variant="destructive"
          size="lg"
          onClick={onLeave}
          className="rounded-full w-12 h-12"
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>

      {/* Meeting Report Modal */}
      {showReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-background">
              <h2 className="text-2xl font-bold">Meeting Report - {meetingTitle}</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowReport(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {isGeneratingReport ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg font-medium">تحضير الرابورت...</p>
                    <p className="text-sm text-muted-foreground">اجاري تحليل اللقاء...</p>
                  </div>
                </div>
              ) : meetingReport ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div>
                    <h3 className="text-xl font-bold mb-3">📝 ملخص اللقاء</h3>
                    <p className="text-muted-foreground">{meetingReport.summary}</p>
                  </div>

                  {/* Key Points */}
                  {meetingReport.keyPoints && meetingReport.keyPoints.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-3">🎯 النقاط الرئيسية</h3>
                      <ul className="list-disc list-inside space-y-2">
                        {meetingReport.keyPoints.map((point: string, index: number) => (
                          <li key={index} className="text-muted-foreground">{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Decisions */}
                  {meetingReport.decisions && meetingReport.decisions.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-3">✅ القرارات</h3>
                      <ul className="list-disc list-inside space-y-2">
                        {meetingReport.decisions.map((decision: string, index: number) => (
                          <li key={index} className="text-muted-foreground">{decision}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Items */}
                  {meetingReport.actionItems && meetingReport.actionItems.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-3">📋 Action Items</h3>
                      <ul className="list-disc list-inside space-y-2">
                        {meetingReport.actionItems.map((item: string, index: number) => (
                          <li key={index} className="text-muted-foreground">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Next Steps */}
                  {meetingReport.nextSteps && meetingReport.nextSteps.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-3">🔄 Next Steps</h3>
                      <ul className="list-disc list-inside space-y-2">
                        {meetingReport.nextSteps.map((step: string, index: number) => (
                          <li key={index} className="text-muted-foreground">{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Advice */}
                  {meetingReport.advice && meetingReport.advice.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-3">💡 نصايح ومشورة</h3>
                      <ul className="list-disc list-inside space-y-2">
                        {meetingReport.advice.map((advice: string, index: number) => (
                          <li key={index} className="text-muted-foreground">{advice}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Download Button */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={() => setShowReport(false)}>
                      Close
                    </Button>
                    <Button variant="outline" onClick={() => {
                      const reportText = `
                        Meeting Report: ${meetingTitle}
                        
                        Summary:
                        ${meetingReport.summary}
                        
                        Key Points:
                        ${meetingReport.keyPoints?.join('\n') || 'None'}
                        
                        Decisions:
                        ${meetingReport.decisions?.join('\n') || 'None'}
                        
                        Action Items:
                        ${meetingReport.actionItems?.join('\n') || 'None'}
                      `;
                      
                      const blob = new Blob([reportText], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `meeting-report-${meetingTitle}-${Date.now()}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}>
                      Download Report
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-12">
                  <p className="text-lg font-medium mb-4">Generate Meeting Report</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Get a comprehensive Derja report with key points, decisions, and action items
                  </p>
                  <Button onClick={async () => {
                    setIsGeneratingReport(true);
                    // TODO: Implement actual report generation
                    // For now, show mock data
                    setTimeout(() => {
                      setMeetingReport({
                        summary: 'لقاء ناقش فيه الفريق التطورات الجديدة والفترات القادمة',
                        keyPoints: [
                          'ناقشنا الميزانية الجديدة',
                          'قرار توسيع الفريق',
                          'تحديد المآدلاين الجاية'
                        ],
                        decisions: [
                          'اعتماد الميزانية الجديدة',
                          'توظيف 3 مطورين جدد'
                        ],
                        actionItems: [
                          'Karim: إعداد مقترح الميزانية قبل الجمعة',
                          'Amira: تواصل مع مرشحين جدد',
                          'Team: تحضير الوثائق للاجتماع القادم'
                        ],
                        nextSteps: [
                          'اجتماع متابعة الأسبوع الجاي',
                          'تقديم تقارير متقدمة'
                        ],
                        advice: [
                          'نصحتكم تعملوا متابعة أسبوعية للأداء',
                          'محاولة تنظيم الوضوح أكثر في الاجتماعات القادمة',
                          'التركيز على الأولويات الضرورية'
                        ]
                      });
                      setIsGeneratingReport(false);
                    }, 2000);
                  }}>
                    Generate Report
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
