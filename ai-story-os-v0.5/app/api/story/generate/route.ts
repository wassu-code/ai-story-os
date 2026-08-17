import { NextResponse } from 'next/server';
import { getOpenAI, STORY_MODEL } from '@/lib/openai';
import { fallbackProposal } from '@/lib/fallback';
import type { StoryProposal } from '@/types/story';
import { persistProposal } from '@/lib/store';

const schema = {
  type: 'object', additionalProperties: false,
  required: ['episodeNumber','previousSummary','choiceChainSummary','recommendation','recommendationReason','branches'],
  properties: {
    episodeNumber: { type: 'integer' }, previousSummary: { type: 'string' }, choiceChainSummary: { type: 'string' },
    recommendation: { type: 'string', enum: ['A','B','C'] }, recommendationReason: { type: 'string' },
    branches: { type:'array', minItems:3, maxItems:3, items:{ type:'object', additionalProperties:false,
      required:['code','title','description','category','audienceChoiceA','audienceChoiceB','continuity','performance','aiScore','rationale'],
      properties:{ code:{type:'string',enum:['A','B','C']}, title:{type:'string'}, description:{type:'string'}, category:{type:'string',enum:['look','food','afterwork','weekend','room','habit']}, audienceChoiceA:{type:'string'}, audienceChoiceB:{type:'string'}, continuity:{type:'integer',minimum:0,maximum:100}, performance:{type:'integer',minimum:0,maximum:100}, aiScore:{type:'integer',minimum:0,maximum:100}, rationale:{type:'string'} }
    }}
  }
} as const;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const episodeNumber = Number(body.episodeNumber || fallbackProposal.episodeNumber);
  const previousSummary = String(body.previousSummary || fallbackProposal.previousSummary);
  const fallback = { ...fallbackProposal, episodeNumber, previousSummary };
  const client = getOpenAI();
  if (!client) { await persistProposal(fallback).catch(()=>null); return NextResponse.json({ data:fallback, mode:'fallback' }); }
  try {
    const response = await client.responses.create({
      model: STORY_MODEL, reasoning: { effort: 'low' },
      input: [
        { role:'system', content:'You are the editorial AI for a Japanese interactive daily-life social series starring one consistent adult AI character. Generate exactly 3 simple operator-level post concepts. Each concept must become a viewer-facing A/B choice understandable in under one second. Use ordinary life only: clothes, hair, food, after-work plans, weekend plans, room, habits. Preserve yesterday\'s chosen result and create a choice chain so today can affect tomorrow. Avoid thriller, horror, random twists, sexual escalation, or melodrama. Optimize for participation, return viewing, and character attachment. Output Japanese.' },
        { role:'user', content: JSON.stringify({ episodeNumber, previousSummary, worldState:body.worldState || {}, metrics:body.metrics || {}, funnel:body.funnel || {} }) }
      ],
      text:{ format:{ type:'json_schema', name:'daily_choice_proposal', strict:true, schema } }
    });
    const parsed = JSON.parse(response.output_text) as StoryProposal;
    await persistProposal(parsed);
    return NextResponse.json({ data:parsed, mode:'openai' });
  } catch (error) {
    console.error('story/generate failed', error);
    await persistProposal(fallback).catch(()=>null);
    return NextResponse.json({ data:fallback, mode:'fallback', warning:'AI生成に失敗したため日常選択サンプルを表示しています。' });
  }
}
