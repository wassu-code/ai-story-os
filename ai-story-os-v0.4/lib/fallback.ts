import type { GeneratedContent, StoryProposal } from '@/types/story';

export const fallbackProposal: StoryProposal = {
  episodeNumber: 9,
  previousSummary: 'ドアの外から自分の声が聞こえた。',
  recommendation: 'A',
  recommendationReason: '前話との接続が自然で、次の異常を見せやすい。',
  branches: [
    { code: 'A', title: 'ドアを開ける', description: '危険を承知で声の正体を確かめる。', tension: 5, continuity: 95, performance: 88, aiScore: 92, rationale: '前回の引きを直接回収できる。' },
    { code: 'B', title: '警察に電話する', description: '安全策を取りながら状況を観察する。', tension: 3, continuity: 88, performance: 72, aiScore: 79, rationale: '現実的だが展開速度が落ちやすい。' },
    { code: 'C', title: '窓から逃げる', description: '声から距離を取り、別の場所へ移動する。', tension: 4, continuity: 80, performance: 79, aiScore: 83, rationale: '動きは出るが前話の謎を保留する。' },
  ],
};

export const fallbackContent: GeneratedContent = {
  episodeNumber: 9,
  hook: 'ドアを開けた。そこには誰もいなかった。',
  script: 'ドアを開けた。廊下には誰もいない。でも床にスマホが一台置かれていた。画面には、今この部屋にいる私の写真が表示されている。',
  choiceA: 'スマホを見る',
  choiceB: '触らず逃げる',
  caption: 'EP.009\nドアの外には誰もいなかった。\nでも床にスマホが置かれていた。\n\nあなたなら？\nA スマホを見る\nB 触らず逃げる',
  imagePrompt: 'Photorealistic adult woman in a dim apartment doorway, tense expression, mysterious smartphone on the floor, cinematic suspense, consistent character identity.',
  videoPrompt: '15-second vertical suspense video. Adult woman slowly opens apartment door, empty hallway, notices smartphone on floor, close-up of phone displaying her current photo, end card with A/B choice.',
};
