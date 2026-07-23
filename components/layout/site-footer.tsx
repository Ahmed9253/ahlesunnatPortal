import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <div className="flex flex-col items-center gap-4 sm:gap-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Ahlesunnat Portal" className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg object-cover" />
            <span className="text-base sm:text-lg font-bold text-cyan-400">Ahlesunnat Portal</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
            <Link href="/articles" className="cursor-pointer hover:text-foreground transition-colors">Articles</Link>
            <Link href="/qa" className="cursor-pointer hover:text-foreground transition-colors">Q&A Forum</Link>
            <Link href="/login" className="cursor-pointer hover:text-foreground transition-colors">Login</Link>
            <Link href="/admin" className="cursor-pointer flex items-center gap-1 hover:text-foreground transition-colors">
              <Shield size={14} /> Admin
            </Link>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground/70">© 2026 Ahlesunnat Portal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
