import { beforeEach, expect, test, vi } from 'vitest';

const db = vi.hoisted(() => ({ from: vi.fn(), calls: [] as [string, ...unknown[]][], replies: [] as unknown[] }));
vi.mock('../src/lib/supabase', () => ({ supabase: { from: db.from } }));
import { createReaderNote, deleteReaderNote, loadReaderNotes, updateReaderNote } from '../src/lib/readerNotes';

const anchor = { quote: 'ordered pairs', prefix: 'a set of ', suffix: '.', start: 9, end: 22 };

beforeEach(() => {
  db.calls = []; db.replies = []; vi.clearAllMocks();
  db.from.mockImplementation((table) => {
    db.calls.push(['from', table]);
    const builder: Record<string, (...args: unknown[]) => unknown> = {};
    for (const method of ['select', 'eq', 'order', 'insert', 'update', 'delete']) builder[method] = (...args) => { db.calls.push([method, ...args]); return builder; };
    for (const method of ['single', 'range']) builder[method] = (...args) => { db.calls.push([method, ...args]); return Promise.resolve(db.replies.shift()); };
    return builder;
  });
});

test('every read, including additional pages, is scoped to the signed-in user', async () => {
  db.replies = [{ data: Array.from({ length: 500 }, (_, i) => ({ id: `${i}` })), error: null }, { data: [{ id: 'last' }], error: null }];
  expect(await loadReaderNotes('reader-a')).toHaveLength(501);
  expect(db.calls.filter((c) => c[0] === 'eq')).toEqual([['eq', 'user_id', 'reader-a'], ['eq', 'user_id', 'reader-a']]);
  expect(db.calls.filter((c) => c[0] === 'range')).toEqual([['range', 0, 499], ['range', 500, 999]]);
});

test('new notes store their owner, page, full anchor and trimmed body in Supabase', async () => {
  const saved = { id: 'saved', user_id: 'reader-a', page_key: 'ch04', anchor, body: 'Remember this' };
  db.replies = [{ data: saved, error: null }];
  expect(await createReaderNote('reader-a', 'ch04', anchor, '  Remember this  ')).toEqual(saved);
  expect(db.calls).toContainEqual(['insert', { user_id: 'reader-a', page_key: 'ch04', anchor, body: 'Remember this' }]);
});

test('editing and deleting require both the note ID and the current owner', async () => {
  db.replies = [{ data: { id: 'note-a', body: 'edited' }, error: null }, { data: { id: 'note-a' }, error: null }];
  await updateReaderNote('reader-a', 'note-a', ' edited ');
  await deleteReaderNote('reader-a', 'note-a');
  expect(db.calls.filter((c) => c[0] === 'eq')).toEqual([
    ['eq', 'id', 'note-a'], ['eq', 'user_id', 'reader-a'], ['eq', 'id', 'note-a'], ['eq', 'user_id', 'reader-a'],
  ]);
});

test('a rejected write is never reported as saved', async () => {
  const error = { code: '42501', message: 'RLS rejected the write' };
  db.replies = [{ data: null, error }];
  await expect(createReaderNote('reader-a', 'ch04', anchor, 'draft')).rejects.toBe(error);
});

test('an inaccessible note is not reported as successfully deleted', async () => {
  db.replies = [{ data: null, error: null }];
  await expect(deleteReaderNote('reader-a', 'foreign-note')).rejects.toThrow('NOTE_NOT_FOUND');
});
