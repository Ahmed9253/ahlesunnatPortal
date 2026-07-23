'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CANDIDATES = ['/hero.png', '/hero2.png', '/hero3.png', '/hero4.png', '/hero5.png'];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const found: string[] = [];
    let checks = 0;
    CANDIDATES.forEach(src => {
      const img = new Image();
      img.onload = () => { found.push(src); checks++; if (checks === CANDIDATES.length) setImages([...found].sort((a, b) => a.localeCompare(b))); };
      img.onerror = () => { checks++; if (checks === CANDIDATES.length) setImages([...found].sort((a, b) => a.localeCompare(b))); };
      img.src = src;
    });
  }, []);

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setCurrent(c => (c - 1 + images.length) % images.length);
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

      {/* Dark gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-sm hover:bg-white/20 transition-colors">
            <ChevronLeft size={22} />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-sm hover:bg-white/20 transition-colors">
            <ChevronRight size={22} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${i === current ? 'w-8 bg-cyan-400' : 'w-2 bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
