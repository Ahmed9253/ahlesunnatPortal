'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const d = await res.json();
        setError(d.error || 'Invalid password');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 sm:mb-8 block text-center text-xs sm:text-sm text-muted-foreground hover:text-foreground cursor-pointer">← Back to Site</Link>
        <div className="rounded-xl border border-white/10 bg-card/80 p-6 sm:p-8 text-center">
          <Shield size={28} className="mx-auto mb-3 sm:mb-4 text-cyan-400" />
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1">Admin Panel</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">Enter admin password to continue</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus
              placeholder="Password"
              className="w-full rounded-lg border border-white/10 bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-cyan-400 text-center" />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button disabled={loading} className="cursor-pointer w-full rounded-lg bg-cyan-500 py-3 text-sm font-bold text-zinc-950 hover:bg-cyan-400 disabled:opacity-40">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
