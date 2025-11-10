/**
 * LUCA Platform Performance Monitoring
 * Enterprise-grade performance tracking for 1M+ users
 */

import { trackPerformance, trackEvent } from './analytics';

// Performance Types
interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  category: 'navigation' | 'resource' | 'paint' | 'layout' | 'interaction' | 'custom';
  metadata?: Record<string, any>;
}

interface PerformanceObserver {
  name: string;
  callback: (entry: PerformanceEntry) => void;
  observer: PerformanceObserver | null;
}

interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
  cached: boolean;
  protocol: string;
}

interface NavigationTiming {
  domContentLoaded: number;
  loadComplete: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
}

// Performance Service Class
class PerformanceService {
  private observers: Map<string, PerformanceObserver> = new Map();
  private metrics: PerformanceMetric[] = [];
  private isInitialized: boolean = false;

  constructor() {
    this.initialize();
  }

  // Initialization
  private initialize(): void {
    if (typeof window === 'undefined' || this.isInitialized) return;

    this.setupNavigationObserver();
    this.setupResourceObserver();
    this.setupPaintObserver();
    this.setupLayoutObserver();
    this.setupInteractionObserver();
    this.setupMemoryObserver();
    this.setupNetworkObserver();

    this.isInitialized = true;
    console.log('Performance monitoring initialized');
  }

  // Navigation Timing
  private setupNavigationObserver(): void {
    if (!('performance' in window)) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return;

    const metrics: NavigationTiming = {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: this.getFirstPaint(),
      firstContentfulPaint: this.getFirstContentfulPaint(),
      largestContentfulPaint: this.getLargestContentfulPaint(),
      firstInputDelay: this.getFirstInputDelay(),
      cumulativeLayoutShift: this.getCumulativeLayoutShift(),
    };

    // Track navigation metrics
    Object.entries(metrics).forEach(([key, value]) => {
      if (value > 0) {
        this.trackMetric(key, value, 'ms', 'navigation');
      }
    });

    // Track overall page load time
    this.trackMetric('page_load_time', navigation.loadEventEnd - navigation.fetchStart, 'ms', 'navigation');
  }

