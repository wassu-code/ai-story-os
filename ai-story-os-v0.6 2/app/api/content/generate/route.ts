import { NextResponse } from 'next/server';
import { getOpenAI, STORY_MODEL } from '@/lib/openai';
import { fallbackContent } from '@/lib/fallback';
import type { GeneratedContent } from '@/types/story';
import { persistContent } from '@/lib/store';

const schema = { type:'object', additionalProperties:false,
  required:['episodeNumber','hook','script','choiceA','choiceB','caption','imagePrompt','videoPrompt','continuityNote','monetizationStage'],
  properties:{ episodeNumber:{type:'integer'}, hook:{type:'string'}, script:{type:'string'}, choiceA:{type:'string'}, choiceB:{type:'string'}, caption:{type:'string'}, imagePrompt:{type:'string'}, videoPrompt:{type:'string'}, continuityNote:{type:'string'}, monetizationStage:{type:'string',enum:['free']} }
} as const;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const episodeNumber = Number(body.episodeNumber || fallbackContent.episodeNumber);
  const client = getOpenAI();
  if (!client) { const data={...fallbackContent,episodeNumber}; await persistContent(data).catch(()=>null); return NextResponse.json({data,mode:'fallback'}); }
  try {
    const response = await client.responses.create({
      model:STORY_MODEL, reasoning:{effort:'low'},
      input:[
        {role:'system',content:'Create one 12-18 second vertical Japanese social post for a recurring adult AI character whose everyday choices are decided by viewers. Start by visibly paying off yesterday\'s choice, show one ordinary-life moment, then end with an extremely simple A/B choice whose result can be shown tomorrow. No horror, no dramatic twist, no sexual escalation. Keep the character visually consistent. The monetization stage must remain free; do not add sales copy. Image/video prompts must favor realistic smartphone-documentary aesthetics and the same character/location when continuity allows.'},
        {role:'user',content:JSON.stringify(body)}
      ],
      text:{format:{type:'json_schema',name:'daily_choice_content',strict:true,schema}}
    });
    const data=JSON.parse(response.output_text) as GeneratedContent;
    await persistContent(data);
    return NextResponse.json({data,mode:'openai'});
  } catch(error){
    console.error('content/generate failed',error);
    const data={...fallbackContent,episodeNumber}; await persistContent(data).catch(()=>null);
    return NextResponse.json({data,mode:'fallback',warning:'AI生成に失敗したため日常選択サンプルを表示しています。'});
  }
}
