/**
 * Performance monitoring and optimization utilities for QC app
 */

export interface PerformanceMetrics {
  name: string;
  value: number;
  timestamp: number;
  url?: string;
}

export interface BundleInfo {
  size: number;
  name: string;
  type: 'js' | 'css' | 'other';
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    try {
      // Core Web Vitals monitoring
      if ('PerformanceObserver' in window) {
        // LCP (Largest Contentful Paint)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('LCP', lastEntry.startTime);
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        this.observers.push(lcpObserver);

        // FID (First Input Delay) via PerformanceEventTiming
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.processingStart && entry.startTime) {
              const fid = entry.processingStart - entry.startTime;
              this.recordMetric('FID', fid);
            }
          });
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
        this.observers.push(fidObserver);

        // CLS (Cumulative Layout Shift)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.recordMetric('CLS', clsValue);
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        this.observers.push(clsObserver);

        // Long tasks monitoring
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.recordMetric('Long Task', entry.duration);
          });
        });
        longTaskObserver.observe({ type: 'longtask', buffered: true });
        this.observers.push(longTaskObserver);
      }
    } catch (error) {
      console.warn('Performance monitoring initialization failed:', error);
    }
  }

  recordMetric(name: string, value: number, url?: string) {
    const metric: PerformanceMetrics = {
      name,
      value,
      timestamp: Date.now(),
      url: url || (typeof window !== 'undefined' ? window.location.pathname : undefined)
    };
    
    this.metrics.push(metric);
    
    // Keep only recent metrics (last 100)
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  getMetrics(name?: string): PerformanceMetrics[] {
    return name 
      ? this.metrics.filter(m => m.name === name)
      : [...this.metrics];
  }

  getAverageMetric(name: string): number | null {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return null;
    
    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    this.recordMetric(`Function: ${name}`, duration);
    return result;
  }

  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    this.recordMetric(`Async Function: ${name}`, duration);
    return result;
  }

  dispose() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

// Lazy loading utilities
export function createLazyComponent<T = any>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>
): React.LazyExoticComponent<React.ComponentType<T>> {
  return React.lazy(importFn);
}

// Bundle analysis utilities
export function analyzeBundleSize(): Promise<BundleInfo[]> {
  if (typeof window === 'undefined') {
    return Promise.resolve([]);
  }

  return new Promise((resolve) => {
    const info: BundleInfo[] = [];
    
    // Analyze loaded scripts
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach((script) => {
      const src = (script as HTMLScriptElement).src;
      if (src) {
        info.push({
          name: src.split('/').pop() || src,
          size: 0, // Size would need to be fetched separately
          type: 'js'
        });
      }
    });

    // Analyze loaded stylesheets
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach((link) => {
      const href = (link as HTMLLinkElement).href;
      if (href) {
        info.push({
          name: href.split('/').pop() || href,
          size: 0, // Size would need to be fetched separately
          type: 'css'
        });
      }
    });

    resolve(info);
  });
}

// Performance utilities for React components
export function createPerformanceTracker<P extends object>(
  componentName: string
): (Component: React.ComponentType<P>) => React.ComponentType<P> {
  return function wrapWithPerformanceTracking(Component: React.ComponentType<P>) {
    // This would need to be implemented in a .tsx file
    // Return the original component for now
    return Component;
  };
}

// Memory usage monitoring
export function getMemoryUsage() {
  if (typeof window === 'undefined' || !('memory' in performance)) {
    return null;
  }
  
  const memory = (performance as any).memory;
  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
  };
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React import for lazy loading utilities
import React from 'react';

// Hook for performance monitoring in React components
export function usePerformanceMonitor() {
  return React.useMemo(() => performanceMonitor, []);
}

// Hook for measuring component render time
export function useRenderPerformance(componentName: string) {
  const monitor = usePerformanceMonitor();
  
  React.useEffect(() => {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      monitor.recordMetric(`Render: ${componentName}`, duration);
    };
  });
}