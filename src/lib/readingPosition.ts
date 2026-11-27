import type { ChapterMeta } from '../data/syllabus';
import { supabase } from './supabase';

export interface ReadingPosition {
  page_key: string;
  section_id: string | null;
  section_progress: number;
}

const progressScale = 10000;
const columns = 'page_key,section_id,section_progress';

function sectionStops(chapter: ChapterMeta) {
  const stops: { id: string | null; top: number }[] = [{ id: null, top: 0 }];
  for (const section of chapter.sections) {
    const element = document.getElementById(section.id);
    if (!element) continue;
    const margin = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
    stops.push({ id: section.id, top: element.getBoundingClientRect().top + window.scrollY - margin });
  }
  return stops;
}

function endOfStop(stops: ReturnType<typeof sectionStops>, index: number) {
  return stops[index + 1]?.top ?? document.documentElement.scrollHeight - window.innerHeight;
}

export function captureReadingPosition(chapter: ChapterMeta): ReadingPosition {
  const stops = sectionStops(chapter);
  const scroll = Math.max(0, window.scrollY);
  let index = stops.length - 1;
  while (index > 0 && stops[index].top > scroll + 1) index--;
  const stop = stops[index];
  const height = Math.max(1, endOfStop(stops, index) - stop.top);
  const progress = Math.min(1, Math.max(0, (scroll - stop.top) / height));
  return { page_key: chapter.id, section_id: stop.id, section_progress: Math.round(progress * progressScale) };
}

export function restoreReadingPosition(chapter: ChapterMeta, position: ReadingPosition) {
  const stops = sectionStops(chapter);
  const index = stops.findIndex(({ id }) => id === position.section_id);
  const start = stops[index]?.top ?? 0;
  const height = index < 0 ? 0 : Math.max(0, endOfStop(stops, index) - start);
  window.scrollTo({ top: start + height * position.section_progress / progressScale, behavior: 'instant' });
}

export async function loadReadingPosition(userId: string, signal: AbortSignal): Promise<ReadingPosition | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('reader_positions').select(columns)
    .eq('user_id', userId).abortSignal(signal).maybeSingle();
  return error ? null : data;
}

export function createReadingPositionWriter(userId: string) {
  let pending: ReadingPosition | null = null;
  let timer: number | undefined;
  let saving: Promise<void> | undefined;

  function flush() {
    window.clearTimeout(timer);
    timer = undefined;
    if (saving) return saving;
    saving = savePending().finally(() => { saving = undefined; });
    return saving;
  }

  async function savePending() {
    if (!supabase) return;
    while (pending) {
      const position = pending;
      pending = null;
      try {
        const { error } = await supabase.from('reader_positions')
          .upsert({ user_id: userId, ...position })
          .abortSignal(AbortSignal.timeout(3500));
        if (!error) continue;
      } catch { /* Keep the newest position queued for the next save attempt. */ }
      if (!pending) {
        pending = position;
        return;
      }
    }
  }

  function record(position: ReadingPosition) {
    pending = position;
    if (timer === undefined && !saving) timer = window.setTimeout(() => void flush(), 700);
  }

  return { record, flush };
}
