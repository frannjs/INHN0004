import { createClient } from '@supabase/supabase-js';

const projectUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

function hasValidConfiguration() {
  if (!projectUrl || !publishableKey?.startsWith('sb_publishable_')) return false;
  try {
    const url = new URL(projectUrl);
    return url.protocol === 'https:' ||
      (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname));
  } catch {
    return false;
  }
}

// A server/secret key must never be accepted by the browser client.
export const supabase = hasValidConfiguration()
  ? createClient(projectUrl!, publishableKey!, {
      global: {
        fetch: (input, init) => {
          const url = new URL(input instanceof Request ? input.url : input);
          const keepalive = init?.method === 'POST' && url.pathname === '/rest/v1/reader_positions';
          return fetch(input, keepalive ? { ...init, keepalive } : init);
        },
      },
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export async function signInWithGoogle() {
  if (!supabase) throw new Error('AUTH_NOT_CONFIGURED');

  // Surface disabled-provider errors inside the reader before starting OAuth.
  const response = await fetch(`${projectUrl!.replace(/\/$/, '')}/auth/v1/settings`, {
    headers: { apikey: publishableKey! },
  });
  if (!response.ok) throw new Error('AUTH_UNAVAILABLE');
  const settings = await response.json();
  if (!settings.external?.google) throw new Error('GOOGLE_NOT_ENABLED');

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: new URL(import.meta.env.BASE_URL, window.location.href).href,
    },
  });
  if (error) throw error;
}
