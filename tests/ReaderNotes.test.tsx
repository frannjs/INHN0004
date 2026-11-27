// @vitest-environment happy-dom
import React, { useRef, useState } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { ReaderNotes, type NotesView } from '../src/components/notes/ReaderNotes';
import { createReaderHighlight, deleteReaderHighlight, loadReaderHighlights, updateReaderHighlight, type ReaderHighlight } from '../src/lib/readerHighlights';
import { createReaderNote, deleteReaderNote, loadReaderNotes, type ReaderNote } from '../src/lib/readerNotes';

vi.mock('../src/lib/readerNotes', () => ({
  loadReaderNotes: vi.fn(), createReaderNote: vi.fn(), updateReaderNote: vi.fn(), deleteReaderNote: vi.fn(),
}));
vi.mock('../src/lib/readerHighlights', () => ({
  loadReaderHighlights: vi.fn(), createReaderHighlight: vi.fn(), updateReaderHighlight: vi.fn(), deleteReaderHighlight: vi.fn(),
}));

const anchor = { quote: 'a binary relation', prefix: '', suffix: '', start: 0, end: 17 };
const saved: ReaderNote = { id: 'note-a', user_id: 'user-a', page_key: 'ch04', anchor, body: 'Remember the ordered pairs.', created_at: '2026-11-25T12:00:00Z', updated_at: '2026-11-25T12:00:00Z' };

function Book({ userId = 'user-a', page = 'ch04' }) {
  const ref = useRef<HTMLElement>(null);
  const [view, setView] = useState<NotesView>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  return <>
    <button ref={trigger} onClick={() => setView('list')}>Open notes</button>
    <main ref={ref}><article className="chapter-article"><p>A passage about a binary relation and ordered pairs.</p></article></main>
    <ReaderNotes key={userId} userId={userId} pageKey={page} articleContainer={ref} triggerRef={trigger} view={view} onViewChange={setView} onNavigate={() => {}} />
  </>;
}

