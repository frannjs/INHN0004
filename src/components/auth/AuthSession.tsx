import React, { useEffect, useState } from 'react';
import { isAuthRetryableFetchError, type Session, type User } from '@supabase/supabase-js';
import { restoreReadingLink, saveReadingLink } from '../../lib/readingLink';
import { signInWithGoogle, supabase } from '../../lib/supabase';

function redirectError() {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  const error = url.searchParams.get('error') ||
    new URLSearchParams(url.hash.slice(1)).get('error');
  if (!error) return '';
  return error === 'access_denied'
    ? 'Google sign-in was cancelled. You can try again.'
    : 'Google sign-in did not finish. Please try again.';
}

function clearRedirectError() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has('error') && !new URLSearchParams(url.hash.slice(1)).has('error')) return;
  for (const key of ['error', 'error_code', 'error_description']) url.searchParams.delete(key);
  if (new URLSearchParams(url.hash.slice(1)).has('error')) url.hash = '';
  window.history.replaceState(window.history.state, '', url);
}

export const AuthLoading: React.FC = () => (
  <main className="auth-screen" aria-busy="true">
    <p className="auth-loading" role="status">Opening…</p>
  </main>
);

interface AccountSession {
  user: User | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  signingIn: boolean;
  error: string;
}

export const AuthSession: React.FC<{
  children: (account: AccountSession) => React.ReactNode;
}> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState(redirectError);

  useEffect(() => {
    const auth = supabase?.auth;
    if (!auth) return;
    let mounted = true;
    let authRevision = 0;
    let retry: number | undefined;
    let checking = false;
    const { data: { subscription } } = auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      // INITIAL_SESSION can be null when a stored token could not be refreshed.
      // getSession supplies the error needed to distinguish that from sign-out.
      if (event === 'INITIAL_SESSION' && !nextSession) return;
      authRevision++;
      window.clearTimeout(retry);
      retry = undefined;
      if (nextSession) restoreReadingLink();
      setSession(nextSession);
      setSigningIn(false);
      if (nextSession) setError('');
    });

    const restore = async () => {
      if (!mounted || checking) return;
      window.clearTimeout(retry);
      retry = undefined;
      const revision = authRevision;
      checking = true;
      try {
        const { data, error: sessionError } = await auth.getSession();
        if (!mounted || authRevision !== revision) return;
        if (sessionError && isAuthRetryableFetchError(sessionError)) {
          retry = window.setTimeout(() => void restore(), 5000);
          return;
        }
        if (data.session) restoreReadingLink();
        setSession(data.session);
        if (sessionError) setError('Your session could not be restored. Please sign in again.');
      } catch {
        if (mounted && authRevision === revision) {
          setError('Could not connect. Please try signing in again.');
        }
      } finally {
        checking = false;
        if (mounted) clearRedirectError();
      }
    };
    const onOnline = () => { if (retry !== undefined) void restore(); };
    window.addEventListener('online', onOnline);
    void restore();

    return () => {
      mounted = false;
      window.clearTimeout(retry);
      window.removeEventListener('online', onOnline);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async () => {
    setSigningIn(true);
    setError('');
    try {
      saveReadingLink();
      await signInWithGoogle();
    } catch (cause) {
      setError(cause instanceof Error && ['GOOGLE_NOT_ENABLED', 'AUTH_NOT_CONFIGURED'].includes(cause.message)
        ? 'Google sign-in is being set up. Please try again shortly.'
        : 'Could not start Google sign-in. Please try again.');
    } finally {
      setSigningIn(false);
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' });
    if (signOutError) throw signOutError;
    setSession(null);
    setSigningIn(false);
    setError('');
  };

  return <>{children({ user: session?.user ?? null, signIn, signOut, signingIn, error })}</>;
};
