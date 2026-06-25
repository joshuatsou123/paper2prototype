import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const paper = await prisma.paperResult.findUnique({ where: { id } });
    if (!paper) return NextResponse.json({ error: 'Paper not found.' }, { status: 404 });
    return NextResponse.json(paper);
  } catch (err) {
    console.error('Error fetching paper:', err);
    return NextResponse.json({ error: 'Failed to fetch paper.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.paperResult.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting paper:', err);
    return NextResponse.json({ error: 'Failed to delete paper.' }, { status: 500 });
  }
}
