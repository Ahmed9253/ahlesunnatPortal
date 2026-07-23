import Link from 'next/link';
import { BookOpen, MessageCircleQuestion, ArrowRight, Star } from 'lucide-react';
import { getDb } from '@/lib/mongodb';
import { stripMongoId } from '@/lib/types';
import type { Article, Question } from '@/lib/types';
import HeroCarousel from '@/components/hero-carousel';

export const dynamic = 'force-dynamic';

export default async function Home() {
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
      <section className="relative h-[70vh] sm:h-[85vh] overflow-hidden">
        <HeroCarousel />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-20 text-center">
          <p className="mb-4 text-2xl sm:text-3xl md:text-4xl text-foreground font-semibold" dir="rtl" style={{ fontFamily: 'serif' }}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <div className="mb-6 flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400/80">
            <span className="h-px w-10 bg-cyan-400/50" />
            Ahlesunnat Portal
            <span className="h-px w-10 bg-cyan-400/50" />
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Seek <span className="text-cyan-400">Knowledge</span>,<br />
            Find <span className="text-cyan-400">Answers</span>
          </h1>
          <p className="mx-auto mt-6 sm:mt-8 max-w-2xl text-base sm:text-xl text-muted-foreground">
            A trusted platform for authentic Islamic knowledge — articles, scholarly insights, and a community Q&A forum rooted in the creed of Ahlus Sunnah Wal Jama&#39;at.
          </p>
          <div className="mt-6 sm:mt-8 mx-auto max-w-xl flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-6 gap-y-2 text-xs sm:text-base text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="text-cyan-400">&#9670;</span> Quran &amp; Sunnah</span>
            <span className="flex items-center gap-1.5"><span className="text-cyan-400">&#9670;</span> Aqeedah</span>
            <span className="flex items-center gap-1.5"><span className="text-cyan-400">&#9670;</span> Fiqh</span>
            <span className="flex items-center gap-1.5"><span className="text-cyan-400">&#9670;</span> Tafseer</span>
            <span className="flex items-center gap-1.5"><span className="text-cyan-400">&#9670;</span> Hadith</span>
          </div>
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link href="/articles" className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-5 sm:px-8 py-2.5 sm:py-3.5 text-sm sm:text-base font-bold text-zinc-950 hover:bg-cyan-400 transition-colors">
              <BookOpen size={18} /> Read Articles
            </Link>
            <Link href="/qa" className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 sm:px-8 py-2.5 sm:py-3.5 text-sm sm:text-base font-semibold text-muted-foreground hover:border-cyan-400 hover:text-foreground transition-colors">
              <MessageCircleQuestion size={18} /> Q&A Forum
            </Link>
          </div>
          <div className="mt-8 sm:mt-10 flex items-center justify-center gap-6 sm:gap-8 text-sm sm:text-base text-muted-foreground">
            <span><span className="font-bold text-foreground">{totalArticles}</span> Articles</span>
            <span><span className="font-bold text-foreground">{totalQuestions}</span> Questions</span>
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      {articles.length > 0 && (
        <section className="py-10 sm:py-16 px-4">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 sm:mb-8 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold">Latest Articles</h2>
              <Link href="/articles" className="flex cursor-pointer items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {articles.map((article) => (
                <Link key={article.id} href={`/articles/${article.slug}`} className="group cursor-pointer rounded-xl border border-white/10 bg-card/80 overflow-hidden hover:border-cyan-400/30 transition-all">
                  {article.coverImage && (
                    <div className="aspect-[16/9] overflow-hidden">
                      <img src={article.coverImage} alt={article.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    </div>
                  )}
                  <div className="p-5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">{article.category}</span>
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
                <Link href="/articles" className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-muted-foreground hover:border-cyan-400 hover:text-foreground transition-colors">
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
              <Link href="/qa" className="flex cursor-pointer items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {questions.map((q) => (
                <Link key={q.id} href={`/qa/${q.id}`} className="group cursor-pointer rounded-xl border border-white/10 bg-card p-4 sm:p-5 hover:border-cyan-400/30 transition-all">
                  <div className="flex items-start gap-3">
                    <MessageCircleQuestion size={18} className="mt-0.5 shrink-0 text-cyan-400" />
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-cyan-400 transition-colors line-clamp-1">{q.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{q.adminAnswer?.content}</p>
                      <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-widest text-cyan-400/70">{q.category}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {totalQuestions > 8 && (
              <div className="mt-8 text-center">
                <Link href="/qa" className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-muted-foreground hover:border-cyan-400 hover:text-foreground transition-colors">
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
