'use client';

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  MessageCircleQuestion,
  Users,
  LogOut,
  Star,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Save,
  X,
  BarChart3,
  TrendingUp,
  Send,
  RefreshCw,
} from 'lucide-react';

type Stats = {
  totalArticles: number;
  totalUsers: number;
  totalQuestions: number;
  pendingQuestions: number;
  answeredQuestions: number;
  totalComments: number;
  starredArticles: number;
  starredQuestions: number;
};

type Tab = 'dashboard' | 'articles' | 'questions' | 'users';

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.reload();
  };

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'articles', label: 'Articles', icon: <FileText size={18} /> },
    { id: 'questions', label: 'Questions', icon: <MessageCircleQuestion size={18} /> },
    { id: 'users', label: 'Users', icon: <Users size={18} /> },
  ];

  const handleNavClick = (id: Tab) => {
    setTab(id);
    setMobileOpen(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed bottom-4 right-4 z-50 flex cursor-pointer items-center justify-center rounded-full bg-cyan-500 p-3 shadow-lg shadow-cyan-500/30 text-zinc-950 md:hidden"
      >
        <LayoutDashboard size={20} />
      </button>

      <aside
        className={`shrink-0 border-r border-white/10 bg-card/80 transition-all duration-300
          fixed inset-y-0 left-0 z-50 md:static md:z-auto
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${collapsed ? 'w-16' : 'w-56'}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-4">
            {!collapsed && (
              <span className="text-sm font-bold tracking-wide text-cyan-400">
                Admin Panel
              </span>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors hidden md:block"
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors md:hidden"
            >
              <X size={16} />
            </button>
          </div>
          <nav className="flex-1 space-y-1 p-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                  tab === item.id
                    ? 'bg-cyan-500 text-zinc-950 shadow-lg shadow-cyan-500/20'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                }`}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
          <div className="border-t border-white/10 p-2">
            <button
              onClick={logout}
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <LogOut size={18} />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
        {tab === 'dashboard' && <DashboardTab stats={stats} />}
        {tab === 'articles' && <ArticlesTab />}
        {tab === 'questions' && <QuestionsTab />}
        {tab === 'users' && <UsersTab />}
      </main>
    </div>
  );
}

