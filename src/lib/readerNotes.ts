import { supabase } from './supabase';
import type { TextAnchor } from './noteAnchors';

export interface ReaderNote {
  id: string;
  user_id: string;
  page_key: string;
  anchor: TextAnchor;
  body: string;
  created_at: string;
  updated_at: string;
}

const columns = 'id,user_id,page_key,anchor,body,created_at,updated_at';

function client() {
  if (!supabase) throw new Error('AUTH_NOT_CONFIGURED');
  return supabase;
}

export async function loadReaderNotes(userId: string): Promise<ReaderNote[]> {
  const notes: ReaderNote[] = [];
  for (let from = 0; ; from += 500) {
    const { data, error } = await client().from('reader_notes').select(columns)
      .eq('user_id', userId).order('created_at', { ascending: false }).order('id')
      .range(from, from + 499);
    if (error) throw error;
    const page = data as ReaderNote[];
    notes.push(...page);
    if (page.length < 500) return notes;
  }
}

export async function createReaderNote(userId: string, pageKey: string, anchor: TextAnchor, body: string): Promise<ReaderNote> {
  const { data, error } = await client().from('reader_notes')
    .insert({ user_id: userId, page_key: pageKey, anchor, body: body.trim() })
    .select(columns).single();
  if (error) throw error;
  return data as ReaderNote;
}

export async function updateReaderNote(userId: string, id: string, body: string): Promise<ReaderNote> {
  const { data, error } = await client().from('reader_notes').update({ body: body.trim() })
    .eq('id', id).eq('user_id', userId).select(columns).single();
  if (error) throw error;
  return data as ReaderNote;
}

export async function deleteReaderNote(userId: string, id: string): Promise<void> {
  const { data, error } = await client().from('reader_notes').delete()
    .eq('id', id).eq('user_id', userId).select('id').single();
  if (error || !data) throw error || new Error('NOTE_NOT_FOUND');
}
