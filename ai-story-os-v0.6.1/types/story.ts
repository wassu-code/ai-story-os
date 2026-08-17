export type BranchCode = 'A' | 'B' | 'C';
export type MonetizationStage = 'validate' | 'retention' | 'cta_test' | 'paid_test' | 'membership';

export type StoryBranch = {
  code: BranchCode;
  title: string;
  description: string;
  category: 'look' | 'food' | 'afterwork' | 'weekend' | 'room' | 'habit';
  audienceChoiceA: string;
  audienceChoiceB: string;
  continuity: number;
  performance: number;
  aiScore: number;
  rationale: string;
};

export type StoryProposal = {
  episodeNumber: number;
  previousSummary: string;
  choiceChainSummary: string;
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
  continuityNote: string;
  monetizationStage: 'free';
};

export type DailyMetrics = {
  views:number; votes:number; shares:number; saves:number; comments:number;
  profileVisits:number; linkClicks:number; freeJoins:number; paid:number;
  returningVotes:number; totalVoters:number;
};
