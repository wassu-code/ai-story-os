import { NextResponse } from 'next/server';
import { getOpenAI, STORY_MODEL } from '@/lib/openai';
import { fallbackContent } from '@/lib/fallback';
import type { GeneratedContent } from '@/types/story';
import { persistContent } from '@/lib/store';

const schema = {
  type: 'object', additionalProperties: false,
  required: ['episodeNumber','hook','script','choiceA','choiceB','caption','imagePrompt','videoPrompt'],
  properties: {
    episodeNumber: { type: 'integer' },
    hook: { type: 'string' },
    script: { type: 'string' },
    choiceA: { type: 'string' },
    choiceB: { type: 'string' },
    caption: { type: 'string' },
    imagePrompt: { type: 'string' },
    videoPrompt: { type: 'string' },
  }
} as const;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const client = getOpenAI();
  if (!client) { const data = { ...fallbackContent, episodeNumber: Number(body.episodeNumber || fallbackContent.episodeNumber) }; await persistContent(data).catch(()=>null); return NextResponse.json({ data, mode: 'fallback' }); }

  try {
    const response = await client.responses.create({
      model: STORY_MODEL,
      reasoning: { effort: 'low' },
      input: [
        { role: 'system', content: 'Create a concise 15-20 second vertical interactive story episode for TikTok/Instagram. Use a 0-2s hook, 2-9s event, 9-14s twist, 14-18s A/B choice. Keep all characters adults. Preserve continuity. Do not include hashtags unless requested.' },
        { role: 'user', content: JSON.stringify(body) }
      ],
      text: { format: { type: 'json_schema', name: 'generated_content', strict: true, schema } }
    });
    const data = JSON.parse(response.output_text) as GeneratedContent;
    await persistContent(data);
    return NextResponse.json({ data, mode: 'openai' });
  } catch (error) {
    console.error('content/generate failed', error);
    const data = { ...fallbackContent, episodeNumber: Number(body.episodeNumber || fallbackContent.episodeNumber) };
    await persistContent(data).catch(()=>null);
    return NextResponse.json({ data, mode: 'fallback', warning: 'AI生成に失敗したためサンプルを表示しています。' });
  }
}
