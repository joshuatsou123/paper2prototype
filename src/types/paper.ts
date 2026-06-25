export interface PaperResult {
  id: string;
  title: string;
  originalFileName: string;
  extractedTextPreview: string;
  mainProblem: string;
  summary: string;
  keyContribution: string;
  architecture: string;
  datasetRequirements: string;
  preprocessingSteps: string;
  trainingProcedure: string;
  lossFunction: string;
  evaluationMetrics: string;
  implementationChecklist: string; // raw JSON string from DB
  starterCode: string;
  missingDetails: string;          // raw JSON string from DB
  difficultyScore: string;
  reasonForDifficulty: string;
  createdAt: Date | string;
}

export type DifficultyScore = 'Easy' | 'Medium' | 'Hard';
