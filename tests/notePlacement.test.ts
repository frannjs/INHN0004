import { expect, test } from 'vitest';
import { placeNotePopover } from '../src/lib/notePlacement';

test('uses the outer margin without covering or resizing the passage on a wide screen', () => {
  const position = placeNotePopover({ left: 360, right: 780, top: 400, bottom: 425 }, { width: 1600, height: 1000 }, 220, 1100);
  expect(position).toMatchObject({ placement: 'side', left: 1120, top: 384, width: 320 });
});

test('stays next to the selected line and within narrow screen edges', () => {
  const position = placeNotePopover({ left: 260, right: 301, top: 390, bottom: 414 }, { width: 319, height: 1033 }, 220, 301);
  expect(position).toMatchObject({ left: 12, top: 426, width: 295, placement: 'below' });
});

test('flips above a low passage instead of clipping the editor at the bottom', () => {
  const position = placeNotePopover({ left: 50, right: 200, top: 740, bottom: 764 }, { width: 390, height: 820 }, 240);
  expect(position.top + 240).toBeLessThan(740);
  expect(position.placement).toBe('above');
});

test('respects a reduced visual viewport when the mobile keyboard opens', () => {
  const position = placeNotePopover({ left: 20, right: 200, top: 400, bottom: 424 }, { width: 390, height: 380, top: 20 }, 280);
  expect(position.top).toBeGreaterThanOrEqual(112);
  expect(position.top + Math.min(280, position.maxHeight)).toBeLessThanOrEqual(388);
});


test('growing the editor preserves its placement instead of flipping across the passage', () => {
  const anchor = { left: 40, right: 250, top: 480, bottom: 504 };
  const initial = placeNotePopover(anchor, { width: 390, height: 820 }, 224);
  const expanded = placeNotePopover(anchor, { width: 390, height: 820 }, 334, undefined, initial.placement);
  expect(initial.placement).toBe('below');
  expect(expanded.placement).toBe('below');
  expect(Math.abs(expanded.top - initial.top)).toBeLessThan(60);
  expect(expanded.top + 334).toBeLessThanOrEqual(808);
});
