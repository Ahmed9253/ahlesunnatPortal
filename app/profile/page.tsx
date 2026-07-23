'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/auth-provider';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
      setName(user.name);
      setBio(user.bio || '');
    }
  }, [user, loading, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio }),
      });
      if (res.ok) {
        await refresh();
        setMsg('Profile updated!');
      } else {
        const d = await res.json();
        setMsg(d.error || 'Failed to update');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12 px-4">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-6 sm:mb-8">Your Profile</h1>

        <div className="rounded-xl border border-white/10 bg-card/80 p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-4">
            <div className="relative group">
              <div className="h-16 w-16 rounded-full bg-cyan-500/20 flex items-center justify-center text-2xl font-bold text-cyan-400 overflow-hidden">
                {user.avatar ? <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" /> : user.name.charAt(0).toUpperCase()}
              </div>
              <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.append('file', file);
                  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
                  if (res.ok) {
                    const d = await res.json();
                    await fetch('/api/auth/profile', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ avatar: d.url }),
                    });
                    refresh();
                  }
                }} />
              </label>
            </div>
            <div>
              <p className="font-bold text-foreground">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-[10px] text-muted-foreground/70">Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-muted-foreground">Display Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required minLength={2}
                className="w-full rounded-lg border border-white/10 bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-cyan-400" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-muted-foreground">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Tell us about yourself..."
                className="w-full rounded-lg border border-white/10 bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-cyan-400 resize-none" />
            </div>
            {msg && <p className={`text-sm ${msg.includes('updated') ? 'text-emerald-400' : 'text-red-400'}`}>{msg}</p>}
            <button disabled={saving} className="cursor-pointer w-full rounded-lg bg-cyan-500 py-3 text-sm font-bold text-zinc-950 hover:bg-cyan-400 disabled:opacity-40">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <Link href="/" className="mt-4 block cursor-pointer text-center text-sm text-muted-foreground hover:text-foreground">← Back to Home</Link>
      </div>
    </div>
  );
}
