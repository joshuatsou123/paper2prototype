import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert machine learning researcher and engineering mentor. Analyze the following AI/ML research paper and convert it into a practical prototype-building guide. Do not only summarize the paper. Focus on what a student or junior researcher would need to reproduce the method.

Return the answer in valid JSON with these exact keys:
{
  "title": "",
  "mainProblem": "",
  "simpleSummary": "",
  "keyContribution": "",
  "modelArchitecture": "",
  "datasetRequirements": "",
  "preprocessingSteps": "",
  "trainingProcedure": "",
  "lossFunction": "",
  "evaluationMetrics": "",
  "implementationChecklist": [],
  "starterCode": "",
  "missingDetails": [],
  "difficultyScore": "",
  "reasonForDifficulty": ""
}

Rules:
- Be practical and implementation-focused.
- If the paper does not mention something clearly, say that it is missing.
- The starter code should be PyTorch unless the paper clearly uses another framework.
- The implementation checklist should be step-by-step.
- The difficulty score must be Easy, Medium, or Hard.
- Do not invent exact hyperparameters unless they are in the paper.
- Keep explanations clear for an undergraduate AI/ML student.
- Return ONLY valid JSON. No markdown fences, no extra prose.`;

export interface PaperAnalysis {
  title: string;
  mainProblem: string;
  simpleSummary: string;
  keyContribution: string;
  modelArchitecture: string;
  datasetRequirements: string;
  preprocessingSteps: string;
  trainingProcedure: string;
  lossFunction: string;
  evaluationMetrics: string;
  implementationChecklist: string[];
  starterCode: string;
  missingDetails: string[];
  difficultyScore: string;
  reasonForDifficulty: string;
}

export async function analyzePaper(text: string): Promise<PaperAnalysis> {
  // Keep ~80k chars — enough for most papers while staying within context limits
  const body = text.length > 80000
    ? text.slice(0, 80000) + '\n\n[Content truncated due to length]'
    : text;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `Analyze this research paper:\n\n${body}` }],
  });

  const block = response.content[0];
  if (block.type !== 'text') throw new Error('Unexpected response type from LLM');

  let raw = block.text.trim();

  // Strip markdown code fences if the model wrapped the JSON
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) raw = fenceMatch[1];

  try {
    return JSON.parse(raw) as PaperAnalysis;
  } catch {
    // Last resort: find the outermost JSON object
    const objMatch = raw.match(/\{[\s\S]*\}/);
    if (objMatch) return JSON.parse(objMatch[0]) as PaperAnalysis;
    throw new Error('Could not parse JSON from LLM response. Please try again.');
  }
}
