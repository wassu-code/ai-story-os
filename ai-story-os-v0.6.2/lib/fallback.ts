import type { GeneratedContent, StoryProposal } from '@/types/story';

export const fallbackProposal: StoryProposal = {
  episodeNumber: 1,
  previousSummary: '昨日は「髪を結ぶ」が選ばれた。今日はその髪型のまま一日が始まる。',
  choiceChainSummary: '昨日の選択を今日の見た目に反映。次の選択が明日の行動につながる。',
  recommendation: 'B',
  recommendationReason: '見た目だけで終わらず、明日の行動につながる選択なので継続視聴を作りやすい。',
  branches: [
    { code: 'A', title: '今日の服を決めてもらう', description: '同じ人物・同じ画角で服だけを変える。', category: 'look', audienceChoiceA: '白シャツ', audienceChoiceB: '黒ニット', continuity: 90, performance: 84, aiScore: 87, rationale: '1秒で理解でき、画像比較もしやすい。' },
    { code: 'B', title: '仕事帰りを決めてもらう', description: '今日の終わり方を選んでもらい、明日の投稿へつなげる。', category: 'afterwork', audienceChoiceA: '寄り道する', audienceChoiceB: 'まっすぐ帰る', continuity: 98, performance: 91, aiScore: 94, rationale: '結果が次回の場所・服・食事へ自然につながる。' },
    { code: 'C', title: '今日の夕食を決めてもらう', description: '生活感が出る軽い二択。', category: 'food', audienceChoiceA: '自炊する', audienceChoiceB: 'コンビニで済ませる', continuity: 92, performance: 82, aiScore: 86, rationale: '参加障壁が低く、日常キャラクターへの親近感を作りやすい。' },
  ],
};

export const fallbackContent: GeneratedContent = {
  episodeNumber: 1,
  hook: '昨日はみんなが「髪を結ぶ」を選んだ。',
  script: '今日はその髪型のまま仕事へ。帰る時間になったけど、まだ少しだけ元気が残ってる。今日の帰り道、どっちにする？',
  choiceA: '寄り道する',
  choiceB: 'まっすぐ帰る',
  caption: 'EP.001\n昨日の選択、ちゃんと反映しました。\n今日は仕事帰りを決めてください。\n\nA 寄り道する\nB まっすぐ帰る\n\n明日は多かった方で続きます。',
  imagePrompt: 'Photorealistic adult Japanese woman in her late 20s, approachable and natural, tied-back hair chosen by audience yesterday, casual work outfit, standing in the same modest apartment entryway at evening, consistent face, consistent body, realistic skin texture, documentary smartphone photography, no glamour retouching.',
  videoPrompt: '12-15 second vertical realistic social video. Same adult Japanese woman and same apartment. Show the result of yesterday choice first: tied-back hair. She returns from work, places her bag down, looks slightly undecided, then end on clear A/B text: A make a small detour, B go straight home. Natural movements, realistic lighting, no dramatic cinematic suspense.',
  continuityNote: '昨日の「髪を結ぶ」を外見へ反映し、今日の帰宅選択を明日の行動へ接続する。',
  monetizationStage: 'free',
};
