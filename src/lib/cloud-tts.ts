/**
 * Cloud TTS Service for Tunisian Derja
 * Supports multiple providers: ElevenLabs, Azure, Google
 */

export interface TTSProvider {
  name: string;
  speak: (text: string, language: string) => Promise<void>;
  isAvailable: () => boolean;
}

/**
 * ElevenLabs TTS Provider
 * Best for natural-sounding Arabic/Derja
 */
class ElevenLabsProvider implements TTSProvider {
  name = 'ElevenLabs';
  private apiKey: string | null = null;
  private voiceId = 'pNInz6obpgDQGcFmaJgB'; // Adam voice (default)

  constructor() {
    // Try to get API key from environment or localStorage
    if (typeof window !== 'undefined') {
      this.apiKey = localStorage.getItem('elevenlabs_api_key') || null;
    }
  }

  isAvailable(): boolean {
    return this.apiKey !== null && this.apiKey.length > 0;
  }

  async speak(text: string, language: string): Promise<void> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not set');
    }

    console.log('🌐 Using ElevenLabs TTS for:', text.substring(0, 50));

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2', // Supports Arabic
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = reject;
        audio.play();
      });
    } catch (error) {
      console.error('❌ ElevenLabs TTS error:', error);
      throw error;
    }
  }
}

/**
 * Azure TTS Provider
 * Good Arabic support, reliable
 */
class AzureProvider implements TTSProvider {
  name = 'Azure';
  private apiKey: string | null = null;
  private region = 'westus';

  constructor() {
    if (typeof window !== 'undefined') {
      this.apiKey = localStorage.getItem('azure_speech_key') || null;
      this.region = localStorage.getItem('azure_speech_region') || 'westus';
    }
  }

  isAvailable(): boolean {
    return this.apiKey !== null && this.apiKey.length > 0;
  }

  async speak(text: string, language: string): Promise<void> {
    if (!this.apiKey) {
      throw new Error('Azure Speech key not set');
    }

    console.log('🌐 Using Azure TTS for:', text.substring(0, 50));

    // Use Tunisian Arabic voice if available, else standard Arabic
    const voiceName = 'ar-TN-HediNeural'; // Tunisian Arabic voice

    const ssml = `
      <speak version='1.0' xml:lang='ar-TN'>
        <voice name='${voiceName}'>
          ${text}
        </voice>
      </speak>
    `;

    try {
      // First, get access token
      const tokenResponse = await fetch(
        `https://${this.region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
        {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': this.apiKey,
          },
        }
      );

      if (!tokenResponse.ok) {
        throw new Error(`Azure token error: ${tokenResponse.status}`);
      }

      const token = await tokenResponse.text();

      // Now synthesize speech
      const response = await fetch(
        `https://${this.region}.tts.speech.microsoft.com/cognitiveservices/v1`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
          },
          body: ssml,
        }
      );

