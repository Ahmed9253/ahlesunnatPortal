import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getDb } from '@/lib/mongodb';
import { stripMongoId } from '@/lib/types';
import type { Comment } from '@/lib/types';

export async function PUT(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

  const { id, starred } = await req.json();
  if (!id) return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });

  await db.collection('comments').updateOne({ id }, { $set: { starred } });
  const comment = await db.collection<Comment>('comments').findOne({ id });
  return NextResponse.json({ comment: comment ? stripMongoId(comment) : null });
}

export async function DELETE(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  await db.collection('comments').deleteOne({ id });
  return NextResponse.json({ success: true });
}
