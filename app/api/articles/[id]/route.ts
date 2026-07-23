import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { stripMongoId } from '@/lib/types';
import type { Article } from '@/lib/types';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

  const article = await db.collection<Article>('articles').findOne({ slug: id });
  if (!article) {
    const byId = await db.collection<Article>('articles').findOne({ id });
    if (!byId) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

    await db.collection('articles').updateOne({ id }, { $inc: { views: 1 } });
    return NextResponse.json({ article: stripMongoId({ ...byId, views: byId.views + 1 }) });
  }

  await db.collection('articles').updateOne({ slug: id }, { $inc: { views: 1 } });
  return NextResponse.json({ article: stripMongoId({ ...article, views: article.views + 1 }) });
}
