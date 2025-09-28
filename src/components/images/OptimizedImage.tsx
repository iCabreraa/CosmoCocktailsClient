"use client";

import Image from "next/image";
import { useState, useCallback } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  objectPosition?: string;
}

const DEFAULT_BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  priority = false,
  quality = 80,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  placeholder = "blur",
  blurDataURL = DEFAULT_BLUR_DATA_URL,
  onLoad,
  onError,
  fallbackSrc = "/images/default-cocktail.webp",
  objectFit = "cover",
  objectPosition = "center",
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);

    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    }

    onError?.();
  }, [fallbackSrc, imageSrc, onError]);

  const imageProps = {
    src: imageSrc,
    alt,
    className: `${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`,
    quality,
    sizes,
    priority,
    placeholder,
    blurDataURL,
    onLoad: handleLoad,
    onError: handleError,
    style: {
      objectFit,
      objectPosition,
    },
  };

  if (fill) {
    return (
      <div className="relative">
        {/* Placeholder de carga */}
        {isLoading && (
          <div className="absolute inset-0 bg-cosmic-silver/20 animate-pulse rounded-lg" />
        )}

        {/* Imagen principal */}
        <Image {...imageProps} fill />

        {/* Indicador de error */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-cosmic-silver/10 rounded-lg">
            <div className="text-center text-cosmic-silver">
              <div className="text-4xl mb-2">🍹</div>
              <div className="text-sm">Imagen no disponible</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Placeholder de carga */}
      {isLoading && (
        <div
          className="bg-cosmic-silver/20 animate-pulse rounded-lg"
          style={{ width, height }}
        />
      )}

      {/* Imagen principal */}
      <Image {...imageProps} width={width} height={height} />

      {/* Indicador de error */}
      {hasError && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-cosmic-silver/10 rounded-lg"
          style={{ width, height }}
        >
          <div className="text-center text-cosmic-silver">
            <div className="text-4xl mb-2">🍹</div>
            <div className="text-sm">Imagen no disponible</div>
          </div>
        </div>
      )}
    </div>
  );
}
