// Real-time Audio Processing Service
export class RealAudioProcessor {
  private static instance: RealAudioProcessor;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private isRecording = false;
  private audioBuffer: Float32Array[] = [];
  private recognition: any = null;
  private onTranscriptionCallback: ((text: string, confidence: number) => void) | null = null;
  private onAudioLevelCallback: ((level: number) => void) | null = null;

  static getInstance(): RealAudioProcessor {
    if (!RealAudioProcessor.instance) {
      RealAudioProcessor.instance = new RealAudioProcessor();
    }
    return RealAudioProcessor.instance;
  }

  // Initialize audio context and microphone
  async initializeAudio(): Promise<boolean> {
    try {
      // Request microphone permission
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });

      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create analyser for audio level detection
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      // Connect microphone to analyser
      this.microphone = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.microphone.connect(this.analyser);

      // Initialize speech recognition
      await this.initializeSpeechRecognition();

      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return false;
    }
  }

  // Initialize Web Speech API
  private async initializeSpeechRecognition(): Promise<void> {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'ar-TN'; // Default to Derja
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        console.log('Speech recognition started');
      };

      this.recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        let confidence = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          confidence = event.results[i][0].confidence;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Call callback with final transcript
        if (finalTranscript && this.onTranscriptionCallback) {
          this.onTranscriptionCallback(finalTranscript, confidence);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        // Restart recognition if it stops
        if (this.isRecording && event.error !== 'aborted') {
          setTimeout(() => {
            if (this.isRecording) {
              this.recognition.start();
            }
          }, 1000);
        }
      };

      this.recognition.onend = () => {
        console.log('Speech recognition ended');
        // Restart recognition if still recording
        if (this.isRecording) {
          setTimeout(() => {
            if (this.isRecording) {
              this.recognition.start();
            }
          }, 100);
        }
      };
    }
  }

  // Start real-time audio processing
  async startRecording(): Promise<boolean> {
    if (!this.audioContext || !this.mediaStream) {
      const initialized = await this.initializeAudio();
      if (!initialized) return false;
    }

    try {
      this.isRecording = true;
      
      // Resume audio context if suspended
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Start speech recognition
      if (this.recognition) {
        this.recognition.start();
      }

      // Start audio level monitoring
      this.startAudioLevelMonitoring();

      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.isRecording = false;
      return false;
    }
  }

  // Stop recording
  stopRecording(): void {
    this.isRecording = false;
    
    if (this.recognition) {
      this.recognition.stop();
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
  }

  // Monitor audio levels for visualization
  private startAudioLevelMonitoring(): void {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    const updateLevel = () => {
      if (!this.isRecording || !this.analyser) return;

      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate average audio level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const averageLevel = sum / dataArray.length;
      
      // Call callback with audio level
      if (this.onAudioLevelCallback) {
        this.onAudioLevelCallback(averageLevel);
      }

      requestAnimationFrame(updateLevel);
    };

    updateLevel();
  }

  // Set language for speech recognition
  setLanguage(language: string): void {
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  // Set transcription callback
  setTranscriptionCallback(callback: (text: string, confidence: number) => void): void {
    this.onTranscriptionCallback = callback;
  }

  // Set audio level callback
  setAudioLevelCallback(callback: (level: number) => void): void {
    this.onAudioLevelCallback = callback;
  }

  // Get current audio level
  getCurrentAudioLevel(): number {
    if (!this.analyser) return 0;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    
    return sum / dataArray.length;
  }

  // Check if microphone is available
  async checkMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get available audio devices
  async getAudioDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'audioinput');
    } catch (error) {
      console.error('Failed to get audio devices:', error);
      return [];
    }
  }

  // Switch to specific audio device
  async switchAudioDevice(deviceId: string): Promise<boolean> {
    try {
      // Stop current stream
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
      }

      // Get new stream with specific device
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: deviceId },
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Reconnect to audio context
      if (this.audioContext && this.microphone && this.analyser) {
        this.microphone.disconnect();
        this.microphone = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.microphone.connect(this.analyser);
      }

      return true;
    } catch (error) {
      console.error('Failed to switch audio device:', error);
      return false;
    }
  }

  // Cleanup resources
  cleanup(): void {
    this.stopRecording();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.analyser = null;
    this.microphone = null;
    this.recognition = null;
    this.audioBuffer = [];
  }

  // Get recording status
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  // Get audio context state
  getAudioContextState(): string {
    return this.audioContext?.state || 'closed';
  }
}
