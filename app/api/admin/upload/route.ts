import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { isAdmin } from '@/lib/admin-auth';
import { isCloudinaryConfigured, uploadToCloudinary } from '@/lib/cloudinary';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'File type not allowed. Use JPEG, PNG, WebP, GIF, or SVG.' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${randomUUID()}.${ext}`;

  if (isCloudinaryConfigured()) {
    const url = await uploadToCloudinary(buffer, filename.replace(`.${ext}`, ''));
    return NextResponse.json({ url }, { status: 201 });
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const filepath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(filepath, buffer);

  const url = `/uploads/${filename}`;
  return NextResponse.json({ url }, { status: 201 });
}
