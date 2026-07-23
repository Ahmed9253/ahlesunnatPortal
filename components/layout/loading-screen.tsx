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
      <p className="text-3xl sm:text-4xl md:text-6xl text-foreground font-semibold mb-6 font-arabic" dir="rtl">
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </p>
      <p className="text-xl sm:text-2xl md:text-4xl text-foreground font-semibold font-arabic" dir="rtl">
        أهل السنّة والجماعة
      </p>
      <div className="mt-8 sm:mt-10 flex gap-2">
        <span className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-cyan-400 animate-bounce [animation-delay:0ms]" />
        <span className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-cyan-400 animate-bounce [animation-delay:150ms]" />
        <span className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-cyan-400 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}
