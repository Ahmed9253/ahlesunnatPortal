import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { stripMongoId } from '@/lib/types';
import type { Article } from '@/lib/types';

export async function GET(req: NextRequest) {
  const db = await getDb();
  if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = parseInt(searchParams.get('skip') || '0');

  const filter: Record<string, unknown> = {};
  if (category && category !== 'All') filter.category = category;
  if (search) filter.$or = [
    { title: { $regex: search, $options: 'i' } },
    { excerpt: { $regex: search, $options: 'i' } },
  ];

  const articles = await db.collection<Article>('articles')
    .find(filter)
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  const total = await db.collection<Article>('articles').countDocuments(filter);

  return NextResponse.json({ articles: articles.map(stripMongoId), total });
}
