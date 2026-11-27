import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { defineConfig, type Connect, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { EXAM_DOWNLOAD_ENDPOINT } from './src/data/pastExams';
import { handleExamDownloads } from './server/examDownloads';

function examDownloadMiddleware(env: Record<string, unknown>): Connect.NextHandleFunction {
  return async (req, res) => {
    const controller = new AbortController();
    res.once('close', () => { if (!res.writableEnded) controller.abort(); });
    try {
      const headers = new Headers();
      for (const [name, value] of Object.entries(req.headers)) {
        if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(', ') : value);
      }
      const init: RequestInit & { duplex?: 'half' } = { method: req.method, headers, signal: controller.signal };
      if (req.method === 'POST') {
        init.body = Readable.toWeb(req) as ReadableStream<Uint8Array>;
        init.duplex = 'half';
      }
      const request = new Request(`http://localhost${EXAM_DOWNLOAD_ENDPOINT}${req.url ?? ''}`, init);
      const result = await handleExamDownloads(request, env.VITE_SUPABASE_URL as string, env.VITE_SUPABASE_PUBLISHABLE_KEY as string);
      res.statusCode = result.status;
      result.headers.forEach((value, name) => res.setHeader(name, value));
      if (result.body) await pipeline(Readable.fromWeb(result.body), res);
      else res.end();
    } catch {
      if (res.destroyed) return;
      if (res.headersSent) res.destroy();
      else { res.statusCode = 502; res.end(); }
    }
  };
}

const examDownloads: Plugin = {
  name: 'exam-downloads',
  configureServer(server) {
    server.middlewares.use(EXAM_DOWNLOAD_ENDPOINT, examDownloadMiddleware(server.config.env));
  },
  configurePreviewServer(server) {
    server.middlewares.use(EXAM_DOWNLOAD_ENDPOINT, examDownloadMiddleware(server.config.env));
  },
};

export default defineConfig({
  plugins: [react(), examDownloads],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/') && id.includes('/katex/')) return 'math';
          if (id.includes('/src/chapters/content/') && id.endsWith('.md?raw')) return 'lessons';
          if (id.includes('/src/chapters/practice/') && id.endsWith('.md?raw')) return 'worked-practice';
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  },
});
