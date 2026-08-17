import {NextResponse} from 'next/server'; import {getOpenAI} from '@/lib/openai';
export async function POST(req:Request){const input=await req.json(); const client=getOpenAI(); if(!client){return NextResponse.json({mode:'mock',branches:[{code:'A',title:'ドアを開ける',score:91},{code:'B',title:'警察に電話する',score:76},{code:'C',title:'窓から逃げる',score:83}]});}
 const r=await client.responses.create({model:'gpt-5-mini',input:`あなたはStory Engine。次の展開をA/B/Cの3案で短く提案。設定矛盾は禁止。現在状態:${JSON.stringify(input)}`});
 return NextResponse.json({mode:'live',text:r.output_text});}
