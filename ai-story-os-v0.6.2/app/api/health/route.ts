import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  const openai = Boolean(process.env.OPENAI_API_KEY);
  const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  let supabase = false;
  if (supabaseConfigured) {
    try {
      const db = getSupabaseAdmin();
      const result = await db?.from('projects').select('id').limit(1);
      supabase = !result?.error;
    } catch { supabase = false; }
  }
  return NextResponse.json({
    ok: true,
    services: {
      openai: openai ? 'configured' : 'demo',
      supabase: supabase ? 'connected' : (supabaseConfigured ? 'error' : 'demo'),
      mediaGeneration: process.env.ENABLE_MEDIA_GENERATION === 'true' ? 'enabled' : 'safe-off',
      socialPublish: process.env.ENABLE_SOCIAL_PUBLISH === 'true' ? 'enabled' : 'safe-off'
    }
  });
}
