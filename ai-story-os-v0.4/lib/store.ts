import { getSupabaseAdmin } from '@/lib/supabase/server';
import { fallbackProposal } from '@/lib/fallback';
import type { BranchCode, GeneratedContent, StoryProposal } from '@/types/story';

export type RuntimeState = {
  mode: 'supabase' | 'demo';
  projectId?: string;
  episodeId?: string;
  episodeNumber: number;
  status: string;
  previousSummary: string;
  selectedBranch?: BranchCode;
};

export async function getRuntimeState(): Promise<RuntimeState> {
  const db = getSupabaseAdmin();
  if (!db) {
    return { mode: 'demo', episodeNumber: fallbackProposal.episodeNumber, status: 'WAITING_DECISION', previousSummary: fallbackProposal.previousSummary };
  }

  const { data: project } = await db.from('projects').select('id').eq('status', 'active').order('created_at', { ascending: true }).limit(1).maybeSingle();
  if (!project) {
    return { mode: 'demo', episodeNumber: fallbackProposal.episodeNumber, status: 'WAITING_DECISION', previousSummary: fallbackProposal.previousSummary };
  }

  const { data: episode } = await db.from('episodes')
    .select('id,episode_number,status,summary,selected_branch')
    .eq('project_id', project.id)
    .order('episode_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!episode) {
    return { mode: 'supabase', projectId: project.id, episodeNumber: 1, status: 'WAITING_DECISION', previousSummary: '物語が始まる。' };
  }

  return {
    mode: 'supabase', projectId: project.id, episodeId: episode.id,
    episodeNumber: episode.episode_number,
    status: episode.status,
    previousSummary: episode.summary || fallbackProposal.previousSummary,
    selectedBranch: (episode.selected_branch || undefined) as BranchCode | undefined,
  };
}

export async function persistProposal(proposal: StoryProposal) {
  const db = getSupabaseAdmin();
  if (!db) return { mode: 'demo' as const };

  const { data: project } = await db.from('projects').select('id').eq('status', 'active').order('created_at', { ascending: true }).limit(1).maybeSingle();
  if (!project) return { mode: 'demo' as const };

  let { data: episode } = await db.from('episodes').select('id').eq('project_id', project.id).eq('episode_number', proposal.episodeNumber).maybeSingle();
  if (!episode) {
    const created = await db.from('episodes').insert({ project_id: project.id, episode_number: proposal.episodeNumber, summary: proposal.previousSummary, status: 'WAITING_DECISION' }).select('id').single();
    if (created.error) throw created.error;
    episode = created.data;
  } else {
    await db.from('episodes').update({ summary: proposal.previousSummary, status: 'WAITING_DECISION' }).eq('id', episode.id);
  }

  await db.from('branches').delete().eq('episode_id', episode.id);
  const rows = proposal.branches.map(b => ({
    episode_id: episode!.id, branch_code: b.code, title: b.title, description: b.description,
    tension_score: b.tension, continuity_score: b.continuity,
    performance_score: b.performance, ai_score: b.aiScore, selected: false,
  }));
  const inserted = await db.from('branches').insert(rows);
  if (inserted.error) throw inserted.error;
  return { mode: 'supabase' as const, episodeId: episode.id };
}

export async function selectBranch(episodeNumber: number, code: BranchCode) {
  const db = getSupabaseAdmin();
  if (!db) return { mode: 'demo' as const };
  const { data: project } = await db.from('projects').select('id').eq('status', 'active').order('created_at', { ascending: true }).limit(1).maybeSingle();
  if (!project) return { mode: 'demo' as const };
  const { data: episode, error } = await db.from('episodes').select('id').eq('project_id', project.id).eq('episode_number', episodeNumber).single();
  if (error) throw error;
  await db.from('branches').update({ selected: false }).eq('episode_id', episode.id);
  await db.from('branches').update({ selected: true }).eq('episode_id', episode.id).eq('branch_code', code);
  await db.from('episodes').update({ selected_branch: code, status: 'SELECTED' }).eq('id', episode.id);
  return { mode: 'supabase' as const, episodeId: episode.id };
}

export async function persistContent(content: GeneratedContent) {
  const db = getSupabaseAdmin();
  if (!db) return { mode: 'demo' as const };
  const { data: project } = await db.from('projects').select('id').eq('status', 'active').order('created_at', { ascending: true }).limit(1).maybeSingle();
  if (!project) return { mode: 'demo' as const };
  const { data: episode, error } = await db.from('episodes').select('id').eq('project_id', project.id).eq('episode_number', content.episodeNumber).single();
  if (error) throw error;
  const payload = {
    episode_id: episode.id, hook: content.hook, script: content.script,
    choice_a: content.choiceA, choice_b: content.choiceB, caption: content.caption,
    image_prompt: content.imagePrompt, video_prompt: content.videoPrompt, status: 'ready'
  };
  const existing = await db.from('contents').select('id,generation_version').eq('episode_id', episode.id).maybeSingle();
  if (existing.data) {
    const upd = await db.from('contents').update({ ...payload, generation_version: (existing.data.generation_version || 1) + 1 }).eq('id', existing.data.id);
    if (upd.error) throw upd.error;
  } else {
    const ins = await db.from('contents').insert(payload);
    if (ins.error) throw ins.error;
  }
  await db.from('episodes').update({ status: 'READY' }).eq('id', episode.id);
  return { mode: 'supabase' as const, episodeId: episode.id };
}

export async function approveEpisode(episodeNumber: number) {
  const db = getSupabaseAdmin();
  if (!db) return { mode: 'demo' as const };
  const { data: project } = await db.from('projects').select('id').eq('status', 'active').order('created_at', { ascending: true }).limit(1).maybeSingle();
  if (!project) return { mode: 'demo' as const };
  const { data: episode, error } = await db.from('episodes').select('id').eq('project_id', project.id).eq('episode_number', episodeNumber).single();
  if (error) throw error;
  await db.from('episodes').update({ status: 'APPROVED' }).eq('id', episode.id);
  return { mode: 'supabase' as const, episodeId: episode.id };
}
