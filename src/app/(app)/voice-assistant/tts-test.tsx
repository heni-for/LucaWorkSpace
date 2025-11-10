'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function TTSDiagnostic() {
  const [step, setStep] = React.useState(0);
  const [results, setResults] = React.useState<string[]>([]);

  const addResult = (result: string) => {
    setResults(prev => [...prev, result]);
  };

  const runFullTest = async () => {
    setResults([]);
    setStep(1);
    
    console.log('=== FULL TTS DIAGNOSTIC ===');
    
    // Step 1: Check if speechSynthesis exists
    if (!window.speechSynthesis) {
      addResult('❌ FAIL: Browser does not support Text-to-Speech');
      setStep(0);
      alert('❌ Your browser does not support Text-to-Speech!\n\nPlease use Chrome or Edge.');
      return;
    }
    addResult('✅ PASS: Browser supports Text-to-Speech');
    
    // Step 2: Load voices
    setStep(2);
    await new Promise(r => setTimeout(r, 500));
    
    let voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      // Wait for voices
      await new Promise<void>((resolve) => {
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          resolve();
        };
        window.speechSynthesis.getVoices();
        setTimeout(resolve, 2000); // Max wait 2s
      });
    }
    
    if (voices.length === 0) {
      addResult('❌ FAIL: No voices available');
      setStep(0);
      alert('❌ No voices found! Refresh the page and try again.');
      return;
    }
    addResult(`✅ PASS: ${voices.length} voices available`);
    console.log('Voices:', voices.map(v => v.name));
    
    // Step 3: Test simple English speech
    setStep(3);
    await new Promise(r => setTimeout(r, 500));
    
    const heard = await new Promise<boolean>((resolve) => {
      window.speechSynthesis.cancel();
      
      const msg = new SpeechSynthesisUtterance('Testing. Can you hear me? Yes or no.');
      const englishVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
      
      msg.voice = englishVoice;
      msg.lang = 'en-US';
      msg.volume = 1.0;
      msg.rate = 1.0;
      
      let started = false;
      
      msg.onstart = () => {
        started = true;
        console.log('✅ Speech started');
      };
      
      msg.onend = () => {
        console.log('✅ Speech ended');
        setTimeout(() => {
          const response = confirm('Did you hear "Testing. Can you hear me?"?\n\nOK = Yes, I heard it\nCancel = No, heard nothing');
          resolve(response);
        }, 300);
      };
      
      msg.onerror = () => {
        if (!started) {
          resolve(false);
        }
      };
      
      window.speechSynthesis.speak(msg);
    });
    
    if (!heard) {
      addResult('❌ FAIL: You cannot hear Text-to-Speech');
      setStep(0);
      alert('❌ Text-to-Speech plays but you can\'t hear it!\n\nFIX:\n1. Right-click speaker icon (bottom-right)\n2. Open Volume Mixer\n3. Turn UP your browser volume slider\n4. Try again!');
      return;
    }
    addResult('✅ PASS: You can hear Text-to-Speech!');
    
    // Step 4: Test Arabic
    setStep(4);
    await new Promise(r => setTimeout(r, 500));
    
    window.speechSynthesis.cancel();
    const arabicMsg = new SpeechSynthesisUtterance('مرحبا. أني LUCA. أني نسمع فيك.');
    const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
    
    if (arabicVoice) {
      arabicMsg.voice = arabicVoice;
      arabicMsg.lang = arabicVoice.lang;
      addResult(`✅ PASS: Arabic voice found (${arabicVoice.name})`);
    } else {
      arabicMsg.lang = 'ar';
      addResult('⚠️ WARN: No Arabic voice, using default');
    }
    
    arabicMsg.volume = 1.0;
    arabicMsg.rate = 0.9;
    
    const heardArabic = await new Promise<boolean>((resolve) => {
      arabicMsg.onend = () => {
        setTimeout(() => {
          const response = confirm('Did you hear Arabic speech?\n\nOK = Yes\nCancel = No');
          resolve(response);
        }, 300);
      };
      
      window.speechSynthesis.speak(arabicMsg);
    });
    
    if (heardArabic) {
      addResult('✅ SUCCESS: Arabic Text-to-Speech WORKS!');
      setStep(0);
      alert('🎉 SUCCESS!\n\nYour browser CAN speak Arabic!\n\nLUCA should work now. Try saying "LUCA" or "Ahla Beleh"!');
    } else {
      addResult('❌ FAIL: Cannot hear Arabic speech');
      setStep(0);
      alert('⚠️ English TTS works but not Arabic.\n\nThis is OK - LUCA will use English voice to speak Arabic text.\n\nTry using LUCA anyway!');
    }
  };

  return (
    <Card className="border-purple-500 bg-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Automated TTS Diagnostic
          {step > 0 && <Badge variant="default">Running...</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This will automatically test your Text-to-Speech system step-by-step
        </p>
        
        <Button
          onClick={runFullTest}
          disabled={step > 0}
          size="lg"
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {step > 0 ? `⏳ Running Step ${step}/4...` : '🚀 Run Full Diagnostic'}
        </Button>
        
        {results.length > 0 && (
          <div className="bg-white rounded-lg p-4 border space-y-2">
            <h4 className="font-semibold mb-2">Results:</h4>
            {results.map((result, i) => (
              <div key={i} className={`text-sm ${
                result.includes('✅') ? 'text-green-700' :
                result.includes('❌') ? 'text-red-700' :
                'text-yellow-700'
              }`}>
                {result}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

