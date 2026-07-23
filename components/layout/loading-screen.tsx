'use client';

import { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFade(true), 2200);
    const hideTimer = setTimeout(() => setShow(false), 2800);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}`}
    >
      <img
        src="/SIteName.jpeg"
        alt="Ahlesunnat Portal"
        className="h-28 w-28 sm:h-44 sm:w-44 rounded-2xl object-cover mb-4 sm:mb-6"
      />
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-cyan-400 mb-2">
        Ahlesunnat Portal
      </h1>
      <p className="text-base sm:text-xl text-foreground font-semibold" dir="rtl" style={{ fontFamily: 'serif' }}>
        أهل السنّة والجماعة
      </p>
      <div className="mt-4 sm:mt-6 flex gap-1.5">
        <span className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0ms]" />
        <span className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:150ms]" />
        <span className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}
