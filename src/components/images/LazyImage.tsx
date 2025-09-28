"use client";

import { useRef, useEffect, useState } from "react";
import OptimizedImage from "./OptimizedImage";
import { useImageOptimization } from "@/hooks/useImageOptimization";

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  type?: "cocktail" | "background" | "banner" | "thumbnail" | "hero";
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: () => void;
  onClick?: () => void;
  fallbackSrc?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  objectPosition?: string;
  placeholder?: "blur" | "empty";
}

export default function LazyImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  priority = false,
  quality,
  sizes,
  type = "cocktail",
  threshold = 0.1,
  rootMargin = "50px",
  onLoad,
  onError,
  onClick,
  fallbackSrc,
  objectFit = "cover",
  objectPosition = "center",
  placeholder = "blur",
}: LazyImageProps) {
  const [isVisible, setIsVisible] = useState(priority);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { getOptimizedImageData, markAsLoaded, isLoaded } =
    useImageOptimization();

  useEffect(() => {
    if (priority || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [priority, isVisible, threshold, rootMargin]);

  const handleLoad = () => {
    setHasLoaded(true);
    markAsLoaded(src);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Si no es visible, mostrar placeholder
  if (!isVisible) {
    return (
      <div
        ref={ref}
        className={`${className} bg-cosmic-silver/20 animate-pulse rounded-lg`}
        style={fill ? undefined : { width, height }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-cosmic-silver/50 text-sm">Cargando...</div>
        </div>
      </div>
    );
  }

  // Obtener configuración optimizada
  const imageData = getOptimizedImageData(src, type, {
    quality,
    width: width ? width : undefined,
    height: height ? height : undefined,
    sizes,
    priority,
  });

  return (
    <div ref={ref} className="relative">
      <div onClick={onClick} className={onClick ? "cursor-pointer" : ""}>
        <OptimizedImage
          src={src}
          alt={alt}
          width={fill ? undefined : imageData.width}
          height={fill ? undefined : imageData.height}
          fill={fill}
          className={className}
          priority={priority}
          quality={imageData.quality}
          sizes={imageData.sizes}
          placeholder={placeholder}
          blurDataURL={imageData.blurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          fallbackSrc={fallbackSrc}
          objectFit={objectFit}
          objectPosition={objectPosition}
        />
      </div>

      {/* Indicador de carga */}
      {!hasLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-cosmic-silver/10 rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cosmic-gold"></div>
        </div>
      )}
    </div>
  );
}
