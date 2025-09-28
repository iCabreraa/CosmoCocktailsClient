"use client";

import { useState, useCallback } from "react";
import LazyImage from "./LazyImage";
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

interface ImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
  showThumbnails?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  maxHeight?: string;
}

export default function ImageGallery({
  images,
  alt,
  className = "",
  showThumbnails = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  maxHeight = "400px",
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const nextImage = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToImage = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  if (images.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-cosmic-silver/10 rounded-lg ${className}`}
        style={{ height: maxHeight }}
      >
        <div className="text-center text-cosmic-silver">
          <div className="text-4xl mb-2">🍹</div>
          <div className="text-sm">No hay imágenes disponibles</div>
        </div>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className={className}>
        <LazyImage
          src={images[0]}
          alt={alt}
          fill
          className="rounded-lg cursor-pointer hover:scale-105 transition-transform duration-300"
          type="cocktail"
          priority
          onClick={openModal}
        />
      </div>
    );
  }

  return (
    <>
      <div className={className}>
        {/* Imagen principal */}
        <div
          className="relative rounded-lg overflow-hidden"
          style={{ height: maxHeight }}
        >
          <LazyImage
            src={images[currentIndex]}
            alt={`${alt} - Imagen ${currentIndex + 1}`}
            fill
            className="cursor-pointer hover:scale-105 transition-transform duration-300"
            type="cocktail"
            priority
            onClick={openModal}
          />

          {/* Controles de navegación */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200"
                aria-label="Imagen anterior"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200"
                aria-label="Imagen siguiente"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Indicador de imagen actual */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        {showThumbnails && images.length > 1 && (
          <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  index === currentIndex
                    ? "border-cosmic-gold scale-110"
                    : "border-transparent hover:border-cosmic-gold/50"
                }`}
              >
                <LazyImage
                  src={image}
                  alt={`${alt} - Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  type="thumbnail"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal de imagen completa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200"
              aria-label="Cerrar"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <LazyImage
              src={images[currentIndex]}
              alt={`${alt} - Imagen completa ${currentIndex + 1}`}
              width={800}
              height={600}
              className="rounded-lg"
              type="banner"
              priority
            />

            {/* Controles en modal */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors duration-200"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors duration-200"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
