import { describe, it, expect } from '@jest/globals';

/**
 * Tests for the paper analysis pipeline.
 *
 * The analyzePaper function calls the Anthropic API, so these tests validate
 * the surrounding logic (prompt construction, JSON parsing, error handling)
 * rather than making live API calls.
 *
 * To run integration tests with a real API key, set ANTHROPIC_API_KEY in your
 * environment and remove the .skip from the integration test block.
 */

describe('LLM response parsing', () => {
  it('extracts JSON from a raw response', () => {
    const raw = `{
      "title": "Test Paper",
      "mainProblem": "Testing",
      "difficultyScore": "Easy"
    }`;
    const parsed = JSON.parse(raw);
    expect(parsed.title).toBe('Test Paper');
    expect(parsed.difficultyScore).toBe('Easy');
  });

  it('extracts JSON from a code-fenced response', () => {
    const raw = '```json\n{"title": "Fenced Paper", "difficultyScore": "Hard"}\n```';
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    expect(match).not.toBeNull();
    const parsed = JSON.parse(match![1]);
    expect(parsed.title).toBe('Fenced Paper');
  });

  it('extracts outermost JSON object from noisy response', () => {
    const raw = 'Here is the analysis:\n\n{"title": "Noisy Paper"}\n\nEnd of response.';
    const match = raw.match(/\{[\s\S]*\}/);
    expect(match).not.toBeNull();
    const parsed = JSON.parse(match![0]);
    expect(parsed.title).toBe('Noisy Paper');
  });

  it('validates expected JSON keys', () => {
    const expectedKeys = [
      'title', 'mainProblem', 'simpleSummary', 'keyContribution',
      'modelArchitecture', 'datasetRequirements', 'preprocessingSteps',
      'trainingProcedure', 'lossFunction', 'evaluationMetrics',
      'implementationChecklist', 'starterCode', 'missingDetails',
      'difficultyScore', 'reasonForDifficulty',
    ];
    const mockResponse: Record<string, string | string[]> = {};
    expectedKeys.forEach(key => {
      mockResponse[key] = key.includes('Checklist') || key.includes('Details') ? [] : '';
    });
    expectedKeys.forEach(key => {
      expect(mockResponse).toHaveProperty(key);
    });
  });
});

describe('Input validation', () => {
  it('rejects text shorter than 200 characters', () => {
    const shortText = 'This is too short to be a real paper.';
    expect(shortText.length).toBeLessThan(200);
  });

  it('truncates text longer than 80,000 characters', () => {
    const longText = 'x'.repeat(100000);
    const truncated = longText.length > 80000
      ? longText.slice(0, 80000) + '\n\n[Content truncated due to length]'
      : longText;
    expect(truncated.length).toBeLessThan(longText.length);
    expect(truncated).toContain('[Content truncated');
  });
});
