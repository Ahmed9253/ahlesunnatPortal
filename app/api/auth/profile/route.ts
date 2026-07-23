import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, updateUserProfile } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { name, bio, avatar } = await req.json();
    const updates: { name?: string; bio?: string; avatar?: string } = {};
    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;

    const updated = await updateUserProfile(currentUser.id, updates);
    return NextResponse.json({ user: updated });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Update failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
