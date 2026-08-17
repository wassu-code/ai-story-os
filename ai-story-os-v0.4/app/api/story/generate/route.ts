import { NextResponse } from 'next/server';
import { getOpenAI, STORY_MODEL } from '@/lib/openai';
import { fallbackProposal } from '@/lib/fallback';
import type { StoryProposal } from '@/types/story';
import { persistProposal } from '@/lib/store';

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['episodeNumber','previousSummary','recommendation','recommendationReason','branches'],
  properties: {
    episodeNumber: { type: 'integer' },
    previousSummary: { type: 'string' },
    recommendation: { type: 'string', enum: ['A','B','C'] },
    recommendationReason: { type: 'string' },
    branches: {
      type: 'array', minItems: 3, maxItems: 3,
      items: {
        type: 'object', additionalProperties: false,
        required: ['code','title','description','tension','continuity','performance','aiScore','rationale'],
        properties: {
          code: { type: 'string', enum: ['A','B','C'] },
          title: { type: 'string' },
          description: { type: 'string' },
          tension: { type: 'integer', minimum: 1, maximum: 5 },
          continuity: { type: 'integer', minimum: 0, maximum: 100 },
          performance: { type: 'integer', minimum: 0, maximum: 100 },
          aiScore: { type: 'integer', minimum: 0, maximum: 100 },
          rationale: { type: 'string' },
        }
      }
    }
  }
} as const;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const episodeNumber = Number(body.episodeNumber || fallbackProposal.episodeNumber);
  const previousSummary = String(body.previousSummary || fallbackProposal.previousSummary);
  const fallback = { ...fallbackProposal, episodeNumber, previousSummary };
  const client = getOpenAI();
  if (!client) { await persistProposal(fallback).catch(()=>null); return NextResponse.json({ data: fallback, mode: 'fallback' }); }
  const worldState = body.worldState || {};
  const metrics = body.metrics || {};

  try {
    const response = await client.responses.create({
      model: STORY_MODEL,
      reasoning: { effort: 'low' },
      input: [
        {
          role: 'system',
          content: 'You are Story AI for a short interactive social video series. Create exactly 3 coherent next-episode branches. Keep continuity strict, avoid random twists, and optimize for clarity, suspense, and a simple audience choice. All story characters must be adults.'
        },
        {
          role: 'user',
          content: JSON.stringify({ episodeNumber, previousSummary, worldState, metrics })
        }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'story_proposal',
          strict: true,
          schema,
        }
      }
    });
    const parsed = JSON.parse(response.output_text) as StoryProposal;
    await persistProposal(parsed);
    return NextResponse.json({ data: parsed, mode: 'openai' });
  } catch (error) {
    console.error('story/generate failed', error);
    await persistProposal(fallback).catch(()=>null);
    return NextResponse.json({ data: fallback, mode: 'fallback', warning: 'AI生成に失敗したためサンプル案を表示しています。' });
  }
}
