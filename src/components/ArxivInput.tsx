'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link2, Loader2, AlertCircle, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Status = 'idle' | 'valid' | 'invalid' | 'loading' | 'error';

const ARXIV_REGEX = /arxiv\.org\/(?:abs|pdf)\/([0-9]{4}\.[0-9]+(?:v\d+)?)/i;

function parseArxivId(url: string): string | null {
  const normalized = url.startsWith('http') ? url : `https://${url}`;
  const match = normalized.match(ARXIV_REGEX);
  return match ? match[1] : null;
}

const PROGRESS_STEPS = [
  'Fetching PDF from arXiv…',
  'Extracting paper text…',
  'Analyzing with Claude…',
  'Building prototype plan…',
  'Saving results…',
];

export function ArxivInput() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const router = useRouter();

  const arxivId = parseArxivId(url);

  const handleChange = (value: string) => {
    setUrl(value);
    setError('');
    if (!value.trim()) {
      setStatus('idle');
    } else if (parseArxivId(value)) {
      setStatus('valid');
    } else {
      setStatus(value.length > 10 ? 'invalid' : 'idle');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arxivId || status === 'loading') return;

    setStatus('loading');
    setError('');
    setProgress(PROGRESS_STEPS[0]);

    let step = 0;
    const interval = setInterval(() => {
      step = Math.min(step + 1, PROGRESS_STEPS.length - 1);
      setProgress(PROGRESS_STEPS[step]);
    }, 9000);

    try {
      const res = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Analysis failed');

      clearInterval(interval);
      router.push(`/result/${data.id}`);
    } catch (err) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  const isLoading = status === 'loading';

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-4">
      {/* URL input */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">arXiv paper URL</label>
        <div className="relative">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={url}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="https://arxiv.org/abs/1706.03762"
            disabled={isLoading}
            autoComplete="off"
            spellCheck={false}
            className={cn(
              'w-full rounded-xl border bg-white pl-9 pr-10 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition-all',
              'focus:ring-2',
              isLoading
                ? 'opacity-60 cursor-not-allowed border-slate-300'
                : status === 'valid'
                ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20'
                : status === 'invalid'
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-slate-300 hover:border-slate-400 focus:border-brand-500 focus:ring-brand-500/20'
            )}
          />
          {/* Inline validation icon */}
          {status === 'valid' && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
          )}
        </div>

        {/* Detected paper ID or hint */}
        {status === 'valid' && arxivId ? (
          <p className="flex items-center gap-1 text-xs text-emerald-600">
            <CheckCircle2 className="h-3 w-3" />
            Detected paper ID: <span className="font-mono font-semibold">{arxivId}</span>
          </p>
        ) : status === 'invalid' ? (
          <p className="text-xs text-red-500">
            Not a valid arXiv URL. Try: https://arxiv.org/abs/XXXX.XXXXX
          </p>
        ) : (
          <p className="flex items-center gap-1 text-xs text-slate-400">
            <ExternalLink className="h-3 w-3" />
            Supports arxiv.org/abs/… and arxiv.org/pdf/… URLs
          </p>
        )}
      </div>

      {/* Loading progress */}
      {isLoading && (
        <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-brand-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            {progress}
          </div>
          <p className="mt-1 text-xs text-brand-500">This can take up to 60 seconds</p>
        </div>
      )}

      {/* Error */}
      {(status === 'error') && error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={status !== 'valid' || isLoading}
        size="lg"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing…
          </>
        ) : (
          'Analyze from arXiv'
        )}
      </Button>
    </form>
  );
}
