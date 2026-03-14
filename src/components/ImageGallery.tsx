"use client";

import Image from "next/image";
import { useState } from "react";

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const activeImage = images[activeIndex] ?? null;

  const handleError = (index: number) => {
    setFailedImages((prev) => new Set(prev).add(index));
  };

  return (
    <div>
      <div className="relative aspect-square bg-white rounded-xl overflow-hidden border border-border-default">
        {activeImage && !failedImages.has(activeIndex) ? (
          <Image
            src={activeImage}
            alt={alt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-8"
            priority={activeIndex === 0}
            onError={() => handleError(activeIndex)}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-card-placeholder">
            <svg
              className="w-20 h-20 text-icon-placeholder"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`relative aspect-square bg-white rounded-lg overflow-hidden border-2 transition-colors cursor-pointer ${
                i === activeIndex
                  ? "border-navy"
                  : "border-border-default hover:border-slate-300"
              }`}
            >
              {!failedImages.has(i) ? (
                <Image
                  src={img}
                  alt={`${alt} ${i + 1}`}
                  fill
                  sizes="80px"
                  className="object-contain p-2"
                  onError={() => handleError(i)}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-card-placeholder">
                  <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
