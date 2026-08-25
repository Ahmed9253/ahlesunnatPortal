'use client';

import { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFade(true), 3000);
    const hideTimer = setTimeout(() => setShow(false), 3600);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-background transition-opacity duration-600 ${fade ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Ambient radial glow backdrop */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_50%_38%,rgba(34,211,238,0.14),transparent_60%)]" />

      <div className="relative flex flex-col items-center px-6 text-center">
        {/* Basmala */}
        <p className="loader-3d loader-3d-accent text-4xl leading-[1.4] sm:text-5xl md:text-7xl font-semibold font-arabic" dir="rtl">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>

        {/* Ornamental divider */}
        <div className="loader-durood mt-7 flex items-center gap-3">
          <span className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-cyan-400/60" />
          <span className="h-1.5 w-1.5 rotate-45 bg-cyan-400/80" />
          <span className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-cyan-400/60" />
        </div>

        {/* Durood Shareef */}
        <p className="loader-durood mt-6 max-w-2xl text-2xl leading-[1.7] sm:text-3xl md:text-4xl text-foreground font-semibold font-arabic" dir="rtl">
          اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِهِ وَصَحْبِهِ وَسَلِّم
        </p>

        {/* Name of Ahle Sunnat */}
        <p className="loader-durood mt-8 text-xl sm:text-2xl md:text-3xl text-cyan-100/90 font-semibold font-arabic tracking-wide" dir="rtl">
          أهل السنّة والجماعة
        </p>

        {/* Spinner ring */}
        <div className="loader-durood mt-10 sm:mt-12">
          <span className="loader-ring block h-9 w-9 rounded-full border-2 border-white/10" />
        </div>
      </div>
    </div>
  );
}
