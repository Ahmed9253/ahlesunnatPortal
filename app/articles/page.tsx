import Link from 'next/link';
import { getDb } from '@/lib/mongodb';
import { stripMongoId } from '@/lib/types';
import type { Article, ArticleCategory } from '@/lib/types';
import { ARTICLE_CATEGORIES } from '@/lib/types';
import { Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ category?: string; search?: string }> }) {
  const params = await searchParams;
  const db = await getDb();
  let articles: Article[] = [];

  if (db) {
    const filter: Record<string, unknown> = {};
    if (params.category && params.category !== 'All') filter.category = params.category;
    if (params.search) filter.$or = [
      { title: { $regex: params.search, $options: 'i' } },
      { excerpt: { $regex: params.search, $options: 'i' } },
    ];

    const docs = await db.collection<Article>('articles')
      .find(filter)
      .sort({ publishedAt: -1 })
      .limit(50)
      .toArray();
    articles = docs.map(stripMongoId);
  }

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">Islamic Articles</h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">Explore articles on Tafseer, Hadith, Fiqh, Aqeedah, and more.</p>
        </div>

        {/* Category Filter */}
        <div className="mb-6 sm:mb-8 flex flex-wrap gap-1.5 sm:gap-2">
          <Link href="/articles" className={`cursor-pointer rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${!params.category || params.category === 'All' ? 'bg-cyan-500 text-zinc-950' : 'border border-white/15 text-muted-foreground hover:border-cyan-400 hover:text-foreground'}`}>
            All
          </Link>
          {ARTICLE_CATEGORIES.map((cat) => (
            <Link key={cat} href={`/articles?category=${cat}`} className={`cursor-pointer rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${params.category === cat ? 'bg-cyan-500 text-zinc-950' : 'border border-white/15 text-muted-foreground hover:border-cyan-400 hover:text-foreground'}`}>
              {cat}
            </Link>
          ))}
        </div>

        {articles.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground">No articles found.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link key={article.id} href={`/articles/${article.slug}`} className="group cursor-pointer rounded-xl border border-white/10 bg-card/80 overflow-hidden hover:border-cyan-400/30 transition-all">
                {article.coverImage && (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img src={article.coverImage} alt={article.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                )}
                <div className="p-3 sm:p-5">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-cyan-400">{article.category}</span>
                    {article.starred && <Star size={12} className="fill-yellow-400 text-yellow-400" />}
                  </div>
                  <h3 className="mt-2 text-base sm:text-lg font-bold text-foreground line-clamp-2">{article.title}</h3>
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2 font-serif">{article.excerpt}</p>
                  <div className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-muted-foreground/70">
                    {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
