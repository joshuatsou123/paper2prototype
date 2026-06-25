import { describe, it, expect } from '@jest/globals';
import { formatDate, parseJsonField } from '../src/lib/utils';

describe('formatDate', () => {
  it('formats a Date object to a readable string', () => {
    const date = new Date('2025-03-15T14:30:00Z');
    const result = formatDate(date);
    expect(result).toContain('2025');
    expect(result).toContain('Mar');
    expect(result).toContain('15');
  });

  it('handles an ISO date string', () => {
    const result = formatDate('2025-06-15T12:00:00Z');
    expect(result).toContain('2025');
    expect(result).toContain('Jun');
  });
});

describe('parseJsonField', () => {
  it('parses a valid JSON string into an array', () => {
    const json = '["step 1","step 2","step 3"]';
    const result = parseJsonField<string[]>(json, []);
    expect(result).toEqual(['step 1', 'step 2', 'step 3']);
  });

  it('returns fallback for invalid JSON', () => {
    const result = parseJsonField<string[]>('not json', []);
    expect(result).toEqual([]);
  });

  it('returns fallback for empty string', () => {
    const result = parseJsonField<string[]>('', ['default']);
    expect(result).toEqual(['default']);
  });

  it('parses nested objects', () => {
    const json = '{"key": "value"}';
    const result = parseJsonField<Record<string, string>>(json, {});
    expect(result).toEqual({ key: 'value' });
  });
});