  // Resource Timing
  private setupResourceObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          this.trackResourceTiming(resource);
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.set('resource', { name: 'resource', callback: () => {}, observer: observer as any });
  }

  // Paint Timing
  private setupPaintObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'paint') {
          this.trackMetric(entry.name, entry.startTime, 'ms', 'paint');
        }
      });
    });

    observer.observe({ entryTypes: ['paint'] });
    this.observers.set('paint', { name: 'paint', callback: () => {}, observer: observer as any });
  }

  // Layout Shift
  private setupLayoutObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'layout-shift') {
          const layoutShift = entry as any;
          if (!layoutShift.hadRecentInput) {
            this.trackMetric('layout_shift', layoutShift.value, 'score', 'layout');
          }
        }
      });
    });

    observer.observe({ entryTypes: ['layout-shift'] });
    this.observers.set('layout', { name: 'layout', callback: () => {}, observer: observer as any });
  }

  // Interaction Timing
  private setupInteractionObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'event') {
          const event = entry as PerformanceEventTiming;
          this.trackMetric('interaction_delay', event.processingStart - event.startTime, 'ms', 'interaction');
        }
      });
    });

    observer.observe({ entryTypes: ['event'] });
    this.observers.set('interaction', { name: 'interaction', callback: () => {}, observer: observer as any });
  }

  // Memory Usage
  private setupMemoryObserver(): void {
    if (!('memory' in performance)) return;

    const checkMemory = () => {
      const memory = (performance as any).memory;
      if (memory) {
        this.trackMetric('memory_used', memory.usedJSHeapSize, 'bytes', 'custom');
        this.trackMetric('memory_total', memory.totalJSHeapSize, 'bytes', 'custom');
        this.trackMetric('memory_limit', memory.jsHeapSizeLimit, 'bytes', 'custom');
      }
    };

    // Check memory every 30 seconds
    setInterval(checkMemory, 30000);
    checkMemory(); // Initial check
  }

  // Network Status
  private setupNetworkObserver(): void {
    if (!('connection' in navigator)) return;

    const connection = (navigator as any).connection;
    if (connection) {
      this.trackMetric('connection_type', connection.effectiveType, 'string', 'custom');
      this.trackMetric('connection_downlink', connection.downlink, 'mbps', 'custom');
      this.trackMetric('connection_rtt', connection.rtt, 'ms', 'custom');
    }
  }

  // Custom Metrics
  trackMetric(name: string, value: number, unit: string, category: PerformanceMetric['category'], metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      category,
      metadata,
    };

    this.metrics.push(metric);
    trackPerformance(name, value, unit);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  // Resource Timing Helper
  private trackResourceTiming(resource: PerformanceResourceTiming): void {
    const resourceTiming: ResourceTiming = {
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize,
      type: this.getResourceType(resource.name),
      cached: resource.transferSize === 0,
      protocol: this.getProtocol(resource.name),
    };

    this.trackMetric('resource_duration', resourceTiming.duration, 'ms', 'resource', {
      name: resourceTiming.name,
      type: resourceTiming.type,
      cached: resourceTiming.cached,
    });

    if (resourceTiming.size > 0) {
      this.trackMetric('resource_size', resourceTiming.size, 'bytes', 'resource', {
        name: resourceTiming.name,
        type: resourceTiming.type,
      });
    }
  }

  // Performance API Helpers
  private getFirstPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }

  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return firstContentfulPaint ? firstContentfulPaint.startTime : 0;
  }

  private getLargestContentfulPaint(): number {
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    const lcp = lcpEntries[lcpEntries.length - 1];
    return lcp ? lcp.startTime : 0;
  }

  private getFirstInputDelay(): number {
    const fidEntries = performance.getEntriesByType('first-input');
    const fid = fidEntries[0] as any;
    return fid ? fid.processingStart - fid.startTime : 0;
  }

  private getCumulativeLayoutShift(): number {
    const clsEntries = performance.getEntriesByType('layout-shift');
    return clsEntries.reduce((sum, entry: any) => sum + entry.value, 0);
  }

  private getResourceType(url: string): string {
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.js')) return 'script';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg') || url.includes('.gif') || url.includes('.webp')) return 'image';
    if (url.includes('.woff') || url.includes('.woff2') || url.includes('.ttf') || url.includes('.otf')) return 'font';
    if (url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg')) return 'media';
    return 'other';
  }

  private getProtocol(url: string): string {
    if (url.startsWith('https://')) return 'https';
    if (url.startsWith('http://')) return 'http';
    if (url.startsWith('data:')) return 'data';
    return 'other';
  }

  // Performance Reports
  getPerformanceReport(): {
    summary: Record<string, number>;
    metrics: PerformanceMetric[];
    recommendations: string[];
  } {
    const summary: Record<string, number> = {};
    const recommendations: string[] = [];

    // Calculate summary statistics
    const categories = [...new Set(this.metrics.map(m => m.category))];
    categories.forEach(category => {
      const categoryMetrics = this.metrics.filter(m => m.category === category);
      const values = categoryMetrics.map(m => m.value);
      
      summary[`${category}_count`] = values.length;
      summary[`${category}_avg`] = values.reduce((a, b) => a + b, 0) / values.length;
      summary[`${category}_max`] = Math.max(...values);
      summary[`${category}_min`] = Math.min(...values);
    });

    // Generate recommendations
    if (summary.navigation_avg > 3000) {
      recommendations.push('Page load time is slow. Consider optimizing images and reducing JavaScript bundle size.');
    }
    if (summary.resource_avg > 1000) {
      recommendations.push('Resource loading is slow. Consider implementing lazy loading and resource optimization.');
    }
    if (summary.layout_avg > 0.1) {
      recommendations.push('Layout shifts detected. Consider fixing layout stability issues.');
    }
    if (summary.memory_avg > 50 * 1024 * 1024) {
      recommendations.push('High memory usage detected. Consider optimizing memory usage and implementing garbage collection.');
    }

    return {
      summary,
      metrics: this.metrics,
      recommendations,
    };
  }

  // Cleanup
  disconnect(): void {
    this.observers.forEach(({ observer }) => {
      if (observer) {
        (observer as any).disconnect();
      }
    });
    this.observers.clear();
    this.metrics = [];
    this.isInitialized = false;
  }
}

// Export singleton instance
export const performanceService = new PerformanceService();

// Export types
export type {
  PerformanceMetric,
  ResourceTiming,
  NavigationTiming,
};
