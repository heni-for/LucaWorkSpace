'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Settings,
  Monitor,
  HardDrive,
  Wifi,
  Shield
} from 'lucide-react';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: string;
}

export function CameraDiagnostic() {
  const [results, setResults] = React.useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);
  const [systemInfo, setSystemInfo] = React.useState<any>(null);

  const addResult = (test: string, status: DiagnosticResult['status'], message: string, details?: string) => {
    setResults(prev => [...prev, { test, status, message, details }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const gatherSystemInfo = () => {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      protocol: window.location.protocol,
      host: window.location.host,
      timestamp: new Date().toISOString(),
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      window: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight
      }
    };
    setSystemInfo(info);
    return info;
  };

  const runComprehensiveDiagnostic = async () => {
    setIsRunning(true);
    clearResults();
    
    console.log('🔍 Starting comprehensive camera diagnostic...');
    
    // Gather system information
    const sysInfo = gatherSystemInfo();
    addResult('System Info', 'info', 'System information gathered', JSON.stringify(sysInfo, null, 2));

    // Test 1: Browser Support
    try {
      if (!navigator.mediaDevices) {
        addResult('Browser Support', 'error', 'navigator.mediaDevices not available');
      } else if (!navigator.mediaDevices.getUserMedia) {
        addResult('Browser Support', 'error', 'getUserMedia not available');
      } else {
        addResult('Browser Support', 'success', 'Browser supports camera access');
      }
    } catch (e) {
      addResult('Browser Support', 'error', `Browser support check failed: ${e}`);
    }

    // Test 2: HTTPS Check
    try {
      if (window.location.protocol === 'https:') {
        addResult('HTTPS Check', 'success', 'Running on HTTPS - camera access allowed');
      } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        addResult('HTTPS Check', 'warning', 'Running on localhost - camera access should work');
      } else {
        addResult('HTTPS Check', 'error', 'Not running on HTTPS - camera access blocked by browser');
      }
    } catch (e) {
      addResult('HTTPS Check', 'error', `HTTPS check failed: ${e}`);
    }

    // Test 3: Permission API
    try {
      const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      addResult('Camera Permission', cameraPermission.state === 'granted' ? 'success' : 'warning', 
        `Camera permission: ${cameraPermission.state}`);
      
      const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      addResult('Microphone Permission', micPermission.state === 'granted' ? 'success' : 'warning', 
        `Microphone permission: ${micPermission.state}`);
    } catch (e) {
      addResult('Permission API', 'warning', `Permission API not available: ${e}`);
    }

    // Test 4: Device Enumeration
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      const audioDevices = devices.filter(d => d.kind === 'audioinput');
      
      addResult('Device Enumeration', 'info', 
        `Found ${videoDevices.length} video devices, ${audioDevices.length} audio devices`);
      
      if (videoDevices.length === 0) {
        addResult('Video Devices', 'error', 'No video devices found');
      } else {
        addResult('Video Devices', 'success', `${videoDevices.length} video device(s) available`);
        videoDevices.forEach((device, index) => {
          addResult(`Video Device ${index + 1}`, 'info', 
            device.label || 'Unknown Camera', device.deviceId);
        });
      }
      
      if (audioDevices.length === 0) {
        addResult('Audio Devices', 'warning', 'No audio devices found');
      } else {
        addResult('Audio Devices', 'success', `${audioDevices.length} audio device(s) available`);
      }
    } catch (e) {
      addResult('Device Enumeration', 'error', `Device enumeration failed: ${e}`);
    }

    // Test 5: Basic Camera Access
    try {
      addResult('Basic Camera Test', 'info', 'Attempting basic camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      addResult('Basic Camera Test', 'success', 'Basic camera access successful!');
      addResult('Stream Info', 'info', 
        `Video tracks: ${stream.getVideoTracks().length}, Audio tracks: ${stream.getAudioTracks().length}`);
      
      // Log track details
      stream.getVideoTracks().forEach((track, index) => {
        addResult(`Video Track ${index + 1}`, 'info', 
          `Settings: ${JSON.stringify(track.getSettings())}`);
      });
      
      // Clean up
      stream.getTracks().forEach(track => track.stop());
    } catch (e: any) {
      addResult('Basic Camera Test', 'error', `Basic camera access failed: ${e.name} - ${e.message}`);
      
      // Specific error analysis
      if (e.name === 'NotAllowedError') {
        addResult('Permission Analysis', 'error', 
          'Camera permission denied. Check browser settings and close other video apps.');
      } else if (e.name === 'NotFoundError') {
        addResult('Hardware Analysis', 'error', 
          'No camera found. Check camera connection and drivers.');
      } else if (e.name === 'NotReadableError') {
        addResult('Hardware Analysis', 'error', 
          'Camera is being used by another application. Close all video apps.');
      } else if (e.name === 'OverconstrainedError') {
        addResult('Configuration Analysis', 'error', 
          'Camera constraints cannot be satisfied. Try different browser or settings.');
      }
    }

    // Test 6: Audio Access
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      addResult('Audio Test', 'success', 'Audio access successful!');
      audioStream.getTracks().forEach(track => track.stop());
    } catch (e: any) {
      addResult('Audio Test', 'warning', `Audio access failed: ${e.name} - ${e.message}`);
    }

    // Test 7: Different Constraints
    const constraintTests = [
      { name: 'Minimal Video', constraints: { video: { width: 320, height: 240 } } },
      { name: 'Low Resolution', constraints: { video: { width: 640, height: 480 } } },
      { name: 'High Resolution', constraints: { video: { width: 1280, height: 720 } } },
      { name: 'Video + Audio', constraints: { video: true, audio: true } }
    ];

    for (const test of constraintTests) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(test.constraints);
        addResult(`Constraint Test: ${test.name}`, 'success', 'Success');
        stream.getTracks().forEach(track => track.stop());
      } catch (e: any) {
        addResult(`Constraint Test: ${test.name}`, 'error', `${e.name} - ${e.message}`);
      }
    }

    setIsRunning(false);
    console.log('🔍 Diagnostic complete!');
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Settings className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Camera Diagnostic Tool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runComprehensiveDiagnostic} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Running Diagnostic...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4" />
                  Run Full Diagnostic
                </>
              )}
            </Button>
            <Button onClick={clearResults} variant="outline">
              Clear Results
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Diagnostic Results</h3>
              {results.map((result, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.test}</span>
                    <Badge variant="outline" className="text-xs">
                      {result.status}
                    </Badge>
                  </div>
                  <p className="text-sm">{result.message}</p>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer text-muted-foreground">
                        Show Details
                      </summary>
                      <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                        {result.details}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}

          {systemInfo && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">System Information</h3>
              <pre className="text-xs p-3 bg-gray-100 rounded overflow-x-auto">
                {JSON.stringify(systemInfo, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">🔧 Troubleshooting Steps</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>1. Check Windows Camera Settings:</strong></p>
              <p>• Go to Settings → Privacy → Camera</p>
              <p>• Ensure "Allow apps to access your camera" is ON</p>
              <p>• Ensure "Allow desktop apps to access your camera" is ON</p>
              
              <p><strong>2. Check Browser Permissions:</strong></p>
              <p>• Click the camera icon in the address bar</p>
              <p>• Select "Allow" for camera and microphone</p>
              <p>• Try incognito/private mode</p>
              
              <p><strong>3. Close Other Applications:</strong></p>
              <p>• Close Zoom, Teams, Skype, Discord</p>
              <p>• Close other browser tabs</p>
              <p>• Restart browser completely</p>
              
              <p><strong>4. Hardware Check:</strong></p>
              <p>• Test Windows Camera app</p>
              <p>• Check camera connection</p>
              <p>• Update camera drivers</p>
              <p>• Try different USB port</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
