import { NextRequest, NextResponse } from 'next/server';
import { registerUser, setCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }
    if (typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const user = await registerUser(name, email, password);
    await setCurrentUser(user);
    return NextResponse.json({ user }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Registration failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
