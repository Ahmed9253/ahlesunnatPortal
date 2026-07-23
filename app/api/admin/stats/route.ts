import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

  const [totalArticles, totalUsers, totalQuestions, pendingQuestions, answeredQuestions, totalComments, starredArticles, starredQuestions] = await Promise.all([
    db.collection('articles').countDocuments(),
    db.collection('users').countDocuments(),
    db.collection('questions').countDocuments(),
    db.collection('questions').countDocuments({ status: 'pending' }),
    db.collection('questions').countDocuments({ status: 'answered' }),
    db.collection('comments').countDocuments(),
    db.collection('articles').countDocuments({ starred: true }),
    db.collection('questions').countDocuments({ starred: true }),
  ]);

  return NextResponse.json({
    totalArticles,
    totalUsers,
    totalQuestions,
    pendingQuestions,
    answeredQuestions,
    totalComments,
    starredArticles,
    starredQuestions,
  });
}
