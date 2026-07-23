import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getDb } from '@/lib/mongodb';
import { stripMongoId } from '@/lib/types';
import type { Question } from '@/lib/types';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const db = await getDb();
  if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

  const body = await req.json();
  const { answer, status, starred } = body;

  const setFields: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (answer !== undefined) {
    setFields.adminAnswer = { content: answer, answeredAt: new Date().toISOString() };
    setFields.status = 'answered';
  }
  if (status !== undefined) setFields.status = status;
  if (starred !== undefined) setFields.starred = starred;

  await db.collection('questions').updateOne({ id }, { $set: setFields });
  const question = await db.collection<Question>('questions').findOne({ id });
  return NextResponse.json({ question: question ? stripMongoId(question) : null });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const db = await getDb();
  if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

  await db.collection('questions').deleteOne({ id });
  return NextResponse.json({ success: true });
}
