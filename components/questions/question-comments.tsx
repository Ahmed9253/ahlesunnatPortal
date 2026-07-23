'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/layout/auth-provider';
import type { QuestionComment } from '@/lib/types';
import { Star, MessageCircle } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function QuestionComments({ questionId }: { questionId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<QuestionComment[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/questions/${questionId}/comments`)
      .then(r => r.json())
      .then(d => setComments(d.comments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [questionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/questions/${questionId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const d = await res.json();
        setComments(prev => [d.comment, ...prev]);
        setContent('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-8 text-center text-muted-foreground/70">Loading comments...</div>;

  return (
    <div>
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts or follow-up..."
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-cyan-400 resize-none"
          />
          <button disabled={!content.trim() || submitting} className="mt-2 cursor-pointer rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-cyan-400 disabled:opacity-40">
            {submitting ? 'Posting...' : 'Post Reply'}
          </button>
        </form>
      ) : (
        <p className="mb-6 text-sm text-muted-foreground"><a href="/login" className="cursor-pointer text-cyan-400 hover:underline">Login</a> to leave a reply.</p>
      )}

      {comments.length === 0 ? (
        <p className="py-6 text-center text-muted-foreground/70 flex items-center justify-center gap-2"><MessageCircle size={16} /> No replies yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className={`rounded-xl border p-3 sm:p-4 ${c.isAdminReply ? 'border-cyan-400/30 bg-cyan-400/5' : 'border-white/10 bg-card/80'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {c.userAvatar ? <img src={c.userAvatar} alt="" className="h-full w-full rounded-full object-cover" /> : c.userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-foreground">{c.userName}</span>
                {c.isAdminReply && <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-cyan-400">Admin</span>}
                {c.starred && <Star size={12} className="fill-yellow-400 text-yellow-400" />}
                <span className="ml-auto text-[10px] text-muted-foreground/70">{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="text-sm text-muted-foreground prose-dark">
                <Markdown remarkPlugins={[remarkGfm]}>{c.content}</Markdown>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
