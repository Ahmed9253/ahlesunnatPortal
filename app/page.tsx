import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { BookOpen, MessageCircleQuestion, ArrowRight, Star } from 'lucide-react';
import { getDb } from '@/lib/mongodb';
import { stripMongoId } from '@/lib/types';
import type { Article, Question } from '@/lib/types';
import HeroCarousel from '@/components/hero-carousel';

export const dynamic = 'force-dynamic';

function getHeroImages(): string[] {
  try {
    const dir = path.join(process.cwd(), 'public');
    return fs
      .readdirSync(dir)
      .filter((f) => /^\d+\.webp$/i.test(f))
      .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
      .map((f) => `/${f}`);
  } catch {
    return [];
  }
}

export default async function Home() {
  const heroImages = getHeroImages();

  let articles: Article[] = [];
  let questions: Question[] = [];
  let totalArticles = 0;
  let totalQuestions = 0;

  const db = await getDb();
  if (db) {
    const [a, q, ta, tq] = await Promise.all([
      db.collection<Article>('articles').find().sort({ publishedAt: -1 }).limit(8).toArray(),
      db.collection<Question>('questions').find({ status: 'answered' }).sort({ updatedAt: -1 }).limit(8).toArray(),
      db.collection<Article>('articles').countDocuments(),
      db.collection<Question>('questions').countDocuments(),
    ]);
    articles = a.map(stripMongoId);
    questions = q.map(stripMongoId);
    totalArticles = ta;
    totalQuestions = tq;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero with Carousel */}
      <section className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] overflow-hidden">
        <HeroCarousel images={heroImages} />
        <div className="relative z-10 flex h-full flex-col items-start justify-center px-6 sm:px-12 md:px-16 lg:px-24 py-12 sm:py-20 text-left">
          <div className="w-full max-w-lg md:max-w-xl lg:max-w-2xl">
          <div className="mb-4 flex items-center gap-3 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400/80">
              <span className="h-px w-8 bg-cyan-400/50" />
              Ahlesunnat Portal
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight">
              Seek <span className="text-cyan-400">Knowledge</span>,<br />
              Find <span className="text-cyan-400">Answers</span>
            </h1>
            <p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg text-muted-foreground/90 leading-relaxed">
              A trusted platform for authentic Islamic knowledge — articles, scholarly insights, and a community Q&A forum rooted in the creed of Ahlus Sunnah Wal Jama&#39;at.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] sm:text-sm">
              {['Quran & Sunnah', 'Aqeedah', 'Fiqh', 'Tafseer', 'Hadith'].map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-foreground/80 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> {tag}
                </span>
              ))}
            </div>
            <div className="mt-6 sm:mt-7 flex flex-wrap items-center gap-3">
              <Link href="/articles" className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 sm:px-7 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-zinc-950 shadow-lg shadow-cyan-500/25 hover:bg-cyan-400 hover:shadow-cyan-400/40 hover:-translate-y-0.5 transition-all">
                <BookOpen size={16} /> Read Articles
              </Link>
              <Link href="/qa" className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 sm:px-7 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-foreground/90 backdrop-blur-sm hover:bg-white/10 hover:border-white/25 hover:-translate-y-0.5 transition-all">
                <MessageCircleQuestion size={16} /> Q&A Forum
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-6 text-sm text-muted-foreground">
              <span><span className="font-bold text-foreground">{totalArticles}</span> Articles</span>
              <span><span className="font-bold text-foreground">{totalQuestions}</span> Questions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      {articles.length > 0 && (
        <section className="py-10 sm:py-16 px-4">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 sm:mb-8 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold">Latest Articles</h2>
              <Link href="/articles" className="flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-cyan-400 hover:bg-white/10 hover:text-cyan-300 transition-colors">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {articles.map((article) => (
                <Link key={article.id} href={`/articles/${article.slug}`} className="group cursor-pointer rounded-2xl border border-white/10 bg-card/80 overflow-hidden hover:border-cyan-400/30 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1 transition-all duration-300">
                  {article.coverImage && (
                    <div className="aspect-[16/9] overflow-hidden">
                      <img src={article.coverImage} alt={article.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                  )}
                  <div className="p-5">
                    <span className="inline-block rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-cyan-300 ring-1 ring-cyan-400/20">{article.category}</span>
                    <h3 className="mt-2 text-lg font-bold text-foreground line-clamp-2">{article.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground/70">
                      <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {article.starred && <Star size={14} className="fill-yellow-400 text-yellow-400" />}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {totalArticles > 8 && (
              <div className="mt-8 text-center">
                <Link href="/articles" className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-foreground/90 hover:bg-white/10 hover:border-cyan-400/40 hover:text-foreground transition-all">
                  <BookOpen size={16} /> More Articles <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Answered Questions */}
      {questions.length > 0 && (
        <section className="py-10 sm:py-16 px-4 bg-muted/50">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 sm:mb-8 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold">Recent Q&A</h2>
              <Link href="/qa" className="flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-cyan-400 hover:bg-white/10 hover:text-cyan-300 transition-colors">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {questions.map((q) => (
                <Link key={q.id} href={`/qa/${q.id}`} className="group cursor-pointer rounded-2xl border border-white/10 bg-card p-4 sm:p-5 hover:border-cyan-400/30 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-400/20 transition-colors group-hover:bg-cyan-500/20">
                      <MessageCircleQuestion size={18} />
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-cyan-400 transition-colors line-clamp-1">{q.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{q.adminAnswer?.content}</p>
                      <span className="mt-2 inline-block rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-cyan-300 ring-1 ring-cyan-400/20">{q.category}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {totalQuestions > 8 && (
              <div className="mt-8 text-center">
                <Link href="/qa" className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-foreground/90 hover:bg-white/10 hover:border-cyan-400/40 hover:text-foreground transition-all">
                  <MessageCircleQuestion size={16} /> More Questions <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Empty state */}
      {articles.length === 0 && questions.length === 0 && (
        <section className="py-24 px-4 text-center">
          <BookOpen size={48} className="mx-auto mb-4 text-muted-foreground/50" />
          <h2 className="text-xl font-bold text-muted-foreground">Content Coming Soon</h2>
          <p className="mt-2 text-sm text-muted-foreground/70">Islamic articles and Q&A will appear here once published by the admin.</p>
        </section>
      )}
    </div>
  );
}
