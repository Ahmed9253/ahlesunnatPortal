import { NextResponse } from 'next/server';
import { checkPassword, createSession, SESSION_COOKIE, sessionCookieOptions } from '@/lib/admin-auth';

export async function POST(request: Request) {
  const { password } = await request.json();
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Admin login is not configured.' }, { status: 503 });
  }
  if (typeof password !== 'string' || !checkPassword(password)) {
    return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, createSession(), sessionCookieOptions);
  return response;
}