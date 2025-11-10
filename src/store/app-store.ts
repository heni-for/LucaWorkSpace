/**
 * LUCA Platform Global State Management
 * Enterprise-grade state management for 1M+ users
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { config } from '@/lib/config';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: UserPreferences;
  subscription: Subscription;
  lastActive: string;
  timezone: string;
  language: string;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationSettings;
  shortcuts: KeyboardShortcuts;
  voice: VoiceSettings;
  privacy: PrivacySettings;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  desktop: boolean;
  voice: boolean;
  frequency: 'immediate' | 'hourly' | 'daily';
}

interface KeyboardShortcuts {
  enabled: boolean;
  shortcuts: Record<string, string>;
}

interface VoiceSettings {
  enabled: boolean;
  language: string;
  speed: number;
  volume: number;
  autoListen: boolean;
}

interface PrivacySettings {
  analytics: boolean;
  personalization: boolean;
  dataSharing: boolean;
  locationTracking: boolean;
}

interface Subscription {
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled';
  expiresAt: string;
  features: string[];
}

interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // UI state
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: Notification[];
  
  // Feature states
  voiceAssistant: {
    isActive: boolean;
    isListening: boolean;
    isProcessing: boolean;
    lastCommand: string;
    history: VoiceCommand[];
  };
  
  // Performance state
  performance: {
    loadTime: number;
    memoryUsage: number;
    networkStatus: 'online' | 'offline';
    lastSync: string;
  };
  
  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: string) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  updateVoiceAssistant: (updates: Partial<AppState['voiceAssistant']>) => void;
  updatePerformance: (updates: Partial<AppState['performance']>) => void;
  reset: () => void;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface VoiceCommand {
  id: string;
  command: string;
  response: string;
  timestamp: string;
  success: boolean;
  language: string;
}

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  sidebarOpen: true,
  theme: 'system' as const,
  language: config.tunisia.languages.primary,
  notifications: [],
  voiceAssistant: {
    isActive: false,
    isListening: false,
    isProcessing: false,
    lastCommand: '',
    history: [],
  },
  performance: {
    loadTime: 0,
    memoryUsage: 0,
    networkStatus: 'online' as const,
    lastSync: new Date().toISOString(),
  },
};

// Store implementation
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        setUser: (user) => set((state) => ({
          ...state,
          user,
          isAuthenticated: !!user,
        })),
        
        setAuthenticated: (authenticated) => set((state) => ({
          ...state,
          isAuthenticated: authenticated,
        })),
        
        setLoading: (loading) => set((state) => ({
          ...state,
          isLoading: loading,
        })),
        
        toggleSidebar: () => set((state) => ({
          ...state,
          sidebarOpen: !state.sidebarOpen,
        })),
        
        setTheme: (theme) => set((state) => ({
          ...state,
          theme,
          user: state.user ? {
            ...state.user,
            preferences: {
              ...state.user.preferences,
              theme,
            },
          } : null,
        })),
        
        setLanguage: (language) => set((state) => ({
          ...state,
          language,
          user: state.user ? {
            ...state.user,
            preferences: {
              ...state.user.preferences,
              language,
            },
          } : null,
        })),
        
        addNotification: (notification) => set((state) => ({
          ...state,
          notifications: [...state.notifications, notification],
        })),
        
        removeNotification: (id) => set((state) => ({
          ...state,
          notifications: state.notifications.filter(n => n.id !== id),
        })),
        
        updateVoiceAssistant: (updates) => set((state) => ({
          ...state,
          voiceAssistant: { ...state.voiceAssistant, ...updates },
        })),
        
        updatePerformance: (updates) => set((state) => ({
          ...state,
          performance: { ...state.performance, ...updates },
        })),
        
        reset: () => set(initialState),
      }),
      {
        name: 'luca-platform-store',
        partialize: (state) => ({
          user: state.user,
          theme: state.theme,
          language: state.language,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    ),
    {
      name: 'luca-platform-store',
    }
  )
);

// Selectors
export const useUser = () => useAppStore((state) => state.user);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen);
export const useTheme = () => useAppStore((state) => state.theme);
export const useLanguage = () => useAppStore((state) => state.language);
export const useNotifications = () => useAppStore((state) => state.notifications);
export const useVoiceAssistant = () => useAppStore((state) => state.voiceAssistant);
export const usePerformance = () => useAppStore((state) => state.performance);

// Actions
export const useAppActions = () => useAppStore((state) => ({
  setUser: state.setUser,
  setAuthenticated: state.setAuthenticated,
  setLoading: state.setLoading,
  toggleSidebar: state.toggleSidebar,
  setTheme: state.setTheme,
  setLanguage: state.setLanguage,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  updateVoiceAssistant: state.updateVoiceAssistant,
  updatePerformance: state.updatePerformance,
  reset: state.reset,
}));
