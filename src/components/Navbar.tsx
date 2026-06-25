import Link from 'next/link';
import { Brain } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-slate-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span>Paper<span className="text-brand-600">2</span>Prototype</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/upload"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            Upload
          </Link>
          <Link
            href="/history"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            History
          </Link>
          <Link
            href="/upload"
            className="ml-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            New Paper
          </Link>
        </div>
      </div>
    </nav>
  );
}
