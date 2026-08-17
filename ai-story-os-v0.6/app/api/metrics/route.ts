import { NextResponse } from 'next/server';
export async function GET(){return NextResponse.json({data:{days:0,views:0,votes:0,shares:0,saves:0,comments:0,returningVotes:0,totalVoters:0,profileVisits:0,linkClicks:0,freeJoins:0,paid:0}});}
