import type { StateCreator } from 'zustand';

export interface VoiceSlice {
    voice: {
        isOpen: boolean;
        isListening: boolean;
        transcript: string;
        interimTranscript: string;
        open: () => void;
        close: () => void;
        toggleListening: () => void;
        setTranscript: (transcript: string) => void;
        setInterimTranscript: (interimTranscript: string) => void;
        setIsListening: (isListening: boolean) => void;
        clearTranscript: () => void;
    }
}

export const createVoiceSlice: StateCreator<VoiceSlice, [], [], VoiceSlice> = (set, get) => ({
    voice: {
        isOpen: false,
        isListening: false,
        transcript: '',
        interimTranscript: '',
        open: () => set(state => ({ voice: { ...state.voice, isOpen: true } })),
        close: () => set(state => ({ voice: { ...state.voice, isOpen: false, isListening: false } })),
        toggleListening: () => set(state => ({ voice: { ...state.voice, isListening: !get().voice.isListening } })),
        setTranscript: (transcript) => set(state => ({ voice: { ...state.voice, transcript } })),
        setInterimTranscript: (interimTranscript) => set(state => ({ voice: { ...state.voice, interimTranscript } })),
        setIsListening: (isListening) => set(state => ({ voice: { ...state.voice, isListening } })),
        clearTranscript: () => set(state => ({ voice: { ...state.voice, transcript: '', interimTranscript: '' } })),
    }
});
