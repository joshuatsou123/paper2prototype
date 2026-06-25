import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, FileText } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ResultTabs } from '@/components/ResultTabs';
import type { PaperResult } from '@/types/paper';

interface Props {
  params: Promise<{ id: string }>;
}

function difficultyVariant(score: string) {
  const s = score.toLowerCase();
  if (s === 'easy') return 'easy' as const;
  if (s === 'hard') return 'hard' as const;
  return 'medium' as const;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const paper = await prisma.paperResult.findUnique({ where: { id } });
  return { title: paper ? `${paper.title} — Paper2Prototype` : 'Result' };
}

export default async function ResultPage({ params }: Props) {
  const { id } = await params;
  const paper = await prisma.paperResult.findUnique({ where: { id } });

  if (!paper) notFound();

  const paperData = paper as unknown as PaperResult;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Back */}
      <Link
        href="/history"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to history
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl leading-tight">
              {paper.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {paper.originalFileName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(paper.createdAt)}
              </span>
            </div>
          </div>
          <Badge variant={difficultyVariant(paper.difficultyScore)} className="text-sm px-3 py-1 shrink-0">
            {paper.difficultyScore} Difficulty
          </Badge>
        </div>

        {/* Quick summary bar */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 leading-relaxed">
          <span className="font-semibold text-slate-900">TL;DR — </span>
          {paper.summary}
        </div>
      </div>

      {/* Tabs */}
      <ResultTabs paper={paperData} />
    </div>
  );
}
