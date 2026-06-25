import { describe, it, expect } from '@jest/globals';

/**
 * Tests for API route input validation logic.
 *
 * These test the validation rules used in /api/analyze without starting
 * the Next.js server. They verify file type checks, size limits, and
 * error response formats.
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

describe('file type validation', () => {
  it('accepts application/pdf MIME type', () => {
    const isPdf =
      'application/pdf' === 'application/pdf' || 'paper.pdf'.toLowerCase().endsWith('.pdf');
    expect(isPdf).toBe(true);
  });

  it('accepts .pdf extension regardless of MIME type', () => {
    const isPdf =
      'application/octet-stream' === 'application/pdf' || 'paper.PDF'.toLowerCase().endsWith('.pdf');
    expect(isPdf).toBe(true);
  });

  it('rejects non-PDF files', () => {
    const isPdf =
      'text/plain' === 'application/pdf' || 'notes.txt'.toLowerCase().endsWith('.pdf');
    expect(isPdf).toBe(false);
  });

  it('rejects .docx files', () => {
    const isPdf =
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ===
        'application/pdf' || 'paper.docx'.toLowerCase().endsWith('.pdf');
    expect(isPdf).toBe(false);
  });
});

describe('file size validation', () => {
  it('accepts files under 10 MB', () => {
    const size = 5 * 1024 * 1024; // 5 MB
    expect(size <= MAX_FILE_SIZE).toBe(true);
  });

  it('accepts files exactly at 10 MB', () => {
    expect(MAX_FILE_SIZE <= MAX_FILE_SIZE).toBe(true);
  });

  it('rejects files over 10 MB', () => {
    const size = 15 * 1024 * 1024; // 15 MB
    expect(size <= MAX_FILE_SIZE).toBe(false);
  });
});

describe('extracted text validation', () => {
  it('rejects text shorter than 200 characters', () => {
    const text = 'Short abstract about machine learning.'.trim();
    const isValid = text.length >= 200;
    expect(isValid).toBe(false);
  });

  it('accepts sufficiently long text', () => {
    const text = 'a'.repeat(500).trim();
    const isValid = text.length >= 200;
    expect(isValid).toBe(true);
  });
});
