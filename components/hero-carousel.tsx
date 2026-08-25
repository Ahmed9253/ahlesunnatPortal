'use client';

import { useState, useCallback, useEffect } from 'react';

export default function HeroCarousel({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, images.length]);

  if (images.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-all duration-1000 ease-in-out"
          style={{
            opacity: i === current ? 1 : 0,
            transform: `translateX(${i === current ? 0 : 100}%)`,
          }}
        >
          <img
            src={src}
            alt={`Hero ${i + 1}`}
            className="h-full w-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      ))}

      {/* Left dark-blur panel: blurs the image behind the text, fading out around the middle */}
      <div className="pointer-events-none absolute inset-0 backdrop-blur-md [mask-image:linear-gradient(to_right,black,black_30%,transparent_60%)] [-webkit-mask-image:linear-gradient(to_right,black,black_30%,transparent_60%)]" />
      {/* Dark gradients for text legibility */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 via-45% to-transparent to-70%" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 sm:bottom-6">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === current ? 'w-8 bg-cyan-400' : 'w-2 bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
