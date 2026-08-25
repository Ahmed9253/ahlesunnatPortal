import type { Metadata } from 'next';
import { getDb } from '@/lib/mongodb';
import { stripMongoId, DEFAULT_ABOUT, DEFAULT_DONATION } from '@/lib/types';
import type { AboutContent, DonationContent } from '@/lib/types';
import { Info, Heart } from 'lucide-react';
import ZoomableImage from '@/components/ui/zoomable-image';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About Us | Ahlesunnat Portal',
  description: 'Learn more about Ahlesunnat Portal — our mission, vision, and the community behind it.',
};

export default async function AboutPage() {
  const db = await getDb();
  let about = DEFAULT_ABOUT;
  let donation = DEFAULT_DONATION;
  if (db) {
    const [aboutDoc, donationDoc] = await Promise.all([
      db.collection<AboutContent>('settings').findOne({ key: 'about' }),
      db.collection<DonationContent>('settings').findOne({ key: 'donation' }),
    ]);
    if (aboutDoc) about = stripMongoId(aboutDoc);
    if (donationDoc) donation = stripMongoId(donationDoc);
  }

  const title = about.title?.trim() || 'About Us';
  const intro = about.intro?.trim();
  const hasContent = Boolean(about.content?.trim());
  const showDonation = donation.enabled && (Boolean(donation.description?.trim()) || donation.accounts.length > 0);

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

        {showDonation && (
          <section className="mt-16 sm:mt-20">
            <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-card/60 to-card/40 p-6 sm:p-10">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-400">
                  <Heart size={22} className="fill-cyan-400/30" />
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  {donation.title?.trim() || 'Support Our Work'}
                </h2>
              </div>

              {donation.description?.trim() && (
                <div className="mt-5 space-y-4">
                  {donation.description.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-base sm:text-lg leading-[1.85] font-serif text-foreground/90 whitespace-pre-wrap">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              {donation.accounts.length > 0 && (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {donation.accounts.map((account) => {
                    const fields = account.fields.filter((f) => f.label?.trim() || f.value?.trim());
                    return (
                      <div
                        key={account.id}
                        className="rounded-2xl border border-white/10 bg-card/80 p-5 transition-colors hover:border-cyan-400/40"
                      >
                        <div className="flex items-center justify-between gap-3">
                          {account.method?.trim() && (
                            <span className="inline-flex items-center rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-300">
                              {account.method}
                            </span>
                          )}
                        </div>
                        {account.holder?.trim() && (
                          <p className="mt-3 text-lg font-bold text-foreground">{account.holder}</p>
                        )}
                        {fields.length > 0 && (
                          <dl className="mt-3 space-y-2">
                            {fields.map((field, i) => (
                              <div key={i} className="flex flex-col gap-0.5 border-t border-white/5 pt-2 first:border-t-0 first:pt-0">
                                {field.label?.trim() && (
                                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    {field.label}
                                  </dt>
                                )}
                                {field.value?.trim() && (
                                  <dd className="font-mono text-sm text-foreground/90 break-all select-all">
                                    {field.value}
                                  </dd>
                                )}
                              </div>
                            ))}
                          </dl>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
