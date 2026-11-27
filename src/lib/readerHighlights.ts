import { supabase } from './supabase';
import type { TextAnchor } from './noteAnchors';

export type HighlightColor = 'peach' | 'lavender' | 'ice-blue' | 'mint';

export interface ReaderHighlight {
  id: string;
  user_id: string;
  page_key: string;
  anchor: TextAnchor;
  color: HighlightColor;
  created_at: string;
}

const columns = 'id,user_id,page_key,anchor,color,created_at';

function client() {
  if (!supabase) throw new Error('AUTH_NOT_CONFIGURED');
  return supabase;
}

export async function loadReaderHighlights(userId: string): Promise<ReaderHighlight[]> {
  const highlights: ReaderHighlight[] = [];
  for (let from = 0; ; from += 500) {
    const { data, error } = await client().from('reader_highlights').select(columns)
      .eq('user_id', userId).order('created_at', { ascending: false }).order('id')
      .range(from, from + 499);
    if (error) throw error;
    const page = data as ReaderHighlight[];
    highlights.push(...page);
    if (page.length < 500) return highlights;
  }
}

export async function createReaderHighlight(userId: string, pageKey: string, anchor: TextAnchor, color: HighlightColor): Promise<ReaderHighlight> {
  const { data, error } = await client().from('reader_highlights')
    .insert({ user_id: userId, page_key: pageKey, anchor, color })
    .select(columns).single();
  if (!error) return data as ReaderHighlight;
  if (error.code !== '23505') throw error;

  // Recover a duplicate without putting the whole selected passage in the request URL.
  const { quote, ...context } = anchor;
  const existing = await client().from('reader_highlights').select(columns)
    .eq('user_id', userId).eq('page_key', pageKey).contains('anchor', context);
  if (existing.error) throw existing.error;
  const match = (existing.data as ReaderHighlight[]).find((highlight) => highlight.anchor.quote === quote
    && Object.keys(highlight.anchor).length === Object.keys(anchor).length);
  if (!match) throw error;
  return match.color === color ? match : updateReaderHighlight(userId, match.id, color);
}

export async function updateReaderHighlight(userId: string, id: string, color: HighlightColor): Promise<ReaderHighlight> {
  const { data, error } = await client().from('reader_highlights').update({ color })
    .eq('id', id).eq('user_id', userId).select(columns).single();
  if (error) throw error;
  return data as ReaderHighlight;
}

export async function deleteReaderHighlight(userId: string, id: string): Promise<void> {
  const { data, error } = await client().from('reader_highlights').delete()
    .eq('id', id).eq('user_id', userId).select('id').single();
  if (error || !data) throw error || new Error('HIGHLIGHT_NOT_FOUND');
}
