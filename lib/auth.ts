import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { getDb } from './mongodb';
import type { User, UserProfile } from './types';
import { toUserProfile } from './types';
import { ObjectId } from 'mongodb';
import { randomUUID } from 'node:crypto';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-me');
const SESSION_COOKIE = 'ahlesunnat_session';
const SESSION_AGE = 60 * 60 * 24 * 7; // 7 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: UserProfile): Promise<string> {
  return new SignJWT({ userId: user.id, email: user.email, name: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_AGE}s`)
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<{ userId: string; email: string; name: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { userId: payload.userId as string, email: payload.email as string, name: payload.name as string };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const db = await getDb();
  if (!db) return null;

  const user = await db.collection<User>('users').findOne({ id: payload.userId });
  if (!user) return null;

  return toUserProfile(user);
}

export async function setCurrentUser(user: UserProfile) {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_AGE,
  });
}

export async function clearCurrentUser() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function registerUser(name: string, email: string, password: string): Promise<UserProfile> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const existing = await db.collection<User>('users').findOne({ email: email.toLowerCase() });
  if (existing) throw new Error('Email already registered');

  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();
  const user: User = {
    id: randomUUID(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    avatar: '',
    bio: '',
    role: 'user',
    createdAt: now,
    updatedAt: now,
  };

  await db.collection('users').insertOne(user);
  return toUserProfile(user);
}

export async function loginUser(email: string, password: string): Promise<UserProfile> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const user = await db.collection<User>('users').findOne({ email: email.toLowerCase() });
  if (!user) throw new Error('Invalid email or password');

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw new Error('Invalid email or password');

  return toUserProfile(user);
}

export async function updateUserProfile(userId: string, updates: { name?: string; bio?: string; avatar?: string }): Promise<UserProfile | null> {
  const db = await getDb();
  if (!db) return null;

  const setFields: Record<string, string> = { updatedAt: new Date().toISOString() };
  if (updates.name !== undefined) setFields.name = updates.name.trim();
  if (updates.bio !== undefined) setFields.bio = updates.bio;
  if (updates.avatar !== undefined) setFields.avatar = updates.avatar;

  await db.collection('users').updateOne({ id: userId }, { $set: setFields });

  const user = await db.collection<User>('users').findOne({ id: userId });
  return user ? toUserProfile(user) : null;
}

export { SESSION_COOKIE };
