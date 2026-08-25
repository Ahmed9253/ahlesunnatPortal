import type { Metadata } from 'next';
import { getDb } from '@/lib/mongodb';
import { stripMongoId, DEFAULT_ABOUT } from '@/lib/types';
import type { AboutContent } from '@/lib/types';
import { Info } from 'lucide-react';
import ZoomableImage from '@/components/ui/zoomable-image';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About Us | Ahlesunnat Portal',
  description: 'Learn more about Ahlesunnat Portal — our mission, vision, and the community behind it.',
};

export default async function AboutPage() {
  const db = await getDb();
  let about = DEFAULT_ABOUT;
  if (db) {
    const doc = await db.collection<AboutContent>('settings').findOne({ key: 'about' });
    if (doc) about = stripMongoId(doc);
  }

  const title = about.title?.trim() || 'About Us';
  const intro = about.intro?.trim();
  const hasContent = Boolean(about.content?.trim());

  return (
    <div className="min-h-screen bg-background py-10 sm:py-16 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-3 flex items-center gap-3 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400/80">
          <span className="h-px w-8 bg-cyan-400/50" />
          Ahlesunnat Portal
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground">{title}</h1>

        {intro && (
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground border-l-2 border-cyan-400 pl-3 sm:pl-4 font-serif leading-relaxed">
            {intro}
          </p>
        )}

        {about.image && (
          <div className="mt-8 aspect-[16/8] overflow-hidden rounded-2xl border border-white/10">
            <ZoomableImage src={about.image} alt={title} className="h-full w-full object-cover" />
          </div>
        )}

        {hasContent ? (
          <article className="mt-8 space-y-5">
            {about.content.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-base sm:text-lg leading-[1.85] font-serif text-foreground/90 whitespace-pre-wrap">
                {paragraph}
              </p>
            ))}
          </article>
        ) : (
          <div className="mt-16 rounded-2xl border border-white/10 bg-card/60 py-16 text-center">
            <Info size={40} className="mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-lg font-bold text-muted-foreground">Content Coming Soon</h2>
            <p className="mt-2 text-sm text-muted-foreground/70">The About page content will appear here once published by the admin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
