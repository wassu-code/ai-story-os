export type BranchCode = 'A' | 'B' | 'C';

export type StoryBranch = {
  code: BranchCode;
  title: string;
  description: string;
  tension: number;
  continuity: number;
  performance: number;
  aiScore: number;
  rationale: string;
};

export type StoryProposal = {
  episodeNumber: number;
  previousSummary: string;
  recommendation: BranchCode;
  recommendationReason: string;
  branches: StoryBranch[];
};

export type GeneratedContent = {
  episodeNumber: number;
  hook: string;
  script: string;
  choiceA: string;
  choiceB: string;
  caption: string;
  imagePrompt: string;
  videoPrompt: string;
};
