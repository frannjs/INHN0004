import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { EXAM_DOWNLOAD_ENDPOINT, EXAM_FILES, EXAM_ZIP } from '../src/data/pastExams';
import { handleExamDownloads } from '../server/examDownloads';

const storage = vi.hoisted(() => ({ createClient: vi.fn(), canDownload: vi.fn(), sign: vi.fn() }));
vi.mock('@supabase/supabase-js', () => ({ createClient: storage.createClient }));

const project = 'https://project.example.test';
const key = 'sb_publishable_test';
const application = 'https://ds.tum.ninja';
const file = EXAM_FILES[0].file;
const requestUrl = application + EXAM_DOWNLOAD_ENDPOINT;

function signRequest(files = [file], authorized = true) {
  return new Request(requestUrl, {
    method: 'POST',
    headers: authorized ? { Authorization: 'Bearer token.example.test' } : {},
    body: JSON.stringify({ files, expiresIn: 3600 }),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  storage.createClient.mockReturnValue({
    rpc: () => ({ abortSignal: storage.canDownload }),
    storage: { from: () => ({ createSignedUrls: storage.sign }) },
  });
  storage.canDownload.mockResolvedValue({ data: true });
});

afterEach(() => vi.unstubAllGlobals());

test('signs only for an allowed session and returns a same-origin download link', async () => {
  storage.sign.mockResolvedValue({ data: [
    { path: file, signedUrl: `${project}/storage/v1/object/sign/past_papers/${file}?token=private-test-token` },
  ] });
  const response = await handleExamDownloads(signRequest(), project, key);

  expect(response.status).toBe(200);
  expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  expect(await response.json()).toEqual({ [file]: `${EXAM_DOWNLOAD_ENDPOINT}?file=${file}&token=private-test-token` });
  expect(storage.createClient).toHaveBeenCalledWith(project, key, expect.objectContaining({
    global: { headers: { Authorization: 'Bearer token.example.test' } },
  }));
  expect(storage.sign).toHaveBeenCalledWith([file], 3600);
});

test('denies anonymous users, unlisted files, and signed-in users without access', async () => {
  expect((await handleExamDownloads(signRequest([file], false), project, key)).status).toBe(401);
  expect((await handleExamDownloads(signRequest(['Unknown.pdf']), project, key)).status).toBe(400);
  storage.canDownload.mockResolvedValue({ data: false });
  expect((await handleExamDownloads(signRequest(), project, key)).status).toBe(403);
  expect(storage.sign).not.toHaveBeenCalled();
});

test('serves the signed ZIP as a private attachment without redirecting the browser', async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response('archive', { headers: { 'Content-Length': '7' } }));
  vi.stubGlobal('fetch', fetcher);
  const response = await handleExamDownloads(new Request(`${requestUrl}?file=${EXAM_ZIP.file}&token=signed`), project, key);

  expect(response.status).toBe(200);
  expect(response.headers.get('Content-Disposition')).toBe(`attachment; filename="${EXAM_ZIP.file}"`);
  expect(response.headers.get('Content-Type')).toBe('application/zip');
  expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  expect(await response.text()).toBe('archive');
  expect(fetcher.mock.calls[0][0].href).toBe(`${project}/storage/v1/object/sign/past_papers/${EXAM_ZIP.file}?token=signed`);
  expect(fetcher.mock.calls[0][1].redirect).toBe('manual');
});

test('passes through a byte range and rejects a missing or invalid link', async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(new Response('PDF', {
    status: 206, headers: { 'Content-Range': 'bytes 0-2/10' },
  })).mockResolvedValueOnce(new Response('expired', { status: 400 }));
  vi.stubGlobal('fetch', fetcher);
  const partial = await handleExamDownloads(new Request(`${requestUrl}?file=${file}&token=valid`, {
    headers: { Range: 'bytes=0-2' },
  }), project, key);
  expect(partial.status).toBe(206);
  expect(partial.headers.get('Content-Range')).toBe('bytes 0-2/10');
  expect(partial.headers.get('Content-Type')).toBe('application/pdf');
  expect(fetcher.mock.calls[0][1].headers.get('Range')).toBe('bytes=0-2');
  expect((await handleExamDownloads(new Request(`${requestUrl}?file=${file}&token=expired`), project, key)).status).toBe(403);
  expect((await handleExamDownloads(new Request(`${requestUrl}?file=${file}`), project, key)).status).toBe(400);
});
