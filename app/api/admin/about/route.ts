import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getDb } from '@/lib/mongodb';
import { stripMongoId, DEFAULT_ABOUT } from '@/lib/types';
import type { AboutContent, SocialLink } from '@/lib/types';

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

  const doc = await db.collection<AboutContent>('settings').findOne({ key: 'about' });
  return NextResponse.json({ about: doc ? stripMongoId(doc) : DEFAULT_ABOUT });
}

export async function PUT(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

  const body = await req.json();
  const { title, intro, content, image, socials, phones } = body;

  const cleanSocials: SocialLink[] = Array.isArray(socials)
    ? socials
        .map((s: Partial<SocialLink>): SocialLink => ({
          platform: (s.platform ?? '').toString().trim(),
          url: (s.url ?? '').toString().trim(),
        }))
        .filter((s) => s.platform && s.url)
    : [];

  const cleanPhones: string[] = Array.isArray(phones)
    ? phones.map((p: unknown) => (p ?? '').toString().trim()).filter(Boolean)
    : [];

  const setFields = {
    key: 'about' as const,
    title: (title ?? '').trim(),
    intro: (intro ?? '').trim(),
    content: content ?? '',
    image: image ?? '',
    socials: cleanSocials,
    phones: cleanPhones,
    updatedAt: new Date().toISOString(),
  };

  await db.collection('settings').updateOne({ key: 'about' }, { $set: setFields }, { upsert: true });
  return NextResponse.json({ about: setFields });
}
