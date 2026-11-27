import { createClient } from '@supabase/supabase-js';
import { EXAM_DOWNLOAD_ENDPOINT, EXAM_FILES, EXAM_ZIP } from '../src/data/pastExams.js';

const bucket = 'past_papers';
const knownFiles = new Set([EXAM_ZIP.file, ...EXAM_FILES.map(({ file }) => file)]);
const privateHeaders = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff' };

function failure(status: number) {
  return new Response(null, { status, headers: privateHeaders });
}

async function issueLinks(request: Request, project: URL, key: string) {
  const authorization = request.headers.get('Authorization');
  if (!authorization || !/^Bearer [\w.-]+$/iu.test(authorization)) return failure(401);
  const body = await request.json().catch(() => null);
  const files: unknown = body?.files;
  const expiresIn: unknown = body?.expiresIn;
  if (!Array.isArray(files) || !files.length || files.length > knownFiles.size
    || !files.every((file) => typeof file === 'string' && knownFiles.has(file))
    || typeof expiresIn !== 'number' || !Number.isInteger(expiresIn) || expiresIn < 1 || expiresIn > 3600) return failure(400);

  const client = createClient(project.origin, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    global: { headers: { Authorization: authorization } },
  });
  const access = await client.rpc('has_exam_access').abortSignal(request.signal);
  if (access.error) return failure(access.status === 401 || access.status === 403 ? access.status : 502);
  if (access.data !== true) return failure(403);

  const { data, error } = await client.storage.from(bucket).createSignedUrls(files, expiresIn);
  if (error) return failure(502);
  const links: Record<string, string> = {};
  for (const entry of data ?? []) {
    const signed = entry.signedUrl ?? entry.signedURL;
    if (entry.error || !entry.path || !knownFiles.has(entry.path) || !signed) continue;
    const url = new URL(signed, project);
    const token = url.searchParams.get('token');
    if (url.origin !== project.origin || !token) continue;
    const params = new URLSearchParams({ file: entry.path, token });
    links[entry.path] = `${EXAM_DOWNLOAD_ENDPOINT}?${params}`;
  }
  return Response.json(links, { headers: privateHeaders });
}

async function download(request: Request, project: URL) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');
  const token = searchParams.get('token');
  if (!file || !knownFiles.has(file) || !token || token.length > 4096) return failure(400);

  const upstream = new URL(`/storage/v1/object/sign/${bucket}/${encodeURIComponent(file)}`, project);
  upstream.searchParams.set('token', token);
  const range = request.headers.get('Range');
  const headers = new Headers({ 'Accept-Encoding': 'identity' });
  if (range && /^bytes=\d*-\d*$/u.test(range)) headers.set('Range', range);
  const response = await fetch(upstream, { headers, redirect: 'manual', cache: 'no-store', signal: request.signal });
  if (!response.ok) {
    await response.body?.cancel();
    return failure(response.status === 404 || response.status === 416 ? response.status : response.status < 500 ? 403 : 502);
  }

  const attachmentHeaders = new Headers({
    ...privateHeaders,
    'Content-Type': file === EXAM_ZIP.file ? 'application/zip' : 'application/pdf',
    'Content-Disposition': `attachment; filename="${file}"`,
  });
  for (const name of ['Accept-Ranges', 'Content-Range', 'Content-Length']) {
    const value = response.headers.get(name);
    if (value) attachmentHeaders.set(name, value);
  }
  return new Response(response.body, { status: response.status, headers: attachmentHeaders });
}

export async function handleExamDownloads(request: Request, projectUrl?: string, publishableKey?: string) {
  if (request.method !== 'POST' && request.method !== 'GET') return failure(405);
  if (!projectUrl || !publishableKey?.startsWith('sb_publishable_')) return failure(503);
  try {
    const project = new URL(projectUrl);
    if (project.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(project.hostname)) return failure(503);
    return request.method === 'POST' ? await issueLinks(request, project, publishableKey) : await download(request, project);
  } catch {
    console.error('Exam downloads request failed', request.method);
    return failure(502);
  }
}
