import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getDb } from '@/lib/mongodb';
import { stripMongoId } from '@/lib/types';
import type { User } from '@/lib/types';

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

  const users = await db.collection<User>('users')
    .find({}, { projection: { passwordHash: 0 } })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({ users: users.map(stripMongoId) });
}

export async function DELETE(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  await db.collection('users').deleteOne({ id });
  await db.collection('comments').deleteMany({ userId: id });
  await db.collection('questions').deleteMany({ userId: id });
  return NextResponse.json({ success: true });
}
