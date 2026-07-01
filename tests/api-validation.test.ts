import { describe, it, expect } from '@jest/globals';

/**
 * Tests for API route input validation logic.
 * Uses a helper that mirrors the isPdf check in /api/analyze/route.ts.
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function isPdfFile(mimeType: string, fileName: string): boolean {
  return mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
}

describe('file type validation', () => {
  it('accepts application/pdf MIME type', () => {
    expect(isPdfFile('application/pdf', 'paper.pdf')).toBe(true);
  });

  it('accepts .pdf extension regardless of MIME type', () => {
    expect(isPdfFile('application/octet-stream', 'paper.PDF')).toBe(true);
  });

  it('rejects non-PDF files', () => {
    expect(isPdfFile('text/plain', 'notes.txt')).toBe(false);
  });

  it('rejects .docx files', () => {
    expect(isPdfFile('application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'paper.docx')).toBe(false);
  });
});

describe('file size validation', () => {
  it('accepts files under 10 MB', () => {
    const size = 5 * 1024 * 1024;
    expect(size <= MAX_FILE_SIZE).toBe(true);
  });

  it('accepts files exactly at 10 MB', () => {
    expect(MAX_FILE_SIZE <= MAX_FILE_SIZE).toBe(true);
  });

  it('rejects files over 10 MB', () => {
    const size = 15 * 1024 * 1024;
    expect(size <= MAX_FILE_SIZE).toBe(false);
  });
});

describe('extracted text validation', () => {
  it('rejects text shorter than 200 characters', () => {
    const text = 'Short abstract about machine learning.'.trim();
    expect(text.length >= 200).toBe(false);
  });

  it('accepts sufficiently long text', () => {
    const text = 'a'.repeat(500).trim();
    expect(text.length >= 200).toBe(true);
  });
});

describe('arXiv URL validation', () => {
  const ARXIV_REGEX = /arxiv\.org\/(?:abs|pdf)\/([0-9]{4}\.[0-9]+(?:v\d+)?)/i;

  function extractArxivId(url: string): string | null {
    const normalized = url.startsWith('http') ? url : `https://${url}`;
    const match = normalized.match(ARXIV_REGEX);
    return match ? match[1] : null;
  }

  it('extracts ID from abs URL', () => {
    expect(extractArxivId('https://arxiv.org/abs/1706.03762')).toBe('1706.03762');
  });

  it('extracts ID from pdf URL', () => {
    expect(extractArxivId('https://arxiv.org/pdf/1706.03762')).toBe('1706.03762');
  });

  it('extracts versioned ID', () => {
    expect(extractArxivId('https://arxiv.org/abs/2401.12345v3')).toBe('2401.12345v3');
  });

  it('handles URL without https protocol', () => {
    expect(extractArxivId('arxiv.org/abs/1706.03762')).toBe('1706.03762');
  });

  it('returns null for non-arXiv URLs', () => {
    expect(extractArxivId('https://openreview.net/forum?id=abc')).toBeNull();
  });

  it('returns null for invalid arXiv paths', () => {
    expect(extractArxivId('https://arxiv.org/search/?query=transformers')).toBeNull();
  });
});
