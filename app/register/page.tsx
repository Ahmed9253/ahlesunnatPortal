'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/layout/auth-provider';

export default function RegisterPage() {
  const { user, refresh } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) router.push('/'); }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) {
        await refresh();
        router.push('/');
      } else {
        const d = await res.json();
        setError(d.error || 'Registration failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-center mb-2">Create Account</h1>
        <p className="text-center text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8">Join the Ahlesunnat Portal community</p>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-white/10 bg-card/80 p-6 sm:p-8">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-muted-foreground">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required minLength={2}
              className="w-full rounded-lg border border-white/10 bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-cyan-400" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-muted-foreground">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full rounded-lg border border-white/10 bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-cyan-400" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-muted-foreground">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full rounded-lg border border-white/10 bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-cyan-400" />
            <p className="mt-1 text-[10px] text-muted-foreground/70">Minimum 6 characters</p>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button disabled={loading} className="cursor-pointer w-full rounded-lg bg-cyan-500 py-3 text-sm font-bold text-zinc-950 hover:bg-cyan-400 disabled:opacity-40">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="cursor-pointer text-cyan-400 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
