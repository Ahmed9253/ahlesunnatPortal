import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'ahlesunnat_admin';
const SESSION_AGE = 60 * 60 * 24 * 7;

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
}

export function checkPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected && safeEqual(password, expected));
}

export function createSession() {
  const expires = String(Math.floor(Date.now() / 1000) + SESSION_AGE);
  const signature = createHmac('sha256', secret()).update(expires).digest('base64url');
  return `${expires}.${signature}`;
}

export async function isAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !secret()) return false;
  const [expires, signature] = token.split('.');
  if (!expires || !signature || Number(expires) < Date.now() / 1000) return false;
  const expected = createHmac('sha256', secret()).update(expires).digest('base64url');
  return safeEqual(signature, expected);
}

export const sessionCookieOptions = {
  httpOnly: true, sameSite: 'strict' as const, secure: process.env.NODE_ENV === 'production',
  path: '/', maxAge: SESSION_AGE,
};