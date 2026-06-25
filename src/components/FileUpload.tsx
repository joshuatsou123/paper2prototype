'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type UploadStatus = 'idle' | 'selected' | 'uploading' | 'error';

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const selectFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith('.pdf') && f.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      setStatus('error');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size is 10 MB.');
      setStatus('error');
      return;
    }
    setFile(f);
    setError('');
    setStatus('selected');
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) selectFile(dropped);
    },
    [selectFile]
  );

  const handleAnalyze = async () => {
    if (!file) return;
    setStatus('uploading');
    setError('');

    const steps = [
      'Extracting text from PDF…',
      'Analyzing with Claude…',
      'Building prototype plan…',
      'Saving results…',
    ];
    let i = 0;
    setProgress(steps[0]);
    const interval = setInterval(() => {
      i = Math.min(i + 1, steps.length - 1);
      setProgress(steps[i]);
    }, 8000);

    try {
      const form = new FormData();
      form.append('file', file);

      const res = await fetch('/api/analyze', { method: 'POST', body: form });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Analysis failed');

      clearInterval(interval);
      router.push(`/result/${data.id}`);
    } catch (err) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStatus('selected');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Drop zone */}
      <div
        onClick={() => status !== 'uploading' && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={cn(
          'relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 text-center transition-all cursor-pointer',
          dragOver
            ? 'border-brand-500 bg-brand-50'
            : file
            ? 'border-brand-300 bg-brand-50/50'
            : 'border-slate-300 bg-slate-50 hover:border-brand-400 hover:bg-slate-100',
          status === 'uploading' && 'pointer-events-none opacity-80'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && selectFile(e.target.files[0])}
        />

        {status === 'uploading' ? (
          <>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
              <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Processing your paper…</p>
              <p className="mt-1 text-sm text-slate-500">{progress}</p>
              <p className="mt-1 text-xs text-slate-400">This can take up to 60 seconds</p>
            </div>
          </>
        ) : file ? (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
              <FileText className="h-8 w-8 text-brand-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 break-all">{file.name}</p>
              <p className="mt-1 text-sm text-slate-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB — ready to analyze
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); setStatus('idle'); }}
              className="absolute right-3 top-3 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200">
              <Upload className="h-8 w-8 text-slate-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Drop your PDF here</p>
              <p className="mt-1 text-sm text-slate-500">or click to browse — max 10 MB</p>
            </div>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* CTA */}
      <Button
        onClick={handleAnalyze}
        disabled={!file || status === 'uploading'}
        size="lg"
        className="w-full"
      >
        {status === 'uploading' ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Generating Prototype Plan…
          </>
        ) : (
          'Generate Prototype Plan'
        )}
      </Button>
    </div>
  );
}