      if (!response.ok) {
        throw new Error(`Azure TTS error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = reject;
        audio.play();
      });
    } catch (error) {
      console.error('❌ Azure TTS error:', error);
      throw error;
    }
  }
}

/**
 * Browser TTS Provider (Fallback)
 * Free but limited voice quality
 */
class BrowserProvider implements TTSProvider {
  name = 'Browser';
  private voicesLoaded = false;

  isAvailable(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  private async loadVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      let voices = window.speechSynthesis.getVoices();
      
      if (voices.length > 0) {
        console.log('✅ Voices already loaded:', voices.length);
        this.voicesLoaded = true;
        resolve(voices);
        return;
      }

      console.log('⏳ Waiting for voices to load...');
      
      // Set up event listener for voices changed
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        console.log('✅ Voices loaded:', voices.length);
        this.voicesLoaded = true;
        resolve(voices);
      };

      // Trigger voice loading
      window.speechSynthesis.getVoices();
      
      // Timeout fallback after 2 seconds
      setTimeout(() => {
        voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          console.log('✅ Voices loaded (timeout):', voices.length);
          this.voicesLoaded = true;
          resolve(voices);
        } else {
          console.warn('⚠️ No voices loaded, proceeding anyway');
          resolve([]);
        }
      }, 2000);
    });
  }

  async speak(text: string, language: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (!this.isAvailable()) {
        console.error('❌ Speech synthesis not available');
        resolve();
        return;
      }

      console.log('🗣️ Browser TTS speaking:', text);

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Load voices if not already loaded
      const voices = await this.loadVoices();
      
      console.log('📋 Available voices:', voices.map(v => `${v.name} (${v.lang})`).join(', '));

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to find Arabic voice
      const arabicVoice = voices.find(v => 
        v.lang.startsWith('ar') || 
        v.lang === 'ar-TN' ||
        v.lang === 'ar-SA' ||
        v.lang === 'ar-EG'
      );
      
      if (arabicVoice) {
        console.log('✅ Using Arabic voice:', arabicVoice.name, arabicVoice.lang);
        utterance.voice = arabicVoice;
        utterance.lang = arabicVoice.lang;
      } else if (voices.length > 0) {
        // Use first available voice if no Arabic voice
        console.warn('⚠️ No Arabic voice found, using first available voice');
        utterance.voice = voices[0];
        utterance.lang = voices[0].lang;
      } else {
        // No voices available, use default
        console.warn('⚠️ No voices available, using default');
        utterance.lang = 'ar';
      }

      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        console.log('🔊 Browser TTS started');
      };

      utterance.onend = () => {
        console.log('✅ Browser TTS finished');
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.error('❌ Browser TTS error:', event);
        resolve(); // Resolve anyway to prevent hanging
      };
      
      console.log('🎤 Calling speechSynthesis.speak()...');
      window.speechSynthesis.speak(utterance);
      
      // Verify it's speaking after a short delay
      setTimeout(() => {
        const speaking = window.speechSynthesis.speaking;
        const pending = window.speechSynthesis.pending;
        console.log('📊 TTS Status - Speaking:', speaking, 'Pending:', pending);
        
        if (!speaking && !pending) {
          console.warn('⚠️ TTS not speaking! Trying to resume...');
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        }
      }, 100);
    });
  }
}

/**
 * Cloud TTS Service Manager
 */
export class CloudTTSService {
  private providers: TTSProvider[] = [];
  private currentProvider: TTSProvider | null = null;

  constructor() {
    // Register providers in order of preference
    this.providers = [
      new AzureProvider(),      // Best for Tunisian Arabic
      new ElevenLabsProvider(), // Best quality overall
      new BrowserProvider(),    // Free fallback
    ];

    // Select first available provider
    this.currentProvider = this.providers.find(p => p.isAvailable()) || new BrowserProvider();
    
    console.log('🎙️ Selected TTS Provider:', this.currentProvider.name);
  }

  async speak(text: string, language: string = 'ar-TN'): Promise<void> {
    if (!this.currentProvider) {
      throw new Error('No TTS provider available');
    }

    console.log(`🗣️ Speaking with ${this.currentProvider.name}:`, text.substring(0, 50));

    try {
      await this.currentProvider.speak(text, language);
    } catch (error) {
      console.error(`❌ ${this.currentProvider.name} TTS failed:`, error);
      
      // Try fallback to browser TTS
      if (this.currentProvider.name !== 'Browser') {
        console.log('🔄 Falling back to Browser TTS');
        const browserProvider = new BrowserProvider();
        await browserProvider.speak(text, language);
      } else {
        throw error;
      }
    }
  }

  setApiKey(provider: 'elevenlabs' | 'azure', key: string, region?: string): void {
    if (typeof window === 'undefined') return;

    if (provider === 'elevenlabs') {
      localStorage.setItem('elevenlabs_api_key', key);
    } else if (provider === 'azure') {
      localStorage.setItem('azure_speech_key', key);
      if (region) {
        localStorage.setItem('azure_speech_region', region);
      }
    }

    // Reinitialize providers
    this.providers = [
      new AzureProvider(),
      new ElevenLabsProvider(),
      new BrowserProvider(),
    ];
    this.currentProvider = this.providers.find(p => p.isAvailable()) || new BrowserProvider();
    
    console.log('✅ TTS Provider updated to:', this.currentProvider.name);
  }

  getCurrentProvider(): string {
    return this.currentProvider?.name || 'None';
  }

  listAvailableProviders(): string[] {
    return this.providers.filter(p => p.isAvailable()).map(p => p.name);
  }
}

// Export singleton instance
export const cloudTTS = new CloudTTSService();

