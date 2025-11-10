/**
 * LUCA Platform Configuration
 * Enterprise-grade configuration for 1M+ users
 */

export const config = {
  // Application Info
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'LUCA Platform',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '2.0.0',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002',
    description: 'The most powerful AI assistant platform for Tunisian professionals',
  },

  // AI Configuration
  ai: {
    model: process.env.NEXT_PUBLIC_AI_MODEL || 'gemini-1.5-flash', // Flash is faster and fully supported by v1beta API
    voiceEnabled: process.env.NEXT_PUBLIC_VOICE_ENABLED === 'true',
    multilingualSupport: process.env.NEXT_PUBLIC_MULTILINGUAL_SUPPORT === 'true',
    maxTokens: 8192,
    temperature: 0.7,
    supportedLanguages: ['ar-TN', 'fr-FR', 'en-US', 'ar-SA'],
  },

  // Performance Configuration
  performance: {
    cacheTTL: parseInt(process.env.NEXT_PUBLIC_CACHE_TTL || '3600'),
    maxConcurrentRequests: parseInt(process.env.NEXT_PUBLIC_MAX_CONCURRENT_REQUESTS || '10'),
    enableCompression: true,
    enableImageOptimization: true,
    enableCodeSplitting: true,
  },

  // Security Configuration
  security: {
    enableCSP: true,
    enableHSTS: true,
    enableXSSProtection: true,
    enableCSRFProtection: true,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },

  // Monitoring Configuration
  monitoring: {
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enablePerformanceMonitoring: process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true',
    enableErrorTracking: true,
    enableUserTracking: true,
    enableAPIMonitoring: true,
  },

  // Feature Flags
  features: {
    voiceAssistant: true,
    emailIntegration: true,
    taskManagement: true,
    calendarIntegration: true,
    notesSystem: true,
    reporting: true,
    teamCollaboration: true,
    whiteboard: true,
    documentManagement: true,
    realTimeSync: true,
    offlineMode: true,
    darkMode: true,
    multiLanguage: true,
    advancedAnalytics: true,
    customThemes: true,
    keyboardShortcuts: true,
    voiceCommands: true,
    gestureControl: true,
    aiInsights: true,
    smartNotifications: true,
  },

  // UI Configuration
  ui: {
    theme: {
      primary: '#64B5F6',
      secondary: '#D1C4E9',
      background: {
        light: '#F5F5F5',
        dark: '#37474F',
      },
      accent: '#E53935',
    },
    fonts: {
      body: 'Inter, sans-serif',
      headline: 'Space Grotesk, sans-serif',
    },
    animations: {
      enabled: true,
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    responsive: {
      mobile: '640px',
      tablet: '768px',
      desktop: '1024px',
      wide: '1280px',
    },
  },

  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002',
    timeout: 30000,
    retries: 3,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
    },
  },

  // Database Configuration
  database: {
    maxConnections: 100,
    connectionTimeout: 30000,
    queryTimeout: 10000,
    enableCaching: true,
    cacheSize: 1000,
  },

  // Tunisia-Specific Configuration
  tunisia: {
    timezone: 'Africa/Tunis',
    currency: 'TND',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    workingHours: {
      start: '08:00',
      end: '17:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    },
    holidays: [
      '2024-01-01', // New Year
      '2024-01-14', // Revolution Day
      '2024-03-20', // Independence Day
      '2024-04-09', // Martyrs' Day
      '2024-05-01', // Labour Day
      '2024-07-25', // Republic Day
      '2024-08-13', // Women's Day
      '2024-10-15', // Evacuation Day
    ],
    languages: {
      primary: 'ar-TN',
      secondary: 'fr-FR',
      tertiary: 'en-US',
    },
  },
} as const;

export type Config = typeof config;
export type FeatureFlags = typeof config.features;
export type UIConfig = typeof config.ui;
