'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/auth-provider';
import { QUESTION_CATEGORIES } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AskPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground mb-4">You need to be logged in to ask a question.</p>
        <Link href="/login" className="cursor-pointer rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-zinc-950">Login</Link>
      </div>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !category) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, category, images }),
      });
      if (res.ok) {
        const d = await res.json();
        router.push(`/qa/${d.question.id}`);
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to submit question');
      }
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <Link href="/qa" className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} /> Back to Q&A
        </Link>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">Ask a Question</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8">Submit your question and our scholars will respond In sha Allah.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-muted-foreground">Category</label>
            <div className="flex flex-wrap gap-2">
              {QUESTION_CATEGORIES.map((cat) => (
                <button key={cat} type="button" onClick={() => setCategory(cat)} className={`cursor-pointer rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${category === cat ? 'bg-cyan-500 text-zinc-950' : 'border border-white/15 text-muted-foreground hover:border-cyan-400'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-muted-foreground">Question Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. What is the ruling on..."
              className="w-full rounded-lg border border-white/10 bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-muted-foreground">Details</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide context and details about your question..."
              rows={6}
              className="w-full rounded-lg border border-white/10 bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-cyan-400 resize-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-muted-foreground">Attach Images (optional)</label>
            <div className="flex flex-wrap gap-2">
              {images.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} alt="" className="h-20 w-20 rounded-lg object-cover" />
                  <button type="button" onClick={() => setImages(imgs => imgs.filter((_, j) => j !== i))} className="cursor-pointer absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">✕</button>
                </div>
              ))}
              <label className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-white/20 text-muted-foreground hover:border-cyan-400 hover:text-cyan-400 cursor-pointer transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
                  const files = e.target.files;
                  if (!files) return;
                  for (const file of Array.from(files)) {
                    const fd = new FormData();
                    fd.append('file', file);
                    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
                    if (res.ok) { const d = await res.json(); setImages(imgs => [...imgs, d.url]); }
                  }
                }} />
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button disabled={!title.trim() || !content.trim() || !category || submitting} className="cursor-pointer w-full rounded-lg bg-cyan-500 py-3 text-sm font-bold text-zinc-950 hover:bg-cyan-400 disabled:opacity-40">
            {submitting ? 'Submitting...' : 'Submit Question'}
          </button>
        </form>
      </div>
    </div>
  );
}
