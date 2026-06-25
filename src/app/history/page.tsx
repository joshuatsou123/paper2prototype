import Link from 'next/link';
import { Calendar, FileText, ChevronRight, Upload } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'History — Paper2Prototype' };

// Revalidate on every visit so new papers show up immediately
export const dynamic = 'force-dynamic';

function DifficultyBadge({ score }: { score: string }) {
  const s = score.toLowerCase();
  const variant = s === 'easy' ? 'easy' : s === 'hard' ? 'hard' : 'medium';
  return <Badge variant={variant as 'easy' | 'medium' | 'hard'}>{score}</Badge>;
}

export default async function HistoryPage() {
  const papers = await prisma.paperResult.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      originalFileName: true,
      difficultyScore: true,
      summary: true,
      createdAt: true,
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Paper History</h1>
          <p className="mt-1 text-slate-500 text-sm">{papers.length} paper{papers.length !== 1 ? 's' : ''} analyzed</p>
        </div>
        <Link href="/upload">
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            New Paper
          </Button>
        </Link>
      </div>

      {papers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
          <FileText className="h-10 w-10 text-slate-300 mb-3" />
          <h2 className="font-semibold text-slate-700">No papers yet</h2>
          <p className="mt-1 text-sm text-slate-400">Upload your first AI/ML paper to get started.</p>
          <Link href="/upload" className="mt-6">
            <Button>Upload a Paper</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {papers.map((paper) => (
            <Link
              key={paper.id}
              href={`/result/${paper.id}`}
              className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-brand-300 hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 group-hover:bg-brand-100 transition-colors">
                <FileText className="h-5 w-5 text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-slate-900 group-hover:text-brand-700 transition-colors truncate">
                    {paper.title}
                  </h2>
                  <DifficultyBadge score={paper.difficultyScore} />
                </div>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">{paper.summary}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(paper.createdAt)}
                  </span>
                  <span className="truncate">{paper.originalFileName}</span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-300 shrink-0 mt-2 group-hover:text-brand-500 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
