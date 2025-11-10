'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, VideoOff, Camera, Mic, MicOff } from 'lucide-react';

export function CameraTest() {
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [isVideoOn, setIsVideoOn] = React.useState(true);
  const [isAudioOn, setIsAudioOn] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const startCamera = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🎥 Starting camera test (using debug tool strategy)...');
      
      // Use the same simple strategy that worked in debug tool
      let mediaStream: MediaStream | null = null;
      
      // Strategy 1: Simple video only (this worked in debug tool)
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
          
          // Strategy 3: Try different constraints
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
            throw constraintError;
          }
        }
      }
      
      console.log('🎉 Camera access successful!');
      console.log('📹 Video tracks:', mediaStream.getVideoTracks().length);
      console.log('🎤 Audio tracks:', mediaStream.getAudioTracks().length);
      
      setStream(mediaStream);
      setIsLoading(false);
      
    } catch (err) {
      console.error('❌ Camera access failed:', err);
      setIsLoading(false);
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('❌ Camera permission denied.\n\nSince camera works in debug tool, try:\n1. 🔄 Refresh this page (Ctrl+F5)\n2. 🚫 Close other video apps\n3. 🔄 Try incognito mode');
        } else if (err.name === 'NotFoundError') {
          setError('❌ No camera found. Please connect a camera device.');
        } else if (err.name === 'NotReadableError') {
          setError('❌ Camera is being used by another application. Please close Zoom, Teams, or other video apps.');
        } else {
          setError(`❌ Camera error: ${err.message}`);
        }
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Stopped track:', track.kind);
      });
      setStream(null);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
        console.log('📹 Video toggled:', videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
        console.log('🎤 Audio toggled:', audioTrack.enabled);
      }
    }
  };

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Camera Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera Preview */}
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Connecting camera...</p>
                </div>
              </div>
            ) : stream && isVideoOn ? (
              <video
                ref={(video) => {
                  if (video && stream) {
                    video.srcObject = stream;
                    video.onloadedmetadata = () => {
                      console.log('✅ Video loaded successfully');
                    };
                  }
                }}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <VideoOff className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {stream ? 'Camera off' : 'No camera stream'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm text-red-600 whitespace-pre-line">{error}</div>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            {!stream ? (
              <Button onClick={startCamera} disabled={isLoading}>
                <Camera className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
            ) : (
              <>
                <Button onClick={stopCamera} variant="outline">
                  <VideoOff className="h-4 w-4 mr-2" />
                  Stop Camera
                </Button>
                <Button 
                  onClick={toggleVideo} 
                  variant={isVideoOn ? "default" : "destructive"}
                >
                  <Video className="h-4 w-4 mr-2" />
                  {isVideoOn ? 'Video On' : 'Video Off'}
                </Button>
                <Button 
                  onClick={toggleAudio} 
                  variant={isAudioOn ? "default" : "destructive"}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  {isAudioOn ? 'Audio On' : 'Audio Off'}
                </Button>
              </>
            )}
          </div>

          {/* Debug Info */}
          {stream && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Camera Status</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p>✅ Camera connected successfully</p>
                <p>📹 Video tracks: {stream.getVideoTracks().length}</p>
                <p>🎤 Audio tracks: {stream.getAudioTracks().length}</p>
                <p>📊 Video enabled: {isVideoOn ? 'Yes' : 'No'}</p>
                <p>🔊 Audio enabled: {isAudioOn ? 'Yes' : 'No'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
