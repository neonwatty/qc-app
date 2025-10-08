
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Simple loading skeleton for fallback
const LoadingFallback = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className || 'h-8 w-full'}`} />
);

// Generic lazy loading wrapper with Suspense
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function LazyWrapper({ children, fallback, className }: LazyWrapperProps) {
  return (
    <Suspense 
      fallback={
        fallback || (
          <div className={className}>
            <LoadingFallback className="h-8 w-full" />
          </div>
        )
      }
    >
      {children}
    </Suspense>
  );
}

// Viewport-based lazy loading hook
interface UseViewportLazyLoadingProps {
  threshold?: number;
  rootMargin?: string;
}

export function useViewportLazyLoading({ 
  threshold = 0.1, 
  rootMargin = '50px' 
}: UseViewportLazyLoadingProps = {}) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasBeenVisible, setHasBeenVisible] = React.useState(false);
  const elementRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element || hasBeenVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasBeenVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, hasBeenVisible]);

  return { ref: elementRef, isVisible, hasBeenVisible };
}

// Viewport-aware lazy component
interface ViewportLazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

export function ViewportLazyComponent({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '50px',
  className
}: ViewportLazyComponentProps) {
  const { ref, isVisible } = useViewportLazyLoading({ threshold, rootMargin });

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : (fallback || <LoadingFallback />)}
    </div>
  );
}

// Core working lazy components
export const LazyStatsGrid = dynamic(() => 
  import('../dashboard/StatsGrid').then(mod => ({ default: mod.StatsGrid })),
  {
    loading: () => <LoadingFallback className="h-32" />,
    ssr: false
  }
);

export const LazyBasicChart = dynamic(() => 
  import('../growth/BasicChart').then(mod => ({ default: mod.BasicChart })),
  {
    loading: () => <LoadingFallback className="h-64" />,
    ssr: false
  }
);

export const LazyPhotoGallery = dynamic(() => 
  import('../growth/PhotoGallery').then(mod => ({ default: mod.PhotoGallery })),
  {
    loading: () => <LoadingFallback className="h-48" />,
    ssr: false
  }
);

// Image lazy loading component with Next.js Image optimization
interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75
}: LazyImageProps) {
  const Image = dynamic(() => import('next/image'), {
    loading: () => (
      <div className={`bg-gray-200 animate-pulse ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 bg-gray-300 rounded" />
        </div>
      </div>
    ),
    ssr: false
  });

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      quality={quality}
      loading={priority ? 'eager' : 'lazy'}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
    />
  );
}