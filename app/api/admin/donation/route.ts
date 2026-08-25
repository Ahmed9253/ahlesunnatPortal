import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getDb } from '@/lib/mongodb';
import { stripMongoId, DEFAULT_DONATION } from '@/lib/types';
import type { DonationContent, DonationAccount, DonationField } from '@/lib/types';
import { randomUUID } from 'node:crypto';

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

  const doc = await db.collection<DonationContent>('settings').findOne({ key: 'donation' });
  return NextResponse.json({ donation: doc ? stripMongoId(doc) : DEFAULT_DONATION });
}

export async function PUT(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

  const body = await req.json();
  const { enabled, title, description, accounts } = body;

  const cleanAccounts: DonationAccount[] = Array.isArray(accounts)
    ? accounts.map((a: Partial<DonationAccount>): DonationAccount => ({
        id: a.id || randomUUID(),
        method: (a.method ?? '').toString().trim(),
        holder: (a.holder ?? '').toString().trim(),
        fields: Array.isArray(a.fields)
          ? a.fields
              .map((f: Partial<DonationField>): DonationField => ({
                label: (f.label ?? '').toString().trim(),
                value: (f.value ?? '').toString().trim(),
              }))
              .filter((f) => f.label || f.value)
          : [],
      }))
    : [];

  const setFields = {
    key: 'donation' as const,
    enabled: enabled !== false,
    title: (title ?? '').trim() || 'Support Our Work',
    description: (description ?? '').trim(),
    accounts: cleanAccounts,
    updatedAt: new Date().toISOString(),
  };

  await db.collection('settings').updateOne({ key: 'donation' }, { $set: setFields }, { upsert: true });
  return NextResponse.json({ donation: setFields });
}
