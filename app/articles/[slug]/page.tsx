import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/mongodb';
import { stripMongoId } from '@/lib/types';
import type { Article } from '@/lib/types';
import { Star, Calendar, Eye, ArrowLeft } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ArticleComments from '@/components/articles/article-comments';
import ZoomableImage from '@/components/ui/zoomable-image';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  if (!db) return {};
  const article = await db.collection<Article>('articles').findOne({ slug });
  if (!article) return {};
  return { title: `${article.title} | Ahlesunnat Portal`, description: article.excerpt };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  if (!db) notFound();

  const article = await db.collection<Article>('articles').findOne({ slug });
  if (!article) notFound();

  const data = stripMongoId(article);

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8 px-4">
      <div className="mx-auto max-w-3xl">
        <Link href="/articles" className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} /> Back to Articles
        </Link>

        {data.coverImage && (
          <div className="mb-8 aspect-[16/8] overflow-hidden rounded-xl">
            <ZoomableImage src={data.coverImage} alt={data.title} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-400">{data.category}</span>
          {data.starred && <Star size={14} className="fill-yellow-400 text-yellow-400" />}
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight">{data.title}</h1>

        <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(data.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span className="flex items-center gap-1.5"><Eye size={14} /> {data.views} views</span>
          <span>By {data.authorName}</span>
        </div>

        {data.excerpt && <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground border-l-2 border-cyan-400 pl-3 sm:pl-4">{data.excerpt}</p>}

        <article className="prose-dark mt-8">
          <Markdown remarkPlugins={[remarkGfm]}>{data.content}</Markdown>
        </article>

        <div className="mt-12 border-t border-white/10 pt-8">
          <h2 className="text-xl font-bold mb-6">Comments</h2>
          <ArticleComments articleId={data.id} />
        </div>
      </div>
    </div>
  );
}
