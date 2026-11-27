import { handleExamDownloads } from '../server/examDownloads.js';

function serve(request: Request) {
  return handleExamDownloads(request, process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);
}

export default { fetch: serve };
