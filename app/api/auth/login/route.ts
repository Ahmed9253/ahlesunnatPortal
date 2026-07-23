import { NextRequest, NextResponse } from 'next/server';
import { loginUser, setCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await loginUser(email, password);
    await setCurrentUser(user);
    return NextResponse.json({ user });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Login failed';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
