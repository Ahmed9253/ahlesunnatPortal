import Link from 'next/link';
import { getDb } from '@/lib/mongodb';
import { stripMongoId } from '@/lib/types';
import type { Question } from '@/lib/types';
import { QUESTION_CATEGORIES } from '@/lib/types';
import { MessageCircleQuestion, Clock, CheckCircle, Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function QAForumPage({ searchParams }: { searchParams: Promise<{ category?: string; status?: string }> }) {
  const params = await searchParams;
  const db = await getDb();
  let questions: Question[] = [];
  let total = 0;

  if (db) {
    const filter: Record<string, unknown> = {};
    if (params.category && params.category !== 'All') filter.category = params.category;
    if (params.status && params.status !== 'All') filter.status = params.status;

    const [docs, t] = await Promise.all([
      db.collection<Question>('questions').find(filter).sort({ createdAt: -1 }).limit(50).toArray(),
      db.collection<Question>('questions').countDocuments(filter),
    ]);
    questions = docs.map(stripMongoId);
    total = t;
  }

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 sm:mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">Q&A Forum</h1>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">Ask questions about Islam and get answers from our scholars. ({total} questions)</p>
          </div>
          <Link href="/ask" className="cursor-pointer rounded-lg bg-cyan-500 px-4 sm:px-5 py-2 text-xs font-bold text-zinc-950 hover:bg-cyan-400">
            Ask a Question
          </Link>
        </div>

        <div className="mb-6 sm:mb-8 flex flex-wrap gap-1.5 sm:gap-2">
          <Link href="/qa" className={`cursor-pointer rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${!params.category || params.category === 'All' ? 'bg-cyan-500 text-zinc-950' : 'border border-white/15 text-muted-foreground hover:border-cyan-400'}`}>
            All
          </Link>
          {QUESTION_CATEGORIES.map((cat) => (
            <Link key={cat} href={`/qa?category=${cat}`} className={`cursor-pointer rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${params.category === cat ? 'bg-cyan-500 text-zinc-950' : 'border border-white/15 text-muted-foreground hover:border-cyan-400'}`}>
              {cat}
            </Link>
          ))}
        </div>

        {questions.length === 0 ? (
          <div className="py-24 text-center">
            <MessageCircleQuestion size={48} className="mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No questions yet. Be the first to ask!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => (
              <Link key={q.id} href={`/qa/${q.id}`} className="group cursor-pointer flex items-start gap-3 sm:gap-4 rounded-xl border border-white/10 bg-card/80 p-3 sm:p-5 hover:border-cyan-400/30 transition-all">
                <MessageCircleQuestion size={18} className="mt-0.5 shrink-0 text-cyan-400" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-cyan-400 transition-colors truncate">{q.title}</h3>
                    {q.starred && <Star size={12} className="shrink-0 fill-yellow-400 text-yellow-400" />}
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-1">{q.content}</p>
                  <div className="mt-2 flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-cyan-400/70">{q.category}</span>
                    <span className={`flex items-center gap-1 ${q.status === 'answered' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                      {q.status === 'answered' ? <><CheckCircle size={10} /> Answered</> : <><Clock size={10} /> Pending</>}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
