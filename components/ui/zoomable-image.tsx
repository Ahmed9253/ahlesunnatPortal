'use client';

import { useState, useRef, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ZoomableImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export default function ZoomableImage({ src, alt = '', className = '' }: ZoomableImageProps) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const reset = useCallback(() => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, []);

  const zoomIn = useCallback(() => setScale(s => Math.min(s + 0.5, 5)), []);
  const zoomOut = useCallback(() => setScale(s => Math.max(s - 0.5, 0.5)), []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  }, [scale, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`cursor-pointer rounded-lg hover:opacity-80 transition-opacity ${className}`}
        onClick={() => setOpen(true)}
      />

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => { setOpen(false); reset(); }}
        >
          {/* Controls */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-[101] flex items-center gap-1.5 sm:gap-2">
            <button onClick={(e) => { e.stopPropagation(); zoomOut(); }} className="rounded-lg bg-white/10 p-1.5 sm:p-2 text-white hover:bg-white/20 transition-colors">
              <ZoomOut size={16} />
            </button>
            <span className="text-[10px] sm:text-xs text-white/60 min-w-[2.5rem] sm:min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
            <button onClick={(e) => { e.stopPropagation(); zoomIn(); }} className="rounded-lg bg-white/10 p-1.5 sm:p-2 text-white hover:bg-white/20 transition-colors">
              <ZoomIn size={16} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setRotation(r => r + 90); }} className="rounded-lg bg-white/10 p-1.5 sm:p-2 text-white hover:bg-white/20 transition-colors">
              <RotateCcw size={16} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setOpen(false); reset(); }} className="rounded-lg bg-white/10 p-1.5 sm:p-2 text-white hover:bg-white/20 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Image */}
          <img
            src={src}
            alt={alt}
            className="max-h-[90vh] max-w-[90vw] select-none"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
              cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
              transition: isDragging ? 'none' : 'transform 0.2s ease',
            }}
            onClick={(e) => { e.stopPropagation(); scale <= 1 ? zoomIn() : reset(); }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            draggable={false}
          />
        </div>
      )}
    </>
  );
}
