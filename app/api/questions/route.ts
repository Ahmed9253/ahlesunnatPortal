import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { stripMongoId } from '@/lib/types';
import type { Question } from '@/lib/types';
import { getCurrentUser } from '@/lib/auth';
import { randomUUID } from 'node:crypto';

export async function GET(req: NextRequest) {
  const db = await getDb();
  if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = parseInt(searchParams.get('skip') || '0');

  const filter: Record<string, unknown> = {};
  if (category && category !== 'All') filter.category = category;
  if (status && status !== 'All') filter.status = status;

  const questions = await db.collection<Question>('questions')
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  const total = await db.collection<Question>('questions').countDocuments(filter);

  return NextResponse.json({ questions: questions.map(stripMongoId), total });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { title, content, category, images } = await req.json();
  if (!title || !content || !category) {
    return NextResponse.json({ error: 'Title, content, and category are required' }, { status: 400 });
  }

  const db = await getDb();
  if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

  const question: Question = {
    id: randomUUID(),
    userId: user.id,
    userName: user.name,
    userAvatar: user.avatar,
    title: title.trim(),
    content: content.trim(),
    category,
    images: images || [],
    status: 'pending',
    adminAnswer: null,
    starred: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.collection('questions').insertOne(question);
  return NextResponse.json({ question: stripMongoId(question) }, { status: 201 });
}
