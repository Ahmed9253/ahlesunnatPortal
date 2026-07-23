import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { stripMongoId } from '@/lib/types';
import type { Comment } from '@/lib/types';
import { getCurrentUser } from '@/lib/auth';
import { randomUUID } from 'node:crypto';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

  const comments = await db.collection<Comment>('comments')
    .find({ articleId: id })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({ comments: comments.map(stripMongoId) });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { content } = await req.json();
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
  }

  const db = await getDb();
  if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

  const comment: Comment = {
    id: randomUUID(),
    articleId: id,
    userId: user.id,
    userName: user.name,
    userAvatar: user.avatar,
    content: content.trim(),
    isAdminReply: false,
    starred: false,
    createdAt: new Date().toISOString(),
  };

  await db.collection('comments').insertOne(comment);
  return NextResponse.json({ comment: stripMongoId(comment) }, { status: 201 });
}
