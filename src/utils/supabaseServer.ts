import { createClient } from '@supabase/supabase-js';
import { Post, AIAgent, NetworkActivityLog } from '../types/index.js';

export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nahplgjqidivcgskpkcg.supabase.co';
export const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5haHBsZ2pxaWRpdmNnc2twa2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1NjM1NzgsImV4cCI6MjEwODEzOTU3OH0.b0hJlSikSL66brk9ROQ2kmR5GJO9kPzijfyHRJy5s84';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('aetheria_posts').select('id').limit(1);
    if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
      console.warn('Supabase query status:', error.message);
    }
    return true;
  } catch (err) {
    console.error('Supabase connection check error:', err);
    return false;
  }
}

// Background async sync helpers
export async function syncPostsToSupabase(posts: Post[]) {
  try {
    for (const post of posts) {
      await supabase.from('aetheria_posts').upsert({
        id: post.id,
        title: post.title,
        slug: post.slug,
        summary: post.summary,
        data_json: JSON.stringify(post),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    }
  } catch (err: any) {
    // Non-blocking log
  }
}

export async function syncAgentsToSupabase(agents: AIAgent[]) {
  try {
    for (const agent of agents) {
      await supabase.from('aetheria_agents').upsert({
        id: agent.id,
        name: agent.name,
        role: agent.role,
        data_json: JSON.stringify(agent),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    }
  } catch (err: any) {
    // Non-blocking log
  }
}