function BarChart({
  data,
  title,
  colors,
}: {
  data: { label: string; value: number }[];
  title: string;
  colors: string[];
}) {
  const max = Math.max(...data.map(d => d.value), 1);
  const barWidth = 48;
  const gap = 24;
  const chartHeight = 180;
  const totalWidth = data.length * (barWidth + gap) + gap;
  const labelOffset = 60;

  return (
    <div className="rounded-xl border border-white/10 bg-card/80 p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 size={18} className="text-cyan-400" />
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${totalWidth} ${chartHeight + labelOffset}`} className="w-full min-w-[300px]" role="img">
          {/* Horizontal grid lines */}
          {[0.25, 0.5, 0.75, 1].map(frac => (
            <line
              key={frac}
              x1={gap}
              y1={chartHeight - frac * chartHeight + 10}
              x2={totalWidth - gap}
              y2={chartHeight - frac * chartHeight + 10}
              stroke="white"
              strokeOpacity={0.06}
              strokeDasharray="4 4"
            />
          ))}
          {data.map((d, i) => {
            const barH = (d.value / max) * chartHeight;
            const x = gap + i * (barWidth + gap);
            const y = chartHeight - barH + 10;
            const color = colors[i % colors.length];
            return (
              <g key={d.label}>
                <rect x={x} y={y} width={barWidth} height={barH} rx={8} fill={color} opacity={0.9} />
                <rect x={x} y={y} width={barWidth} height={Math.min(barH, 16)} rx={8} fill="white" opacity={0.15} />
                <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fill="white" fontSize={13} fontWeight={700}>
                  {d.value}
                </text>
                <text x={x + barWidth / 2} y={chartHeight + 30} textAnchor="middle" fill="#71717a" fontSize={10} fontWeight={500}>
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function DonutChart({
  data,
  title,
  colors,
}: {
  data: { label: string; value: number }[];
  title: string;
  colors: string[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const size = 160;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <div className="rounded-xl border border-white/10 bg-card/80 p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp size={18} className="text-cyan-400" />
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="white" strokeOpacity={0.06} strokeWidth={strokeWidth} />
          {data.map((d, i) => {
            const pct = d.value / total;
            const dashLen = pct * circumference;
            const dashOffset = -cumulative * circumference;
            cumulative += pct;
            return (
              <circle
                key={d.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={colors[i % colors.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                opacity={0.9}
              />
            );
          })}
          <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fill="white" fontSize={24} fontWeight={900}>
            {total}
          </text>
          <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fill="#71717a" fontSize={10} fontWeight={500}>
            Total
          </text>
        </svg>
        <div className="flex flex-wrap justify-center sm:flex-col sm:justify-start gap-3 sm:gap-2">
          {data.map((d, i) => (
            <div key={d.label} className="flex items-center gap-2 text-sm">
              <span className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
              <span className="text-muted-foreground">{d.label}</span>
              <span className="ml-auto font-bold text-foreground">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActivityList({ articles, questions }: { articles: { title: string; category: string; publishedAt: string }[]; questions: { title: string; category: string; status: string; createdAt: string }[] }) {
  const items = [
    ...articles.slice(0, 5).map(a => ({ type: 'article' as const, title: a.title, sub: a.category, date: a.publishedAt })),
    ...questions.slice(0, 5).map(q => ({ type: 'question' as const, title: q.title, sub: `${q.category} · ${q.status}`, date: q.createdAt })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

  return (
    <div className="rounded-xl border border-white/10 bg-card/80 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock size={18} className="text-cyan-400" />
        <h3 className="text-sm font-bold text-foreground">Recent Activity</h3>
      </div>
      <div className="space-y-4">
        {items.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${item.type === 'article' ? 'bg-cyan-400' : 'bg-violet-400'}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.sub} · {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardTab({ stats }: { stats: Stats | null }) {
  const [articles, setArticles] = useState<{ category: string; title: string; publishedAt: string }[]>([]);
  const [questions, setQuestions] = useState<{ status: string; title: string; category: string; createdAt: string }[]>([]);

  useEffect(() => {
    fetch('/api/articles?limit=100')
      .then(r => r.json())
      .then(d => setArticles(d.articles || []))
      .catch(() => {});
    fetch('/api/questions?limit=100')
      .then(r => r.json())
      .then(d => setQuestions(d.questions || []))
      .catch(() => {});
  }, []);

  const categoryCounts = articles.reduce(
    (acc, a) => { acc[a.category] = (acc[a.category] || 0) + 1; return acc; },
    {} as Record<string, number>,
  );
  const categoryData = Object.entries(categoryCounts).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);

  const statusCounts = questions.reduce(
    (acc, q) => { acc[q.status] = (acc[q.status] || 0) + 1; return acc; },
    {} as Record<string, number>,
  );
  const statusData = Object.entries(statusCounts).map(([label, value]) => ({ label, value }));

  const categoryColors = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];
  const statusColors = ['#f59e0b', '#10b981', '#ef4444'];

  if (!stats) return (
    <div className="flex items-center justify-center py-32 text-zinc-500">
      <RefreshCw size={20} className="animate-spin mr-2" />
      Loading stats...
    </div>
  );

  const statCards = [
    { label: 'Articles', value: stats.totalArticles, icon: <FileText size={18} />, color: 'text-cyan-300', bg: 'bg-cyan-500/15' },
    { label: 'Users', value: stats.totalUsers, icon: <Users size={18} />, color: 'text-violet-300', bg: 'bg-violet-500/15' },
    { label: 'Pending', value: stats.pendingQuestions, icon: <Clock size={18} />, color: 'text-amber-300', bg: 'bg-amber-500/15' },
    { label: 'Answered', value: stats.answeredQuestions, icon: <MessageCircleQuestion size={18} />, color: 'text-emerald-300', bg: 'bg-emerald-500/15' },
    { label: 'Comments', value: stats.totalComments, icon: <Eye size={18} />, color: 'text-rose-300', bg: 'bg-rose-500/15' },
    { label: 'Starred', value: stats.starredArticles, icon: <Star size={18} />, color: 'text-yellow-300', bg: 'bg-yellow-500/15' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">Dashboard</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6 mb-10">
        {statCards.map(c => (
          <div key={c.label} className="rounded-xl border border-white/10 bg-card/80 p-3 sm:p-5">
            <div className={`mb-2 sm:mb-3 inline-flex rounded-xl p-1.5 sm:p-2 ${c.bg} ${c.color}`}>{c.icon}</div>
            <p className="text-xl sm:text-2xl font-black text-foreground">{c.value}</p>
            <p className="mt-0.5 text-[10px] sm:text-xs font-medium text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {categoryData.length > 0 && <BarChart data={categoryData} title="Articles by Category" colors={categoryColors} />}
        {statusData.length > 0 && <DonutChart data={statusData} title="Questions by Status" colors={statusColors} />}
      </div>

      <ActivityList articles={articles} questions={questions} />
    </div>
  );
}

function ArticlesTab() {
  const [articles, setArticles] = useState<
    {
      id: string;
      title: string;
      excerpt: string;
      content: string;
      coverImage: string;
      category: string;
      starred: boolean;
      publishedAt: string;
      views: number;
    }[]
  >([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<{
    id: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage: string;
    category: string;
  } | null>(null);
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    category: 'General',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () =>
    fetch('/api/admin/stats')
      .then(() => {
        fetch('/api/articles?limit=100')
          .then(r => r.json())
          .then(d => setArticles(d.articles || []))
          .catch(() => {});
      });

  useEffect(() => {
    load();
  }, []);

  const categories = ['Tafseer', 'Hadith', 'Fiqh', 'Aqeedah', 'Seerah', 'General'];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      if (editing) {
        const res = await fetch('/api/admin/articles', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editing.id, ...form }),
        });
        if (res.ok) {
          setMsg('Article updated!');
          setEditing(null);
          setShowForm(false);
          load();
        } else {
          const d = await res.json();
          setMsg(d.error || 'Failed');
        }
      } else {
        const res = await fetch('/api/admin/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          setMsg('Article created!');
          setShowForm(false);
          setForm({ title: '', excerpt: '', content: '', coverImage: '', category: 'General' });
          load();
        } else {
          const d = await res.json();
          setMsg(d.error || 'Failed');
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    await fetch(`/api/admin/articles?id=${id}`, { method: 'DELETE' });
    load();
  };

  const toggleStar = async (id: string, starred: boolean) => {
    await fetch('/api/admin/articles', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, starred: !starred }),
    });
    load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <FileText size={24} className="text-cyan-400" />
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">Articles</h2>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditing(null);
            setForm({ title: '', excerpt: '', content: '', coverImage: '', category: 'General' });
          }}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-cyan-500 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-zinc-950 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? 'Cancel' : 'New Article'}
        </button>
      </div>

      {(showForm || editing) && (
        <form onSubmit={handleSave} className="mb-8 rounded-xl border border-white/10 bg-card/80 p-6 space-y-4">
          <h3 className="font-bold text-foreground">{editing ? 'Edit Article' : 'New Article'}</h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <input
              placeholder="Title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
              className="rounded-lg border border-white/10 bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-cyan-400 transition-colors"
            />
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="rounded-lg border border-white/10 bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-cyan-400 transition-colors"
            >
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <input
            placeholder="Excerpt"
            value={form.excerpt}
            onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-cyan-400 transition-colors"
          />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Cover Image</label>
            <div className="flex gap-2">
              <input
                placeholder="Image URL (or upload below)"
                value={form.coverImage}
                onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))}
                className="flex-1 rounded-lg border border-white/10 bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-cyan-400 transition-colors"
              />
              <label className="shrink-0 flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-card px-4 py-3 text-xs font-semibold text-muted-foreground hover:border-cyan-400 hover:text-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.append('file', file);
                    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
                    if (res.ok) {
                      const d = await res.json();
                      setForm(f => ({ ...f, coverImage: d.url }));
                    }
                  }}
                />
              </label>
            </div>
            {form.coverImage && (
              <img src={form.coverImage} alt="Cover preview" className="mt-2 h-20 rounded-lg object-cover" />
            )}
          </div>
          <textarea
            placeholder="Write your article content here..."
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={12}
            required
            className="w-full rounded-lg border border-white/10 bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-cyan-400 resize-y leading-relaxed transition-colors"
          />
          {msg && (
            <p className={`text-sm ${msg.includes('!') ? 'text-emerald-400' : 'text-red-400'}`}>{msg}</p>
          )}
          <button
            disabled={saving}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-cyan-500 px-6 py-3 text-sm font-bold text-zinc-950 hover:bg-cyan-400 disabled:opacity-40 transition-colors"
          >
            <Save size={14} />
            {saving ? 'Saving...' : editing ? 'Update' : 'Create Article'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {articles.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">No articles yet.</p>
        ) : (
          articles.map(a => (
            <div
              key={a.id}
              className="flex flex-wrap items-center gap-3 sm:gap-4 rounded-xl border border-white/10 bg-card/80 p-3 sm:p-4 hover:bg-muted/80 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm sm:text-base text-foreground truncate">{a.title}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {a.category} · {new Date(a.publishedAt).toLocaleDateString()} · {a.views} views
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => toggleStar(a.id, a.starred)}
                className={`cursor-pointer rounded-lg p-2 transition-colors ${
                  a.starred ? 'text-yellow-400 bg-yellow-400/10' : 'text-muted-foreground/70 hover:text-yellow-400 hover:bg-yellow-400/5'
                }`}
              >
                <Star size={16} className={a.starred ? 'fill-current' : ''} />
              </button>
              <button
                onClick={() => {
                  setEditing({
                    id: a.id,
                    title: a.title,
                    excerpt: a.excerpt || '',
                    content: a.content || '',
                    coverImage: a.coverImage || '',
                    category: a.category,
                  });
                  setShowForm(true);
                  setForm({
                    title: a.title,
                    excerpt: a.excerpt || '',
                    content: a.content || '',
                    coverImage: a.coverImage || '',
                    category: a.category,
                  });
                }}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-semibold text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
              >
                <Pencil size={12} />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={() => handleDelete(a.id)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Delete
              </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function QuestionsTab() {
  const [questions, setQuestions] = useState<
    {
      id: string;
      title: string;
      content: string;
      category: string;
      status: string;
      userName: string;
      starred: boolean;
      adminAnswer: { content: string; answeredAt: string } | null;
      createdAt: string;
    }[]
  >([]);
  const [answering, setAnswering] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () =>
    fetch('/api/questions?limit=100')
      .then(r => r.json())
      .then(d => setQuestions(d.questions || []))
      .catch(() => {});
  useEffect(() => {
    load();
  }, []);

  const handleAnswer = async (id: string) => {
    if (!answer.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      });
      if (res.ok) {
        setAnswering(null);
        setAnswer('');
        load();
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleStar = async (id: string, starred: boolean) => {
    await fetch(`/api/admin/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ starred: !starred }),
    });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <MessageCircleQuestion size={24} className="text-cyan-400" />
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">Questions</h2>
      </div>
      <div className="space-y-4">
        {questions.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">No questions yet.</p>
        ) : (
          questions.map(q => (
            <div
              key={q.id}
              className="rounded-xl border border-white/10 bg-card/80 p-3 sm:p-5 hover:bg-muted/80 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">{q.title}</h3>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase ${
                        q.status === 'answered'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{q.content}</p>
                  <p className="mt-2 text-[10px] sm:text-[11px] text-muted-foreground/70">
                    By {q.userName} · {q.category} · {new Date(q.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleStar(q.id, q.starred)}
                    className={`cursor-pointer rounded-lg p-1.5 sm:p-2 transition-colors ${
                      q.starred
                        ? 'text-yellow-400 bg-yellow-400/10'
                        : 'text-muted-foreground/70 hover:text-yellow-400 hover:bg-yellow-400/5'
                    }`}
                  >
                    <Star size={14} className={q.starred ? 'fill-current' : ''} />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {q.adminAnswer && (
                <div className="mt-4 rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-4">
                  <p className="text-[10px] font-bold uppercase text-cyan-400 mb-1">Your Answer</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{q.adminAnswer.content}</p>
                </div>
              )}

              {answering === q.id ? (
                <div className="mt-4">
                  <textarea
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    rows={4}
                    placeholder="Write your answer (Markdown supported)..."
            className="w-full rounded-lg border border-white/10 bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-cyan-400 resize-none font-mono transition-colors"
                  />
                  <div className="mt-3 flex gap-2">
                    <button
                      disabled={saving || !answer.trim()}
                      onClick={() => handleAnswer(q.id)}
                      className="flex cursor-pointer items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-cyan-400 disabled:opacity-40 transition-colors"
                    >
                      <Send size={12} />
                      {saving ? 'Saving...' : 'Submit Answer'}
                    </button>
                    <button
                      onClick={() => {
                        setAnswering(null);
                        setAnswer('');
                      }}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X size={12} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAnswering(q.id);
                    setAnswer(q.adminAnswer?.content || '');
                  }}
                  className="mt-4 flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-muted-foreground hover:border-cyan-400 hover:text-foreground transition-colors"
                >
                  <Pencil size={12} />
                  {q.adminAnswer ? 'Edit Answer' : 'Answer Question'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<
    { id: string; name: string; email: string; createdAt: string; bio: string }[]
  >([]);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => setUsers(d.users || []))
      .catch(() => {});
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user and all their content?')) return;
    await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
    setUsers(u => u.filter(x => x.id !== id));
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Users size={24} className="text-cyan-400" />
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">Users ({users.length})</h2>
      </div>
      <div className="space-y-3">
        {users.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">No registered users yet.</p>
        ) : (
          users.map(u => (
            <div
              key={u.id}
              className="flex items-center gap-3 sm:gap-4 rounded-xl border border-white/10 bg-card/80 p-3 sm:p-4 hover:bg-muted/80 transition-colors"
            >
              <div className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs sm:text-sm font-bold text-white">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm sm:text-base text-foreground truncate">{u.name}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{u.email}</p>
                {u.bio && (
                  <p className="text-[10px] sm:text-xs text-muted-foreground/70 line-clamp-1">{u.bio}</p>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground/70 shrink-0 hidden sm:inline">
                {new Date(u.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => handleDelete(u.id)}
                className="flex cursor-pointer items-center gap-1 rounded-lg px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
