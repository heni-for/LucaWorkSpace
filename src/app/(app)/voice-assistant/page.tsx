'use client';

import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLucaVoice } from '@/hooks/use-luca-voice';
import { Volume2, VolumeX, Mic, MicOff, Play, Pause, TestTube, Activity, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TTSDiagnostic } from './tts-test';
import { cloudTTS } from '@/lib/cloud-tts';
import { Input } from '@/components/ui/input';

export default function VoiceAssistantPage() {
  const { 
    isListening, 
    status, 
    lastCommand, 
    lastResponse, 
    toggleListening,
    start,
    stop,
    speak 
  } = useLucaVoice();

  const isSpeaking = status === 'speaking';
  const isProcessing = status === 'processing';

  return (
    <div className="p-6 space-y-6">
      <PageHeader 
        title="LUCA Voice Assistant" 
        description="Configure and test voice commands in Tunisian Derja"
      />

      {/* CRITICAL ALERT - Audio Not Working */}
      <Card className="border-4 border-orange-500 bg-orange-50">
        <CardContent className="py-6">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-orange-900">⚠️ CAN'T HEAR LUCA?</h2>
            <p className="text-lg font-semibold text-orange-800">
              The code works perfectly, but you can't hear audio. This is a Windows/Browser audio issue!
            </p>
            
            <div className="bg-white rounded-lg p-6 text-left space-y-4">
              <h3 className="text-xl font-bold text-red-600">🔧 FIX IT NOW (try in order):</h3>
              
              <div className="space-y-3">
                <div className="bg-red-50 border-2 border-red-500 rounded p-4">
                  <h4 className="font-bold text-red-900 mb-2">1️⃣ WINDOWS VOLUME MIXER (Most Common!)</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-red-900">
                    <li><strong>Right-click</strong> the speaker icon (bottom-right corner of Windows)</li>
                    <li>Click <strong>"Open Volume Mixer"</strong></li>
                    <li>Find your browser (Chrome/Edge/Firefox)</li>
                    <li><strong>Make sure the slider is UP</strong> (not at 0 or muted)</li>
                    <li>Also check "System Sounds" is up</li>
                  </ol>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-500 rounded p-4">
                  <h4 className="font-bold text-yellow-900 mb-2">2️⃣ SYSTEM VOLUME</h4>
                  <p className="text-sm text-yellow-900">
                    <strong>Click speaker icon</strong> (bottom-right) → Drag volume to <strong>75%+</strong> → Make sure NOT muted (no ❌ on speaker)
                  </p>
                </div>

                <div className="bg-blue-50 border-2 border-blue-500 rounded p-4">
                  <h4 className="font-bold text-blue-900 mb-2">3️⃣ OUTPUT DEVICE</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-900">
                    <li>Right-click speaker icon → <strong>"Open Sound Settings"</strong></li>
                    <li>Under "Choose your output device" select your <strong>speakers/headphones</strong></li>
                    <li>Click <strong>"Test"</strong> button - hear a sound?</li>
                  </ol>
                </div>

                <div className="bg-green-50 border-2 border-green-500 rounded p-4">
                  <h4 className="font-bold text-green-900 mb-2">4️⃣ TEST OTHER AUDIO</h4>
                  <p className="text-sm text-green-900">
                    <strong>Open YouTube</strong> in another tab → Play a video → Can you hear it?
                    <br />
                    <strong>YES?</strong> Audio works, try tests below
                    <br />
                    <strong>NO?</strong> Fix system audio first!
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-orange-800 font-medium">
              👇 After fixing audio, click the test buttons below to verify
            </p>
          </div>
        </CardContent>
      </Card>

      {/* TEST VOICE Button - HUGE and Prominent */}
      <Card className="border-4 border-green-500 bg-gradient-to-r from-green-100 to-emerald-100 shadow-xl">
        <CardContent className="pt-6 pb-6">
          <Button
            size="lg"
            onClick={async () => {
              console.log('🧪 Testing LUCA voice...');
              try {
                await speak('أهلا، أني لوكا، مساعدك الصوتي');
                console.log('✅ Voice test completed');
              } catch (error) {
                console.error('❌ Voice test failed:', error);
                alert('❌ Voice test failed. Check console for details.');
              }
            }}
            className="w-full h-20 text-2xl font-bold bg-green-600 hover:bg-green-700 shadow-lg"
          >
            <Volume2 className="w-10 h-10 mr-4" />
            🔊 TEST LUCA VOICE
            <span className="ml-4 text-lg">أهلا، أني لوكا، مساعدك الصوتي</span>
          </Button>
          <p className="text-center text-green-800 font-semibold mt-3 text-lg">
            Click to test: "Hello, I am LUCA, your voice assistant" 🇹🇳
          </p>
        </CardContent>
      </Card>

      {/* Main Control Panel */}
      <Card className="border-4 border-purple-500 bg-gradient-to-r from-purple-100 via-blue-100 to-pink-100 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              🎙️ LUCA Voice Assistant
              {isListening && (
                <Badge variant="destructive" className="animate-pulse text-lg">
                  🔴 LIVE
                </Badge>
              )}
            </CardTitle>
            
            {/* MAIN MIC BUTTON */}
            <Button
              onClick={toggleListening}
              variant={isListening ? 'destructive' : 'default'}
              size="lg"
              className={`text-2xl font-bold h-20 px-12 ${
                isListening ? 'animate-pulse bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isListening ? (
                <>
                  <Mic className="h-8 w-8 mr-3" />
                  🔴 LISTENING
                </>
              ) : (
                <>
                  <Mic className="h-8 w-8 mr-3" />
                  🎤 START LUCA
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Display */}
          <div className="flex items-center gap-6">
            <div className={`p-6 rounded-full ${
              isSpeaking ? 'bg-purple-600 animate-pulse' : 
              isProcessing ? 'bg-yellow-500 animate-pulse' :
              isListening ? 'bg-green-600 animate-pulse' : 
              'bg-gray-300'
            }`}>
              {isSpeaking ? (
                <Volume2 className="h-12 w-12 text-white" />
              ) : isProcessing ? (
                <Activity className="h-12 w-12 text-white animate-spin" />
              ) : isListening ? (
                <Mic className="h-12 w-12 text-white" />
              ) : (
                <VolumeX className="h-12 w-12 text-gray-600" />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">
                {isSpeaking ? '🔊 Speaking...' : 
                 isProcessing ? '⚙️ Processing...' :
                 isListening ? '👂 Listening for "LUCA" or "Ahla Beleh"...' : 
                 '💤 Inactive - Click START LUCA'}
              </h3>
              
              {lastCommand && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-2">
                  <p className="text-sm font-medium text-purple-900">
                    📝 You said: <strong>"{lastCommand}"</strong>
                  </p>
                </div>
              )}
              
              {lastResponse && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-900">
                    💬 LUCA responded: <strong>"{lastResponse}"</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="test" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="test">Audio Tests</TabsTrigger>
          <TabsTrigger value="commands">Voice Commands</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Audio Tests Tab */}
        <TabsContent value="test" className="space-y-4">
          {/* Automated Diagnostic */}
          <TTSDiagnostic />
          
          {/* System Audio Tests */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">🔊 System Audio Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-red-800">
                Test if your browser and system can play audio. Try these in order:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                {/* Beep Test */}
                <Card className="border-2 border-blue-500">
                  <CardContent className="pt-6 space-y-3">
                    <h3 className="font-bold text-center">1️⃣ Beep Test</h3>
                    <p className="text-xs text-center text-muted-foreground">
                      Tests basic audio output
                    </p>
                    <Button
                      size="lg"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        try {
                          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                          const oscillator = audioContext.createOscillator();
                          const gainNode = audioContext.createGain();
                          
                          oscillator.connect(gainNode);
                          gainNode.connect(audioContext.destination);
                          
                          oscillator.frequency.value = 440;
                          gainNode.gain.value = 0.3;
                          
                          oscillator.start();
                          oscillator.stop(audioContext.currentTime + 0.5);
                          
                          setTimeout(() => {
                            alert('Did you hear a BEEP?\n\nYES ✅ - Audio works!\nNO ❌ - Check volume/speakers');
                          }, 600);
                        } catch (error) {
                          alert('Beep test failed: ' + error);
                        }
                      }}
                    >
                      🔊 Play Beep
                    </Button>
                  </CardContent>
                </Card>

                {/* Speech Test */}
                <Card className="border-2 border-green-500">
                  <CardContent className="pt-6 space-y-3">
                    <h3 className="font-bold text-center">2️⃣ Speech Test</h3>
                    <p className="text-xs text-center text-muted-foreground">
                      Tests text-to-speech
                    </p>
                    <Button
                      size="lg"
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        console.log('=== SPEECH TEST ===');
                        
                        if (!window.speechSynthesis) {
                          alert('❌ Speech not supported!');
                          return;
                        }
                        
                        let voices = window.speechSynthesis.getVoices();
                        console.log('📊 Voices available:', voices.length);
                        console.log('📋 All voices:', voices.map(v => `${v.name} (${v.lang})`));
                        
                        if (voices.length === 0) {
                          // Force load and retry
                          window.speechSynthesis.onvoiceschanged = () => {
                            voices = window.speechSynthesis.getVoices();
                            console.log('✅ Voices loaded:', voices.length);
                          };
                          window.speechSynthesis.getVoices();
                          alert('⏳ Loading voices... Click again in 2 seconds!');
                          return;
                        }
                        
                        // Cancel any existing
                        window.speechSynthesis.cancel();
                        
                        // Use a SPECIFIC voice (Microsoft voices are most reliable on Windows)
                        const testVoice = voices.find(v => 
                          v.name.includes('Microsoft') || 
                          v.name.includes('David') ||
                          v.name.includes('Zira') ||
                          v.name.includes('Mark')
                        ) || voices[0];
                        
                        console.log('🎙️ Using voice:', testVoice?.name, testVoice?.lang);
                        
                        const msg = new SpeechSynthesisUtterance('Hello. This is a test. Can you hear me? One, two, three.');
                        msg.voice = testVoice;
                        msg.lang = testVoice?.lang || 'en-US';
                        msg.rate = 1.0;
                        msg.pitch = 1.0;
                        msg.volume = 1.0; // Maximum volume
                        
                        msg.onstart = () => {
                          console.log('✅✅✅ SPEECH STARTED - YOU SHOULD HEAR IT NOW!');
                          console.log('🔊 If you hear nothing, check:');
                          console.log('  1. System volume (speaker icon)');
                          console.log('  2. Windows Volume Mixer (browser slider)');
                          console.log('  3. Headphones/speakers connected');
                        };
                        
                        msg.onend = () => {
                          console.log('✅ Speech ended');
                          setTimeout(() => {
                            const heard = confirm('Did you hear "Hello. This is a test..."?\n\nClick OK if you heard it\nClick Cancel if you heard nothing');
                            if (heard) {
                              alert('✅ Great! Speech works!\n\nYour browser CAN speak. LUCA should work too.\n\nNow try the Purple "Test Arabic" button!');
                            } else {
                              alert('❌ You heard nothing?\n\nThis means:\n1. Browser audio is muted in Volume Mixer\n2. Wrong output device selected\n3. Headphones not plugged in\n\nFix: Right-click speaker icon → Open Volume Mixer → Turn up browser volume!');
                            }
                          }, 500);
                        };
                        
                        msg.onerror = (e: any) => {
                          console.error('❌ Speech error:', e);
                          alert('❌ Speech error: ' + (e.error || 'unknown') + '\n\nTry:\n- Refresh page\n- Use Chrome/Edge\n- Check browser permissions');
                        };
                        
                        console.log('🔊 Speaking now...');
                        window.speechSynthesis.speak(msg);
                        
                        setTimeout(() => {
                          console.log('📊 Is actually speaking?', window.speechSynthesis.speaking);
                          if (!window.speechSynthesis.speaking) {
                            console.error('⚠️ Not speaking even though we called speak()!');
                          }
                        }, 200);
                      }}
                    >
                      🗣️ Test Speech
                    </Button>
                  </CardContent>
                </Card>

                {/* Arabic Test */}
                <Card className="border-2 border-purple-500">
                  <CardContent className="pt-6 space-y-3">
                    <h3 className="font-bold text-center">3️⃣ Arabic Test</h3>
                    <p className="text-xs text-center text-muted-foreground">
                      Tests Arabic voice
                    </p>
                    <Button
                      size="lg"
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={async () => {
                        console.log('🧪 Testing Arabic...');
                        await speak('مرحبا! أني LUCA. أني نسمع فيك.');
                      }}
                      disabled={isSpeaking}
                    >
                      🇹🇳 Test Arabic
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Troubleshooting */}
              <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4">
                <h4 className="font-bold text-yellow-900 mb-2">🔧 Troubleshooting</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-900">
                  <li><strong>No beep?</strong> → Check system volume and speakers</li>
                  <li><strong>Beep works but speech doesn't?</strong> → Browser speech issue, try Chrome/Edge</li>
                  <li><strong>Click test buttons multiple times</strong> (first click loads voices)</li>
                  <li><strong>Check Windows Volume Mixer</strong> → Right-click speaker icon</li>
                  <li><strong>Make sure browser tab isn't muted</strong> (look for 🔇 icon on tab)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voice Commands Tab */}
        <TabsContent value="commands" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📋 Available Commands</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Wake Words / كلمات التفعيل</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary">"LUCA"</Badge>
                    <Badge variant="secondary">"Ahla Beleh"</Badge>
                    <Badge variant="secondary">"Ahla LUCA"</Badge>
                    <Badge variant="secondary">"Hey LUCA"</Badge>
                    <Badge variant="secondary">"OK LUCA"</Badge>
                    <Badge variant="secondary">"لوكا"</Badge>
                    <Badge variant="secondary">"يا لوكا"</Badge>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                    <h4 className="font-semibold text-green-900 mb-2">💡 Smart Responses:</h4>
                    <div className="space-y-2 text-green-900">
                      <div>
                        <strong>Say "LUCA"</strong> → LUCA responds: <code className="bg-white px-2 py-1 rounded">"أني نسمع فيك"</code> (I'm listening)
                      </div>
                      <div>
                        <strong>Say "Ahla LUCA" or "Ahla Beleh"</strong> → LUCA responds: <code className="bg-white px-2 py-1 rounded">"أهلا وينك"</code> (Hello, how are you)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Navigation Commands / أوامر التنقل</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="border rounded-lg p-3 bg-muted/30">
                      <div className="font-medium text-sm mb-1">📧 Open Mail</div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>"7elli boîte mails"</div>
                        <div>"warini gmail"</div>
                        <div>"boîte mail"</div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-3 bg-muted/30">
                      <div className="font-medium text-sm mb-1">📅 Open Calendar</div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>"7elli calendrier"</div>
                        <div>"warini agenda"</div>
                        <div>"calendrier"</div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-3 bg-muted/30">
                      <div className="font-medium text-sm mb-1">📚 Open Education</div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>"7elli éducation"</div>
                        <div>"education"</div>
                        <div>"دراسة"</div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-3 bg-muted/30">
                      <div className="font-medium text-sm mb-1">💾 Open Memory</div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>"7elli mémoire"</div>
                        <div>"memory"</div>
                        <div>"ذاكرة"</div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-3 bg-muted/30">
                      <div className="font-medium text-sm mb-1">📊 Open Dashboard</div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>"dashboard"</div>
                        <div>"tableau de bord"</div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-3 bg-muted/30">
                      <div className="font-medium text-sm mb-1">⏰ Tell Time</div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>"قداش الوقت"</div>
                        <div>"chhal el wa9t"</div>
                        <div>"what time"</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">💡 Example Conversations</h3>
                  <div className="space-y-4 text-sm">
                    {/* Example 1 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="font-medium mb-2">Example 1: Greeting</div>
                      <div className="space-y-1">
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">You:</span>
                          <span>"Ahla LUCA"</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-600 font-bold">LUCA:</span>
                          <span>"أهلا وينك" (Hello, how are you)</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Example 2 */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="font-medium mb-2">Example 2: Time Query</div>
                      <div className="space-y-1">
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">You:</span>
                          <span>"LUCA قداش الوقت"</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-600 font-bold">LUCA:</span>
                          <span>"أني نسمع فيك" then "الوقت تو 14:30"</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Example 3 */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="font-medium mb-2">Example 3: Navigation</div>
                      <div className="space-y-1">
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">You:</span>
                          <span>"Ahla Beleh 7elli boîte mails"</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-600 font-bold">LUCA:</span>
                          <span>"أهلا وينك" then "حاضر، نحلّك boîte mails تو" (opens mail)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          {/* Cloud TTS Configuration */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">🌐 Cloud TTS for Tunisian Derja</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <p className="text-sm text-blue-800">
                  <strong>Current Provider:</strong> <Badge variant="outline">{cloudTTS.getCurrentProvider()}</Badge>
                </p>
                <p className="text-sm text-blue-700">
                  Get HIGH QUALITY Tunisian Derja voice with Azure Speech Service (FREE tier: 500,000 characters/month)
                </p>
              </div>

              {/* Azure TTS Setup */}
              <div className="space-y-4 p-4 bg-white rounded-lg border">
                <h3 className="font-semibold text-blue-900">🔵 Azure Speech (Recommended - has Tunisian voice!)</h3>
                <ol className="text-sm space-y-2 text-gray-700 list-decimal ml-5">
                  <li>Go to <a href="https://portal.azure.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Azure Portal</a></li>
                  <li>Create a "Speech Service" resource (FREE tier available)</li>
                  <li>Copy your <strong>API Key</strong> and <strong>Region</strong></li>
                  <li>Paste them below:</li>
                </ol>
                
                <div className="space-y-3 mt-4">
                  <div>
                    <Label htmlFor="azure-key">Azure Speech Key</Label>
                    <Input
                      id="azure-key"
                      type="password"
                      placeholder="Paste your Azure Speech API key"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="azure-region">Azure Region</Label>
                    <Input
                      id="azure-region"
                      type="text"
                      placeholder="e.g., westus, eastus, westeurope"
                      defaultValue="westus"
                      className="mt-1"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      const keyInput = document.getElementById('azure-key') as HTMLInputElement;
                      const regionInput = document.getElementById('azure-region') as HTMLInputElement;
                      const key = keyInput?.value;
                      const region = regionInput?.value || 'westus';
                      
                      if (key && key.length > 10) {
                        cloudTTS.setApiKey('azure', key, region);
                        alert('✅ Azure Speech configured! LUCA will now use Tunisian Derja voice.');
                        window.location.reload();
                      } else {
                        alert('❌ Please enter a valid Azure API key');
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    💾 Save Azure Configuration
                  </Button>
                </div>
              </div>

              {/* ElevenLabs Setup */}
              <div className="space-y-4 p-4 bg-white rounded-lg border">
                <h3 className="font-semibold text-purple-900">🟣 ElevenLabs (Alternative - Best Quality)</h3>
                <p className="text-sm text-gray-700">
                  ElevenLabs has extremely natural voices. Get API key from <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline">elevenlabs.io</a>
                </p>
                
                <div className="space-y-3 mt-4">
                  <div>
                    <Label htmlFor="elevenlabs-key">ElevenLabs API Key</Label>
                    <Input
                      id="elevenlabs-key"
                      type="password"
                      placeholder="Paste your ElevenLabs API key"
                      className="mt-1"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      const keyInput = document.getElementById('elevenlabs-key') as HTMLInputElement;
                      const key = keyInput?.value;
                      
                      if (key && key.length > 10) {
                        cloudTTS.setApiKey('elevenlabs', key);
                        alert('✅ ElevenLabs configured!');
                        window.location.reload();
                      } else {
                        alert('❌ Please enter a valid ElevenLabs API key');
                      }
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    💾 Save ElevenLabs Configuration
                  </Button>
                </div>
              </div>

              {/* Test TTS */}
              <div className="space-y-3 p-4 bg-white rounded-lg border">
                <h3 className="font-semibold">🧪 Test Your TTS</h3>
                <Button
                  onClick={async () => {
                    try {
                      await cloudTTS.speak('أهلا، أني لوكا، مساعدك الصوتي', 'ar-TN');
                    } catch (error) {
                      console.error('Test failed:', error);
                    }
                  }}
                  variant="outline"
                  className="w-full"
                >
                  🔊 Test Tunisian Voice
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>⚙️ Browser Voice Settings (Fallback)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Voice Info */}
              <div>
                <h3 className="font-semibold mb-3">Available Browser Voices</h3>
                <Button
                  variant="outline"
                  onClick={() => {
                    const voices = window.speechSynthesis.getVoices();
                    console.log('📋 All voices:', voices);
                    const arabicVoices = voices.filter(v => v.lang.startsWith('ar'));
                    alert(`Total voices: ${voices.length}\nArabic voices: ${arabicVoices.length}\n\nCheck console for full list!`);
                  }}
                >
                  📊 Check Available Voices
                </Button>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="font-semibold mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      await speak('مرحبا! أني LUCA، مساعدك الذكي.');
                    }}
                    disabled={isSpeaking}
                  >
                    🗣️ Test Greeting
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const now = new Date();
                      await speak(`الوقت تو ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`);
                    }}
                    disabled={isSpeaking}
                  >
                    ⏰ Say Time
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (window.speechSynthesis.speaking) {
                        window.speechSynthesis.cancel();
                      }
                    }}
                  >
                    ⏹️ Stop All Speech
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      console.log('=== LUCA DIAGNOSTIC ===');
                      console.log('Listening:', isListening);
                      console.log('Status:', status);
                      console.log('Last Command:', lastCommand);
                      console.log('Last Response:', lastResponse);
                      console.log('Voices:', window.speechSynthesis.getVoices().length);
                      alert(`LUCA Diagnostic:\n\nListening: ${isListening}\nStatus: ${status}\nVoices: ${window.speechSynthesis.getVoices().length}`);
                    }}
                  >
                    🔍 Run Diagnostic
                  </Button>
                </div>
              </div>

              {/* Console Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">📊 Console Debugging (F12)</h4>
                <p className="text-sm text-blue-800 mb-2">
                  Open browser console (F12) to see detailed logs:
                </p>
                <ul className="list-disc list-inside text-xs text-blue-900 space-y-1">
                  <li><code>🎤 LUCA HEARD: "..."</code> - What LUCA heard</li>
                  <li><code>✅ WAKE WORD DETECTED</code> - Wake word recognized</li>
                  <li><code>🗣️ LUCA is speaking: "..."</code> - What LUCA will say</li>
                  <li><code>🔊 Speech started</code> - Audio playing</li>
                  <li><code>✅ Speech ended</code> - Audio finished</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* How to Use Guide */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle>📖 How to Use LUCA</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-3 text-sm">
            <li>
              <strong>Click "🎤 START LUCA"</strong> button above
              <div className="ml-6 mt-1 text-muted-foreground">
                Allow microphone permission when browser asks
              </div>
            </li>
            <li>
              <strong>Wait for button to turn RED</strong> with "🔴 LISTENING"
              <div className="ml-6 mt-1 text-muted-foreground">
                You'll see a green pulsing microphone icon
              </div>
            </li>
            <li>
              <strong>Say the wake word</strong>: "LUCA" or "Ahla Beleh" or "لوكا"
              <div className="ml-6 mt-1 text-muted-foreground">
                Speak clearly into your microphone
              </div>
            </li>
            <li>
              <strong>LUCA responds</strong>: "أني نسمع فيك" (I'm listening)
              <div className="ml-6 mt-1 text-muted-foreground">
                You should hear this in Arabic voice
              </div>
            </li>
            <li>
              <strong>Give a command</strong>: "7elli boîte mails" or "قداش الوقت"
              <div className="ml-6 mt-1 text-muted-foreground">
                LUCA will understand and execute
              </div>
            </li>
          </ol>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-900 mb-2">
              ✅ If tests pass but you can't hear LUCA:
            </p>
            <ul className="list-disc list-inside text-xs text-green-900 space-y-1">
              <li>Check Windows Volume Mixer (right-click volume icon)</li>
              <li>Make sure Chrome/Edge browser isn't muted in mixer</li>
              <li>Try opening a YouTube video to test if browser audio works</li>
              <li>Check if headphones are selected as output device</li>
              <li>Restart your browser completely</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

