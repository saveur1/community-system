import { pipeline } from 'node:stream/promises'
import {
  RouterServer,
  createRequestHandler,
  renderRouterToStream,
} from '@tanstack/react-router/ssr/server'
import { createRouter } from './router'
import type express from 'express'
import './fetch-polyfill';
import i18n from './i18n';

interface RenderProps {
  head: string
  req: express.Request
  res: express.Response
}

export async function render({ req, res, head }: RenderProps) {
  // Convert the express request to a fetch request
  const url = new URL(req.originalUrl || req.url, 'https://localhost:3000').href
  const lang = i18n.language || "rw";

  const request = new Request(url, {
    method: req.method,
    headers: (() => {
      const headers = new Headers()
      for (const [key, value] of Object.entries(req.headers)) {
        headers.set(key, value as any)
      }
      return headers
    })(),
  })

  // Create a request handler
  const handler = createRequestHandler({
    request,
    createRouter: () => {
      const router = createRouter()

      // Update each router instance with the head info and lang from vite
      router.update({
        context: {
          ...router.options.context,
          head: head,
          lang: lang,
        },
      })
      return router
    },
  })

  let response: Response;

  // Let's use the default stream handler to create the response
  try {
    response = await handler(({ request, responseHeaders, router }) =>
      renderRouterToStream({
        request,
        responseHeaders,
        router,
        children: <RouterServer router={router} />,
      })
    );
  } catch (err) {
    console.error("Error rendering stream:", err);
    res.status(500).end("Internal Server Error while rendering")
    return;
  }

  // Convert the fetch response back to an express response
  res.statusMessage = response.statusText
  res.status(response.status)

  response.headers.forEach((value, name) => {
    res.setHeader(name, value)
  })

  if (!response.body) {
    res.status(500).end("Internal Server Error: No response body")
    return
  }

  // Stream the response body
  return pipeline(response.body as any, res)
}
