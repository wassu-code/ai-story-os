import OpenAI from 'openai';

export function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export const STORY_MODEL = process.env.OPENAI_STORY_MODEL || 'gpt-5.6';
