'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from './auth-provider';
import { Menu, X, User, LogOut } from 'lucide-react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/articles', label: 'Articles' },
  { href: '/qa', label: 'Q&A Forum' },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex cursor-pointer items-center gap-2">
          <img src="/logo.png" alt="Ahlesunnat Portal" className="h-8 w-8 rounded-lg object-cover" />
          <span className="hidden sm:inline text-lg font-bold text-cyan-400">Ahlesunnat Portal</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href))
                  ? 'bg-white/10 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link href="/ask" className="cursor-pointer rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-cyan-400">
                Ask Question
              </Link>
              <Link href="/profile" className="cursor-pointer flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">
                <User size={16} />
                {user.name}
              </Link>
              <button onClick={logout} className="cursor-pointer rounded-lg p-2 text-muted-foreground hover:text-red-400">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">
                Login
              </Link>
              <Link href="/register" className="cursor-pointer rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-cyan-400">
                Register
              </Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="cursor-pointer md:hidden p-2 text-muted-foreground">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium ${
                  pathname === l.href ? 'bg-white/10 text-foreground' : 'text-muted-foreground'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <hr className="my-2 border-white/10" />
            {user ? (
              <>
                <Link href="/ask" onClick={() => setOpen(false)} className="cursor-pointer rounded-lg bg-cyan-500 px-3 py-2.5 text-center text-xs font-bold text-zinc-950">
                  Ask Question
                </Link>
                <Link href="/profile" onClick={() => setOpen(false)} className="cursor-pointer rounded-lg px-3 py-2.5 text-sm text-muted-foreground">
                  Profile
                </Link>
                <button onClick={() => { logout(); setOpen(false); }} className="cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm text-red-400">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="cursor-pointer rounded-lg px-3 py-2.5 text-sm text-muted-foreground">
                  Login
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="cursor-pointer rounded-lg bg-cyan-500 px-3 py-2.5 text-center text-xs font-bold text-zinc-950">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
