"use client";

import { useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  alt: string;
  badge?: React.ReactNode;
}

export function ImageGallery({ images, alt, badge }: ImageGalleryProps) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 flex items-center justify-center text-gray-300">
        <Package className="h-20 w-20" />
        {badge && <div className="absolute top-3 left-3">{badge}</div>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
        <Image
          key={images[active]}
          src={images[active]}
          alt={`${alt} ${active + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority={active === 0}
        />
        {badge && <div className="absolute top-3 left-3">{badge}</div>}
      </div>

      {/* Thumbnail strip — only shown when more than 1 image */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                i === active
                  ? "border-amber-500"
                  : "border-transparent hover:border-amber-300"
              }`}
              aria-label={`Image ${i + 1}`}
            >
              <Image
                src={src}
                alt={`${alt} ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
