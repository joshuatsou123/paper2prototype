import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzePaper } from '@/lib/analyze-paper';

// Allow up to 5 minutes for long papers (local dev has no limit)
export const maxDuration = 300;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    // — Validation —
    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      return NextResponse.json(
        { error: 'Only PDF files are supported. Please upload a .pdf file.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File is too large. Maximum allowed size is 10 MB.' },
        { status: 413 }
      );
    }

    // — PDF text extraction —
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Dynamic import avoids pdf-parse's startup file read in some environments
    const pdfParse = (await import('pdf-parse')).default;
    const pdfData = await pdfParse(buffer);

    const extractedText = pdfData.text?.trim() ?? '';
    if (extractedText.length < 200) {
      return NextResponse.json(
        {
          error:
            'Could not extract readable text from this PDF. It may be a scanned image or an encrypted document. Try a text-based PDF.',
        },
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
        { error: 'The AI analysis failed. Please try again or use a different paper.' },
        { status: 502 }
      );
    }

    // — Persist to database —
    const paper = await prisma.paperResult.create({
      data: {
        title: analysis.title || file.name.replace('.pdf', ''),
        originalFileName: file.name,
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
    console.error('Unexpected error in /api/analyze:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
