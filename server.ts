import path from 'node:path'
import express from 'express';
import * as zlib from 'node:zlib'
import app from './backend/app.js';
import { authMiddleware } from './middleware.js';

const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD

export async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === 'production',
  hmrPort = 24678, // Default HMR port used by Vite
) {

  /**
   * @type {import('vite').ViteDevServer}
   */
  let vite: import('vite').ViteDevServer | undefined = undefined;

  if (!isProd) {
    vite = await (await import('vite')).createServer({
      root,
      logLevel: isTest ? 'error' : 'info',
      server: {
        middlewareMode: true,
        
        watch: {
          // During tests we edit the files too fast and sometimes chokidar
          // misses change events, so enforce polling for consistency
          usePolling: true,
          interval: 100,
        },
        hmr: {
          port: hmrPort,
        },
      },
      appType: 'custom',
    })
    // use vite's connect instance as middleware
    app.use(vite.middlewares)
  } else {
    app.use(
      (await import('compression')).default({
        brotli: {
          flush: zlib.constants.BROTLI_OPERATION_FLUSH,
        },
        flush: zlib.constants.Z_SYNC_FLUSH,
      }),
    )
  }

  if (isProd) app.use(express.static('./dist/client'))
    app.use(authMiddleware);

  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl

      if (path.extname(url) !== '') {
        console.warn(`${url} is not valid router path`)
        res.status(404)
        res.end(`${url} is not valid router path`)
        return
      }

      // Best effort extraction of the head from vite's index transformation hook
      let viteHead = !isProd
        ? await vite?.transformIndexHtml(
          url,
          `<html><head></head><body></body></html>`,
        )
        : ''

      viteHead = viteHead?.substring(
        viteHead.indexOf('<head>') + 6,
        viteHead.indexOf('</head>'),
      )

      const entry = await (async () => {
        if (!isProd && vite) {
          return vite.ssrLoadModule('/src/entry-server.tsx')
        } else {
          // @ts-ignore
          return import('./dist/server/entry-server.js') as Promise<{ render: Function }>;
        }
      })()

      console.info('Rendering: ', url, '...')
      await entry.render({ req, res, head: viteHead })
    } catch (e) {
      if (!isProd && vite) {
        vite.ssrFixStacktrace(e as Error);
      }
      console.info((e as Error).stack);
      res.status(500).end((e as Error).stack);
    }
  })

  return { app, vite }
}

const PORT = process.env.PORT
  ? Number(process.env.PORT)
  : 3000;

if (!isTest) {
  createServer().then(async ({ app }) =>
    app.listen(PORT, () => {
      console.info(`Server running on port ${PORT}`);
    })
  )
}
