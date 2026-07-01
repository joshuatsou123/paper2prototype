import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzePaper } from '@/lib/analyze-paper';

export const maxDuration = 300;

/**
 * Extracts the arXiv paper ID from any valid arXiv URL variant.
 * Handles: arxiv.org/abs/XXXX.XXXXX, arxiv.org/pdf/XXXX.XXXXXvN, etc.
 */
function extractArxivId(rawUrl: string): string | null {
  const url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
  const match = url.match(/arxiv\.org\/(?:abs|pdf)\/([0-9]{4}\.[0-9]+(?:v\d+)?)/i);
  return match ? match[1] : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url: string = typeof body?.url === 'string' ? body.url.trim() : '';

    if (!url) {
      return NextResponse.json({ error: 'No URL provided.' }, { status: 400 });
    }

    const arxivId = extractArxivId(url);
    if (!arxivId) {
      return NextResponse.json(
        { error: 'Invalid arXiv URL. Expected format: https://arxiv.org/abs/XXXX.XXXXX' },
        { status: 400 }
      );
    }

    // — Fetch PDF from arXiv —
    const pdfUrl = `https://arxiv.org/pdf/${arxivId}.pdf`;
    let pdfBuffer: Buffer;

    try {
      const res = await fetch(pdfUrl, {
        headers: {
          // arXiv asks automated tools to identify themselves
          'User-Agent': 'Paper2Prototype/1.0 (academic paper analysis tool)',
        },
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) {
        return NextResponse.json(
          { error: `arXiv returned ${res.status}. The paper may not exist or is not yet available.` },
          { status: 502 }
        );
      }

      pdfBuffer = Buffer.from(await res.arrayBuffer());
    } catch (err) {
      console.error('arXiv fetch error:', err);
      return NextResponse.json(
        { error: 'Could not reach arXiv. Check your connection and try again.' },
        { status: 502 }
      );
    }

    // — PDF text extraction —
    const pdfParse = (await import('pdf-parse')).default;
    const pdfData = await pdfParse(pdfBuffer);

    const extractedText = pdfData.text?.trim() ?? '';
    if (extractedText.length < 200) {
      return NextResponse.json(
        { error: 'Could not extract readable text from this paper. It may be image-based.' },
        { status: 422 }
      );
    }

    // — LLM analysis —
    let analysis;
    try {
      analysis = await analyzePaper(extractedText);
    } catch (err) {
      console.error('LLM analysis error:', err);
      return NextResponse.json(
        { error: 'The AI analysis failed. Please try again.' },
        { status: 502 }
      );
    }

    // — Persist to database —
    const paper = await prisma.paperResult.create({
      data: {
        title: analysis.title || `arXiv:${arxivId}`,
        originalFileName: `arxiv:${arxivId}`,
        extractedTextPreview: extractedText.slice(0, 600),
        mainProblem: analysis.mainProblem || '',
        summary: analysis.simpleSummary || '',
        keyContribution: analysis.keyContribution || '',
        architecture: analysis.modelArchitecture || '',
        datasetRequirements: analysis.datasetRequirements || '',
        preprocessingSteps: analysis.preprocessingSteps || '',
        trainingProcedure: analysis.trainingProcedure || '',
        lossFunction: analysis.lossFunction || '',
        evaluationMetrics: analysis.evaluationMetrics || '',
        implementationChecklist: JSON.stringify(
          Array.isArray(analysis.implementationChecklist) ? analysis.implementationChecklist : []
        ),
        starterCode: analysis.starterCode || '',
        missingDetails: JSON.stringify(
          Array.isArray(analysis.missingDetails) ? analysis.missingDetails : []
        ),
        difficultyScore: analysis.difficultyScore || 'Medium',
        reasonForDifficulty: analysis.reasonForDifficulty || '',
      },
    });

    return NextResponse.json({ id: paper.id, success: true });
  } catch (err) {
    console.error('Unexpected error in /api/analyze-url:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
