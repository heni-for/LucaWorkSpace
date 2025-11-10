/**
 * LUCA Platform Analytics & Monitoring
 * Enterprise-grade analytics for 1M+ users
 */

import * as Sentry from '@sentry/nextjs';
import React from 'react';

// Google Analytics gtag type declaration
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
  }
}

// Initialize Sentry for error tracking
export const initSentry = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      profilesSampleRate: 0.1,
      beforeSend(event) {
        // Filter out sensitive data
        if (event.user) {
          delete event.user.email;
          delete event.user.ip_address;
        }
        return event;
      },
    });
  }
};

// Custom analytics events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true') {
    // Track with Vercel Analytics
    if (window.gtag) {
      window.gtag('event', eventName, properties);
    }
    
    // Track with Sentry
    Sentry.addBreadcrumb({
      message: eventName,
      data: properties,
      level: 'info',
    });
  }
};

// User behavior tracking
export const trackUserAction = (action: string, context?: string) => {
  trackEvent('user_action', {
    action,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  });
};

// Performance tracking
export const trackPerformance = (metric: string, value: number, unit: string = 'ms') => {
  trackEvent('performance_metric', {
    metric,
    value,
    unit,
    timestamp: new Date().toISOString(),
  });
};

// Error tracking
export const trackError = (error: Error, context?: string) => {
  Sentry.captureException(error, {
    tags: {
      context: context || 'unknown',
    },
  });
  
  trackEvent('error_occurred', {
    error: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
};

// AI usage tracking
export const trackAIUsage = (feature: string, tokens?: number, language?: string) => {
  trackEvent('ai_usage', {
    feature,
    tokens,
    language,
    timestamp: new Date().toISOString(),
  });
};

// Voice command tracking
export const trackVoiceCommand = (command: string, success: boolean, language: string) => {
  trackEvent('voice_command', {
    command,
    success,
    language,
    timestamp: new Date().toISOString(),
  });
};

// Feature usage tracking
export const trackFeatureUsage = (feature: string, action: string, metadata?: Record<string, any>) => {
  trackEvent('feature_usage', {
    feature,
    action,
    metadata,
    timestamp: new Date().toISOString(),
  });
};

// Page view tracking
export const trackPageView = (page: string, title?: string) => {
  trackEvent('page_view', {
    page,
    title,
    timestamp: new Date().toISOString(),
  });
};

// Custom metrics for business intelligence
export const trackBusinessMetric = (metric: string, value: number, category: string) => {
  trackEvent('business_metric', {
    metric,
    value,
    category,
    timestamp: new Date().toISOString(),
  });
};

// Real-time user activity
export const trackUserActivity = (activity: string, duration?: number) => {
  trackEvent('user_activity', {
    activity,
    duration,
    timestamp: new Date().toISOString(),
  });
};

// Conditional Analytics component - only renders in production on Vercel
export function Analytics() {
  // Only render in production and when deployed on Vercel
  // In development or non-Vercel environments, return null to avoid 404 errors
  if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    return null;
  }
  
  // Try to load Vercel Analytics, but fail silently if not available
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const VercelAnalytics = require('@vercel/analytics/react').Analytics;
    return React.createElement(VercelAnalytics);
  } catch {
    // Package not available or not on Vercel - return null
    return null;
  }
}

// Conditional SpeedInsights component - only renders in production on Vercel
export function SpeedInsights() {
  // Only render in production and when deployed on Vercel
  // In development or non-Vercel environments, return null to avoid 404 errors
  if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    return null;
  }
  
  // Try to load Vercel Speed Insights, but fail silently if not available
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const VercelSpeedInsights = require('@vercel/speed-insights/next').SpeedInsights;
    return React.createElement(VercelSpeedInsights);
  } catch {
    // Package not available or not on Vercel - return null
    return null;
  }
}
