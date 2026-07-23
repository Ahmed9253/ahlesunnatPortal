import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/mongodb';
import { stripMongoId } from '@/lib/types';
import type { Question } from '@/lib/types';
import { ArrowLeft, CheckCircle, Clock, Star, MessageCircleQuestion, User } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ZoomableImage from '@/components/ui/zoomable-image';
import QuestionComments from '@/components/questions/question-comments';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  if (!db) return {};
  const q = await db.collection<Question>('questions').findOne({ id });
  if (!q) return {};
  return { title: `${q.title} | Ahlesunnat Portal Q&A`, description: q.content };
}

export default async function QuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  if (!db) notFound();

  const q = await db.collection<Question>('questions').findOne({ id });
  if (!q) notFound();

  const question = stripMongoId(q);

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8 px-4">
      <div className="mx-auto max-w-3xl">
        <Link href="/qa" className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} /> Back to Q&A
        </Link>

        {/* Question Section */}
        <div className="rounded-xl border border-white/10 bg-card/80 p-4 sm:p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-400">{question.category}</span>
            <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase ${question.status === 'answered' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
              {question.status === 'answered' ? <><CheckCircle size={10} /> Answered</> : <><Clock size={10} /> Pending</>}
            </span>
            {question.starred && <Star size={14} className="fill-yellow-400 text-yellow-400" />}
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">{question.title}</h1>

          <div className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
              {question.userAvatar ? <img src={question.userAvatar} alt="" className="h-full w-full rounded-full object-cover" /> : question.userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{question.userName}</p>
              <p className="text-[10px] text-muted-foreground/70">{new Date(question.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 text-sm sm:text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">{question.content}</div>

          {question.images && question.images.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {question.images.map((img, i) => (
                <ZoomableImage key={i} src={img} alt={`Attached image ${i + 1}`} className="max-h-48 rounded-lg" />
              ))}
            </div>
          )}
        </div>

        {/* Admin Answer Section */}
        {question.adminAnswer && (
          <div className="mt-6 rounded-xl border border-cyan-400/30 bg-cyan-400/5 p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <MessageCircleQuestion size={16} className="text-cyan-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-cyan-400">Answer from the Scholar</h2>
                <p className="text-[10px] text-muted-foreground/70">
                  {new Date(question.adminAnswer.answeredAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="prose-dark">
              <Markdown remarkPlugins={[remarkGfm]}>{question.adminAnswer.content}</Markdown>
            </div>
          </div>
        )}

        {!question.adminAnswer && (
          <div className="mt-6 rounded-xl border border-dashed border-white/10 p-6 sm:p-8 text-center text-muted-foreground">
            <Clock size={32} className="mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm font-medium">Awaiting Answer</p>
            <p className="mt-1 text-xs text-muted-foreground/70">This question is awaiting a response from our scholars.</p>
          </div>
        )}

        {/* Discussion / Comments Section */}
        <div className="mt-8 border-t border-white/10 pt-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <User size={18} className="text-muted-foreground" />
            Discussion
          </h2>
          <QuestionComments questionId={question.id} />
        </div>
      </div>
    </div>
  );
}
