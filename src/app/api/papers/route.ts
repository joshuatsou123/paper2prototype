import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
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
    return NextResponse.json(papers);
  } catch (err) {
    console.error('Error fetching papers:', err);
    return NextResponse.json({ error: 'Failed to fetch papers.' }, { status: 500 });
  }
}
