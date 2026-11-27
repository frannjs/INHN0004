// @vitest-environment happy-dom
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

const sdk = vi.hoisted(() => ({ createClient: vi.fn(), signInWithOAuth: vi.fn() }));
vi.mock('@supabase/supabase-js', () => ({ createClient: sdk.createClient }));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv('VITE_SUPABASE_URL', 'https://test-project.supabase.co');
  vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test_key');
  vi.stubEnv('BASE_URL', './');
  window.history.replaceState(null, '', '/');
  sdk.createClient.mockReturnValue({ auth: { signInWithOAuth: sdk.signInWithOAuth } });
  sdk.signInWithOAuth.mockResolvedValue({ error: null });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ external: { google: true } }) }));
});

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

test('refuses a server secret supplied as browser configuration', async () => {
  vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_secret_test_only');
  const { supabase } = await import('../src/lib/supabase');
  expect(supabase).toBeNull();
  expect(sdk.createClient).not.toHaveBeenCalled();
});

test('missing configuration does not crash the page or start OAuth', async () => {
  vi.stubEnv('VITE_SUPABASE_URL', '');
  const { supabase, signInWithGoogle } = await import('../src/lib/supabase');
  expect(supabase).toBeNull();
  await expect(signInWithGoogle()).rejects.toThrow('AUTH_NOT_CONFIGURED');
  expect(sdk.signInWithOAuth).not.toHaveBeenCalled();
});

test('a relative Vite base resolves to the real callback origin and uses PKCE', async () => {
  window.history.replaceState(null, '', '/book/index.html');
  const { signInWithGoogle } = await import('../src/lib/supabase');
  await signInWithGoogle();
  expect(sdk.createClient.mock.calls[0][2].auth).toMatchObject({ flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true });
  expect(sdk.signInWithOAuth).toHaveBeenCalledWith({
    provider: 'google', options: { redirectTo: `${window.location.origin}/book/` },
  });
});

test('disabled Google does not send the browser to a raw OAuth error page', async () => {
  vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ external: { google: false } }) } as Response);
  const { signInWithGoogle } = await import('../src/lib/supabase');
  await expect(signInWithGoogle()).rejects.toThrow('GOOGLE_NOT_ENABLED');
  expect(sdk.signInWithOAuth).not.toHaveBeenCalled();
});

test('an unavailable project fails before navigation', async () => {
  vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);
  const { signInWithGoogle } = await import('../src/lib/supabase');
  await expect(signInWithGoogle()).rejects.toThrow('AUTH_UNAVAILABLE');
  expect(sdk.signInWithOAuth).not.toHaveBeenCalled();
});