beforeEach(() => {
  vi.mocked(loadReaderNotes).mockResolvedValue([]);
  vi.mocked(loadReaderHighlights).mockResolvedValue([]);
  vi.spyOn(Range.prototype, 'getClientRects').mockReturnValue([{ left: 100, right: 240, top: 150, bottom: 170, width: 140, height: 20 }] as unknown as DOMRectList);
  vi.spyOn(Range.prototype, 'getBoundingClientRect').mockReturnValue({ left: 100, right: 240, top: 150, bottom: 170, width: 140, height: 20 } as DOMRect);
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => { cleanup(); window.getSelection()?.removeAllRanges(); vi.restoreAllMocks(); vi.resetAllMocks(); });

async function selectText() {
  await act(async () => {
    const range = document.createRange();
    const text = document.querySelector('article p')!.firstChild!;
    range.setStart(text, 16); range.setEnd(text, 33);
    window.getSelection()!.removeAllRanges(); window.getSelection()!.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
  });
}

async function selectPassage() {
  await selectText();
  fireEvent.click(await screen.findByRole('button', { name: 'Add note' }));
  await screen.findByRole('textbox', { name: 'Your note' });
}

test('the pastel palette applies to the captured selection, reloads, and edits a single highlight', async () => {
  let stored: ReaderHighlight[] = [];
  vi.mocked(loadReaderHighlights).mockImplementation(async (user) => stored.filter(({ user_id }) => user_id === user));
  vi.mocked(createReaderHighlight).mockImplementation(async (user_id, page_key, selected, color) => {
    stored = [{ id: 'highlight-a', user_id, page_key, anchor: selected, color, created_at: saved.created_at }];
    return stored[0];
  });
  vi.mocked(updateReaderHighlight).mockImplementation(async (_user, _id, color) => {
    stored = [{ ...stored[0], color }];
    return stored[0];
  });
  vi.mocked(deleteReaderHighlight).mockImplementation(async () => { stored = []; });
  const first = render(<Book />);
  vi.spyOn(document.querySelector('article')!, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 100, 320, 200));
  await selectText();
  expect(await screen.findByRole('button', { name: 'Add note' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Highlight' }));
  for (const name of ['Peach', 'Lavender', 'Ice blue', 'Mint']) expect(screen.getByRole('button', { name })).toBeTruthy();
  await act(async () => { window.getSelection()?.removeAllRanges(); document.dispatchEvent(new Event('selectionchange')); });
  fireEvent.click(screen.getByRole('button', { name: 'Mint' }));
  await waitFor(() => expect(document.querySelector('.note-paint[data-highlight-color="mint"]')).toBeTruthy());
  expect(createReaderHighlight).toHaveBeenCalledWith('user-a', 'ch04', expect.objectContaining({ quote: 'a binary relation' }), 'mint');
  expect(createReaderNote).not.toHaveBeenCalled();
  first.unmount();

  render(<Book />);
  vi.spyOn(document.querySelector('article')!, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 100, 320, 200));
  await waitFor(() => expect(document.querySelector('.note-paint[data-highlight-color="mint"]')).toBeTruthy());
  await selectText();
  fireEvent.click(await screen.findByRole('button', { name: 'Highlight' }));
  expect(screen.getByRole('button', { name: 'Mint' }).getAttribute('aria-pressed')).toBe('true');
  fireEvent.click(screen.getByRole('button', { name: 'Lavender' }));
  await waitFor(() => expect(document.querySelector('.note-paint[data-highlight-color="lavender"]')).toBeTruthy());
  expect(updateReaderHighlight).toHaveBeenCalledWith('user-a', 'highlight-a', 'lavender');
  await selectText();
  fireEvent.click(await screen.findByRole('button', { name: 'Highlight' }));
  fireEvent.click(screen.getByRole('button', { name: 'Remove highlight' }));
  await waitFor(() => expect(document.querySelector('.note-paint.highlight')).toBeNull());
  expect(deleteReaderHighlight).toHaveBeenCalledWith('user-a', 'highlight-a');
});

function writeNote(text: string) {
  const input = screen.getByRole('textbox', { name: 'Your note' });
  input.textContent = text;
  fireEvent.input(input);
}

test('selection saves its quote, page, and owner; the saved note survives a component reload', async () => {
  let stored: ReaderNote[] = [];
  vi.mocked(loadReaderNotes).mockImplementation(async () => stored);
  vi.mocked(createReaderNote).mockImplementation(async (user, page, selected, body) => {
    stored = [{ ...saved, user_id: user, page_key: page, anchor: selected, body }];
    return stored[0];
  });
  const view = render(<Book />);
  await selectPassage();
  writeNote(saved.body);
  fireEvent.click(screen.getByRole('button', { name: 'Save note' }));
  await screen.findByText('Note saved.');
  expect(createReaderNote).toHaveBeenCalledWith('user-a', 'ch04', expect.objectContaining({ quote: 'a binary relation' }), saved.body);
  view.unmount();
  render(<Book />);
  fireEvent.click(screen.getByRole('button', { name: 'Open notes' }));
  expect(await screen.findByText(saved.body)).toBeTruthy();
});

test('a failed save retains the draft through dismissal and chapter navigation', async () => {
  vi.mocked(createReaderNote).mockRejectedValue(new Error('network unavailable'));
  const view = render(<Book />);
  await selectPassage();
  writeNote('Do not lose this draft.');
  fireEvent.click(screen.getByRole('button', { name: 'Save note' }));
  await screen.findByRole('alert');
  expect(screen.queryByText('Note saved.')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Close notes' }));
  view.rerender(<Book page="ch07" />);
  fireEvent.click(screen.getByRole('button', { name: 'Open notes' }));
  fireEvent.click(screen.getByRole('button', { name: /Resume draft/ }));
  expect(screen.getByLabelText('Your note').textContent).toBe('Do not lose this draft.');
  fireEvent.click(screen.getByRole('button', { name: 'Save note' }));
  await waitFor(() => expect(createReaderNote).toHaveBeenCalledTimes(2));
  expect(vi.mocked(createReaderNote).mock.calls[1][1]).toBe('ch04');
});

test('switching accounts clears notes and ignores an old account response', async () => {
  let finishOld!: (notes: ReaderNote[]) => void;
  vi.mocked(loadReaderNotes).mockImplementation((user) => user === 'user-a' ? new Promise((resolve) => { finishOld = resolve; }) : Promise.resolve([]));
  const view = render(<Book />);
  fireEvent.click(screen.getByRole('button', { name: 'Open notes' }));
  view.rerender(<Book userId="user-b" />);
  await act(async () => { finishOld([saved]); });
  await screen.findByText(/Select a passage/);
  expect(screen.queryByText(saved.body)).toBeNull();
  expect(loadReaderNotes).toHaveBeenCalledWith('user-b');
});

test('failed deletion keeps the saved note visible and allows retry', async () => {
  vi.mocked(loadReaderNotes).mockResolvedValue([saved]);
  vi.mocked(deleteReaderNote).mockRejectedValue(new Error('network unavailable'));
  render(<Book />);
  fireEvent.click(screen.getByRole('button', { name: 'Open notes' }));
  await screen.findByText(saved.body);
  fireEvent.click(screen.getByRole('button', { name: /Remember the ordered pairs/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Delete note' }));
  fireEvent.click(screen.getByRole('button', { name: 'Confirm deletion' }));
  await screen.findByText('Could not delete the note. Please try again.');
  expect(screen.getByText(saved.body)).toBeTruthy();
  expect(deleteReaderNote).toHaveBeenCalledWith('user-a', saved.id);
});


test('clicking the page or card never dismisses a draft; explicit close preserves it', async () => {
  render(<Book />);
  await selectPassage();
  writeNote('Keep my thought.');
  fireEvent.pointerDown(document.querySelector('article')!);
  expect(screen.getByRole('dialog', { name: 'Write a note' })).toBeTruthy();
  fireEvent.pointerDown(screen.getByLabelText('Your note'));
  expect(screen.getByRole('dialog', { name: 'Write a note' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Close notes' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Open notes' }));
  fireEvent.click(screen.getByRole('button', { name: /Resume draft/ }));
  expect(screen.getByLabelText('Your note').textContent).toBe('Keep my thought.');
});

test('Ctrl/Command Enter saves without moving to a notes panel', async () => {
  vi.mocked(createReaderNote).mockResolvedValue(saved);
  vi.mocked(loadReaderNotes).mockResolvedValue([saved]);
  render(<Book />);
  await selectPassage();
  writeNote(saved.body);
  fireEvent.keyDown(screen.getByLabelText('Your note'), { key: 'Enter', metaKey: true });
  await screen.findByRole('dialog', { name: 'Passage note' });
  expect(createReaderNote).toHaveBeenCalledTimes(1);
  expect(document.querySelector('.reader-notes-panel')).toBeNull();
});


test('the composer focuses immediately and supports moving the card with the keyboard', async () => {
  render(<Book />);
  await selectPassage();
  await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText('Your note')));
  const card = screen.getByRole('dialog', { name: 'Write a note' });
  const before = parseFloat(card.style.left);
  fireEvent.keyDown(screen.getByRole('button', { name: 'Move note' }), { key: 'ArrowRight' });
  expect(parseFloat(card.style.left)).toBe(before + 10);
  writeNote('A moved draft.');
  expect(parseFloat(card.style.left)).toBe(before + 10);
});

test('delete stays inside the note and can be cancelled without losing anything', async () => {
  vi.mocked(loadReaderNotes).mockResolvedValue([saved]);
  render(<Book />);
  fireEvent.click(screen.getByRole('button', { name: 'Open notes' }));
  fireEvent.click(await screen.findByRole('button', { name: /Remember the ordered pairs/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Delete note' }));
  expect(screen.getByText('Delete this note?')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Cancel', exact: true }));
  expect(deleteReaderNote).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Edit note' })).toBeTruthy();
});


test('repeated close and reopen keeps one surface and never leaves it hidden while open', async () => {
  render(<Book />);
  await selectPassage();
  const surface = screen.getByRole('dialog');
  for (let i = 0; i < 3; i++) {
    fireEvent.click(screen.getByRole('button', { name: 'Close notes' }));
    fireEvent.click(screen.getByRole('button', { name: 'Open notes' }));
    expect(screen.getByRole('dialog')).toBe(surface);
    expect(surface.getAttribute('data-state')).toBe('open');
    expect(surface.getAttribute('aria-hidden')).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: /Resume draft/ }));
    expect(screen.getByRole('dialog', { name: 'Write a note' })).toBe(surface);
    expect(surface.style.visibility).not.toBe('hidden');
  }
});

test('saving and editing keep the same visible surface while a background refresh completes', async () => {
  let stored: ReaderNote[] = [];
  vi.mocked(loadReaderNotes).mockImplementation(async () => stored);
  vi.mocked(createReaderNote).mockImplementation(async () => { stored = [saved]; return saved; });
  render(<Book />);
  await selectPassage();
  const surface = screen.getByRole('dialog');
  writeNote(saved.body);
  fireEvent.click(screen.getByRole('button', { name: 'Save note' }));
  await screen.findByRole('button', { name: 'Edit note' });
  expect(screen.getByRole('dialog')).toBe(surface);
  fireEvent.click(screen.getByRole('button', { name: 'Edit note' }));
  expect(screen.getByRole('dialog')).toBe(surface);
  expect(surface.getAttribute('data-state')).toBe('open');
  expect(surface.getAttribute('aria-hidden')).toBe('false');
});


test('a second selection opens in the same visible card after saving the first note', async () => {
  let stored: ReaderNote[] = [];
  vi.mocked(loadReaderNotes).mockImplementation(async () => stored);
  vi.mocked(createReaderNote).mockImplementation(async (_owner, _page, selected, body) => { stored = [{ ...saved, anchor: selected, body }]; return stored[0]; });
  render(<Book />);
  await selectPassage();
  const surface = screen.getByRole('dialog');
  writeNote(saved.body);
  fireEvent.click(screen.getByRole('button', { name: 'Save note' }));
  await screen.findByRole('button', { name: 'Edit note' });
  await selectPassage();
  expect(screen.getByRole('dialog', { name: 'Write a note' })).toBe(surface);
  expect(surface.getAttribute('data-state')).toBe('open');
});
