import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { stripMongoId } from '@/lib/types';
import type { Question } from '@/lib/types';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

  const question = await db.collection<Question>('questions').findOne({ id });
  if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 });

  return NextResponse.json({ question: stripMongoId(question) });
}
