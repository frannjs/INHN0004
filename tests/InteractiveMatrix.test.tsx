// @vitest-environment happy-dom
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { InteractiveMatrix } from '../src/components/math/InteractiveMatrix';
import { TokenWalkAndClosureExplorer } from '../src/components/visuals/TokenWalkAndClosureExplorer';

afterEach(cleanup);

test('an editable matrix has one Tab stop and moves the row and column preview with keyboard focus', () => {
  const toggle = vi.fn();
  const preview = vi.fn();
  render(<InteractiveMatrix matrix={[[1, 0], [0, 1]]} labels={['a', 'b']} onToggle={toggle} onHoverCell={preview} />);

  const topLeft = screen.getByRole('button', { name: 'Row a, column a, value 1' });
  const topRight = screen.getByRole('button', { name: 'Row a, column b, value 0' });
  const bottomRight = screen.getByRole('button', { name: 'Row b, column b, value 1' });

  expect(screen.getAllByRole('button').filter((button) => button.tabIndex === 0)).toEqual([topLeft]);
  expect(topLeft.getAttribute('aria-pressed')).toBe('true');
  topLeft.focus();
  fireEvent.keyDown(topLeft, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(topRight);
  expect(preview).toHaveBeenLastCalledWith([0, 1]);
  fireEvent.keyDown(topRight, { key: 'ArrowDown' });
  expect(document.activeElement).toBe(bottomRight);
  expect(screen.getAllByRole('button').filter((button) => button.tabIndex === 0)).toEqual([bottomRight]);
  fireEvent.click(bottomRight);
  expect(toggle).toHaveBeenCalledWith(1, 1);
});

test('the product matrix announces the selected result even when its value is zero', () => {
  render(<InteractiveMatrix matrix={[[1, 0], [0, 1]]} labels={['1', '2']} selectedCell={[0, 1]} onToggle={() => {}} />);
  expect(screen.getByRole('button', { name: 'Row 1, column 2, value 0' }).getAttribute('aria-pressed')).toBe('true');
  expect(screen.getByRole('button', { name: 'Row 1, column 1, value 1' }).getAttribute('aria-pressed')).toBe('false');
});

test('the closure explorer distinguishes exact steps, positive-length cycles, and reachability', () => {
  const { container } = render(<TokenWalkAndClosureExplorer />);
  fireEvent.click(screen.getByRole('button', { name: '4-Cycle' }));
  const result = () => [...container.querySelectorAll('.latex-matrix-container:nth-child(2) .mat-entry-btn')]
    .map((cell) => Number(cell.textContent));
  const stages = [...container.querySelectorAll('button[aria-pressed]')]
    .filter((button) => button.querySelector('annotation'));
  const choose = (formula: string) => {
    const button = stages.find((entry) => entry.querySelector('annotation')?.textContent === formula)!;
    fireEvent.click(button);
    expect(button.getAttribute('aria-pressed')).toBe('true');
  };

  choose('R^0');
  expect(result()).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  choose('R^3');
  expect(result().filter(Boolean)).toHaveLength(4);
  expect([0, 5, 10, 15].map((index) => result()[index])).toEqual([0, 0, 0, 0]);
  choose('R^+');
  expect(result()).toEqual(Array(16).fill(1));
  choose('R^*');
  expect(result()).toEqual(Array(16).fill(1));
});
