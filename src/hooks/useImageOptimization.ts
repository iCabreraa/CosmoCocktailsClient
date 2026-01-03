import { useState, useCallback, useMemo } from "react";

export interface ImageOptimizationOptions {
  quality?: number;
  format?: "webp" | "avif" | "jpeg" | "png";
  width?: number;
  height?: number;
  blur?: boolean;
  priority?: boolean;
  sizes?: string;
}

export interface OptimizedImageData {
  src: string;
  blurDataURL: string;
  width: number;
  height: number;
  quality: number;
  format: string;
  sizes: string;
  priority: boolean;
}

const DEFAULT_OPTIONS: Required<ImageOptimizationOptions> = {
  quality: 80,
  format: "webp",
  width: 400,
  height: 300,
  blur: true,
  priority: false,
  sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
};

const BLUR_DATA_URLS = {
  cocktail:
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
  background:
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
  banner:
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
  thumbnail:
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
  hero: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
  default:
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
};

/**
 * Hook para optimización de imágenes con Next.js
 * Proporciona configuraciones optimizadas para diferentes tipos de imágenes
 */
export function useImageOptimization() {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const markAsLoaded = useCallback((src: string) => {
    setLoadedImages(prev => new Set(prev).add(src));
  }, []);

  const isLoaded = useCallback(
    (src: string) => {
      return loadedImages.has(src);
    },
    [loadedImages]
  );

  // Configuraciones predefinidas para diferentes tipos de imágenes
  const getOptimizedImageData = useCallback(
    (
      src: string,
      type:
        | "cocktail"
        | "background"
        | "banner"
        | "thumbnail"
        | "hero" = "cocktail",
      customOptions: Partial<ImageOptimizationOptions> = {}
    ): OptimizedImageData => {
      const options = { ...DEFAULT_OPTIONS, ...customOptions };

      // Configuraciones específicas por tipo
      const typeConfigs = {
        cocktail: {
          quality: 85,
          width: 400,
          height: 300,
          sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw",
          priority: false,
        },
        background: {
          quality: 60,
          width: 1920,
          height: 1080,
          sizes: "100vw",
          priority: true,
        },
        banner: {
          quality: 90,
          width: 1200,
          height: 600,
          sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw",
          priority: true,
        },
        thumbnail: {
          quality: 75,
          width: 200,
          height: 150,
          sizes: "(max-width: 768px) 50vw, 25vw",
          priority: false,
        },
        hero: {
          quality: 95,
          width: 1920,
          height: 1080,
          sizes: "100vw",
          priority: true,
        },
      };

      const typeConfig = typeConfigs[type];
      const finalOptions = { ...options, ...typeConfig, ...customOptions };

      return {
        src,
        blurDataURL: BLUR_DATA_URLS[type] || BLUR_DATA_URLS.default,
        width: finalOptions.width,
        height: finalOptions.height,
        quality: finalOptions.quality,
        format: finalOptions.format,
        sizes: finalOptions.sizes,
        priority: finalOptions.priority,
      };
    },
    []
  );

  // Generar múltiples tamaños para responsive images
  const getResponsiveImageData = useCallback(
    (
      baseSrc: string,
      type:
        | "cocktail"
        | "background"
        | "banner"
        | "thumbnail"
        | "hero" = "cocktail"
    ) => {
      const baseData = getOptimizedImageData(baseSrc, type);

      const breakpoints = [
        { width: 320, height: 240, suffix: "sm" },
        { width: 640, height: 480, suffix: "md" },
        { width: 1024, height: 768, suffix: "lg" },
        { width: 1280, height: 960, suffix: "xl" },
      ];

      return breakpoints.map(bp => ({
        ...baseData,
        width: bp.width,
        height: bp.height,
        src: `${baseSrc}?w=${bp.width}&h=${bp.height}&q=${baseData.quality}&f=${baseData.format}`,
      }));
    },
    [getOptimizedImageData]
  );

  // Preload de imágenes críticas
  const preloadImage = useCallback(
    (
      src: string,
      type:
        | "cocktail"
        | "background"
        | "banner"
        | "thumbnail"
        | "hero" = "cocktail"
    ) => {
      const imageData = getOptimizedImageData(src, type);

      // Crear elemento link para preload
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = imageData.src;

      if (imageData.format === "webp") {
        link.type = "image/webp";
      } else if (imageData.format === "avif") {
        link.type = "image/avif";
      }

      document.head.appendChild(link);

      return () => {
        document.head.removeChild(link);
      };
    },
    [getOptimizedImageData]
  );

  // Lazy loading con Intersection Observer
  const useLazyImage = (
    src: string,
    type:
      | "cocktail"
      | "background"
      | "banner"
      | "thumbnail"
      | "hero" = "cocktail",
    threshold = 0.1
  ) => {
    const [isVisible, setIsVisible] = useState(false);
    const [ref, setRef] = useState<HTMLElement | null>(null);

    const observer = useMemo(() => {
      if (typeof window === "undefined") return null;

      return new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer?.disconnect();
          }
        },
        { threshold }
      );
    }, [threshold]);

    const setElementRef = useCallback(
      (element: HTMLElement | null) => {
        if (ref) observer?.unobserve(ref);
        if (element) observer?.observe(element);
        setRef(element);
      },
      [ref, observer]
    );

    return {
      isVisible,
      ref: setElementRef,
      imageData: isVisible ? getOptimizedImageData(src, type) : null,
    };
  };

  return {
    getOptimizedImageData,
    getResponsiveImageData,
    preloadImage,
    useLazyImage,
    markAsLoaded,
    isLoaded,
  };
}
