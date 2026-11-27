// @vitest-environment happy-dom
import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { AuthRetryableFetchError } from '@supabase/supabase-js';

const auth = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signOut: vi.fn(),
  signIn: vi.fn(),
  unsubscribe: vi.fn(),
  listener: undefined as undefined | ((event: string, session: unknown) => void),
}));

vi.mock('../src/lib/supabase', () => ({
  supabase: { auth },
  signInWithGoogle: auth.signIn,
}));

import { AuthSession } from '../src/components/auth/AuthSession';

const session = { user: { id: 'test-reader', app_metadata: { provider: 'google' } } };
const mountReader = () => render(
  <AuthSession>{({ user, signIn, signOut, signingIn, error }) => (
    <div>
      <h1>Textbook</h1>
      {user ? <button onClick={() => void signOut()}>Sign out</button>
        : <button disabled={signingIn} onClick={() => void signIn()}>Sign in</button>}
      {error && <p role="alert">{error}</p>}
    </div>
  )}</AuthSession>
);

beforeEach(() => {
  vi.clearAllMocks();
  window.sessionStorage.clear();
  window.history.replaceState(null, '', '/');
  auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
  auth.signOut.mockResolvedValue({ error: null });
  auth.signIn.mockResolvedValue(undefined);
  auth.onAuthStateChange.mockImplementation((listener) => {
    auth.listener = listener;
    return { data: { subscription: { unsubscribe: auth.unsubscribe } } };
  });
});

afterEach(cleanup);

test('shows the textbook while session restoration is pending and after it finds no session', async () => {
  let restore!: (value: unknown) => void;
  auth.getSession.mockReturnValue(new Promise((resolve) => { restore = resolve; }));
  mountReader();
  expect(screen.getByRole('heading', { name: 'Textbook' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
  await act(async () => restore({ data: { session: null }, error: null }));
  expect(screen.getByRole('heading', { name: 'Textbook' })).toBeTruthy();
  expect(auth.signIn).not.toHaveBeenCalled();
});

test('restores a session and offers sign-in when it ends in another tab', async () => {
  auth.getSession.mockResolvedValue({ data: { session }, error: null });
  mountReader();
  expect(await screen.findByRole('button', { name: 'Sign out' })).toBeTruthy();
  act(() => auth.listener?.('SIGNED_OUT', null));
  expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Textbook' })).toBeTruthy();
});

test('a transient refresh failure keeps the textbook open and reconnects', async () => {
  auth.getSession
    .mockResolvedValueOnce({ data: { session: null }, error: new AuthRetryableFetchError('Offline', 0) })
    .mockResolvedValueOnce({ data: { session }, error: null });
  mountReader();
  act(() => auth.listener?.('INITIAL_SESSION', null));
  await act(async () => {});
  expect(screen.getByRole('heading', { name: 'Textbook' })).toBeTruthy();
  fireEvent(window, new Event('online'));
  expect(await screen.findByRole('button', { name: 'Sign out' })).toBeTruthy();
  expect(auth.getSession).toHaveBeenCalledTimes(2);
  expect(auth.signIn).not.toHaveBeenCalled();
});

test('the account button swaps between sign-in and sign-out with the textbook visible', async () => {
  mountReader();
  expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
  act(() => auth.listener?.('SIGNED_IN', session));
  fireEvent.click(await screen.findByRole('button', { name: 'Sign out' }));
  expect(await screen.findByRole('button', { name: 'Sign in' })).toBeTruthy();
  expect(auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
  expect(screen.getByRole('heading', { name: 'Textbook' })).toBeTruthy();
});

test('a private deep link survives a Google round trip while normal sign-in clears public query params', async () => {
  window.history.replaceState(null, '', '/?page=exams');
  mountReader();
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
  await waitFor(() => expect(auth.signIn).toHaveBeenCalledOnce());
  window.history.replaceState(null, '', '/?code=example-code');
  act(() => auth.listener?.('SIGNED_IN', session));
  expect(await screen.findByRole('button', { name: 'Sign out' })).toBeTruthy();
  expect(window.location.search).toBe('?code=example-code&page=exams');
  expect(window.sessionStorage.length).toBe(0);
});

test('a late restoration result cannot sign the reader back in after a newer sign-out event', async () => {
  let restore!: (value: unknown) => void;
  auth.getSession.mockReturnValue(new Promise((resolve) => { restore = resolve; }));
  mountReader();
  act(() => auth.listener?.('SIGNED_IN', session));
  expect(await screen.findByRole('button', { name: 'Sign out' })).toBeTruthy();
  act(() => auth.listener?.('SIGNED_OUT', null));
  await act(async () => restore({ data: { session }, error: null }));
  expect(screen.getByRole('heading', { name: 'Textbook' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
});

test('provider and network failures leave a retryable sign-in button', async () => {
  auth.signIn.mockRejectedValueOnce(new Error('GOOGLE_NOT_ENABLED'));
  mountReader();
  const button = screen.getByRole('button', { name: 'Sign in' });
  fireEvent.click(button);
  expect((await screen.findByRole('alert')).textContent).toContain('being set up');
  await waitFor(() => expect(button.disabled).toBe(false));
  fireEvent.click(button);
  await waitFor(() => expect(auth.signIn).toHaveBeenCalledTimes(2));
  await waitFor(() => expect(button.disabled).toBe(false));
  expect(screen.queryByRole('alert')).toBeNull();
});

test('a cancelled callback is explained and removed from the address without exposing server details', async () => {
  window.history.replaceState(null, '', '/?error=access_denied&error_description=private-detail');
  let restore!: (value: unknown) => void;
  auth.getSession.mockReturnValue(new Promise((resolve) => { restore = resolve; }));
  mountReader();
  act(() => auth.listener?.('INITIAL_SESSION', null));
  await act(async () => restore({ data: { session: null }, error: null }));
  expect((await screen.findByRole('alert')).textContent).toContain('cancelled');
  await waitFor(() => expect(window.location.search).toBe(''));
  expect(document.body.textContent).not.toContain('private-detail');
});

test('a failed session restoration stays logged out and unsubscribes on unmount', async () => {
  auth.getSession.mockRejectedValueOnce(new Error('network offline'));
  const view = mountReader();
  expect((await screen.findByRole('alert')).textContent).toContain('Could not connect');
  expect(screen.getByRole('heading', { name: 'Textbook' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
  view.unmount();
  expect(auth.unsubscribe).toHaveBeenCalledTimes(1);
});
