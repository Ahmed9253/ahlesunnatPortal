import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getDb } from '@/lib/mongodb';
import { stripMongoId } from '@/lib/types';
import type { Article } from '@/lib/types';
import { makeSlug } from '@/lib/utils';
import { randomUUID } from 'node:crypto';

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

  const body = await req.json();
  const { title, excerpt, content, coverImage, category } = body;
  if (!title || !content || !category) {
    return NextResponse.json({ error: 'Title, content, and category are required' }, { status: 400 });
  }

  const slug = makeSlug(title);
  const existing = await db.collection('articles').countDocuments({ slug });
  if (existing) return NextResponse.json({ error: 'An article with this title already exists' }, { status: 400 });

  const now = new Date().toISOString();
  const article: Article = {
    id: randomUUID(),
    slug,
    title: title.trim(),
    excerpt: excerpt?.trim() || '',
    content,
    coverImage: coverImage || '',
    category,
    authorId: 'admin',
    authorName: 'Admin',
    publishedAt: now,
    updatedAt: now,
    starred: false,
    views: 0,
  };

  await db.collection('articles').insertOne(article);
  return NextResponse.json({ article: stripMongoId(article) }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

  const body = await req.json();
  const { id, title, excerpt, content, coverImage, category, starred } = body;
  if (!id) return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });

  const setFields: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (title !== undefined) {
    setFields.title = title.trim();
    const newSlug = makeSlug(title);
    const existing = await db.collection('articles').countDocuments({ slug: newSlug, id: { $ne: id } });
    if (existing) return NextResponse.json({ error: 'An article with this title already exists' }, { status: 400 });
    setFields.slug = newSlug;
  }
  if (excerpt !== undefined) setFields.excerpt = excerpt.trim();
  if (content !== undefined) setFields.content = content;
  if (coverImage !== undefined) setFields.coverImage = coverImage;
  if (category !== undefined) setFields.category = category;
  if (starred !== undefined) setFields.starred = starred;

  await db.collection('articles').updateOne({ id }, { $set: setFields });
  const article = await db.collection<Article>('articles').findOne({ id });
  return NextResponse.json({ article: article ? stripMongoId(article) : null });
}

export async function DELETE(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  await db.collection('articles').deleteOne({ id });
  await db.collection('comments').deleteMany({ articleId: id });
  return NextResponse.json({ success: true });
}
