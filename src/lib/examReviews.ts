import { supabase } from './supabase';

export async function loadExamReviews(userId: string, signal: AbortSignal): Promise<string[]> {
  if (!supabase) throw new Error('AUTH_NOT_CONFIGURED');
  const { data, error } = await supabase.from('exam_reviews')
    .select('exam_id')
    .eq('user_id', userId)
    .abortSignal(signal);
  if (error) throw error;
  return data.map(({ exam_id }) => exam_id);
}

export async function setExamReviewed(userId: string, examId: string, reviewed: boolean): Promise<void> {
  if (!supabase) throw new Error('AUTH_NOT_CONFIGURED');
  const reviews = supabase.from('exam_reviews');
  const request = reviewed
    ? reviews.upsert({ user_id: userId, exam_id: examId }, { ignoreDuplicates: true })
    : reviews.delete().eq('user_id', userId).eq('exam_id', examId);
  const { error } = await request.abortSignal(AbortSignal.timeout(6000));
  if (error) throw error;
}
