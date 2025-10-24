import { create } from 'zustand';
import { createVoiceSlice, type VoiceSlice } from './voice-slice';

export const useStore = create<VoiceSlice>()((...a) => ({
  ...createVoiceSlice(...a),
}));
