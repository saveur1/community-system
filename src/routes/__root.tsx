import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import type { RouterContext } from '../routerContext'
import tailwindcss from "../styles.css?inline";
import { ToastContainer } from 'react-toastify'

import ImigongoStarter from '@/components/layouts/imigongo-starter'
import MainHeader from '@/components/layouts/main-header'
import Footer from '@/components/layouts/main-footer/main-footer'
import TopFooterBg from '@/components/layouts/main-footer/top-footer-bg';

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    links: [
      { rel: 'icon', href: '/images/favicon.ico' }
    ],
    meta: [
      {
        title: 'TanStack Router SSR Basic File Based Streaming',
      },
      {
        charSet: 'UTF-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      },
    ],
    scripts: [
      ...(!import.meta.env.PROD
        ? [
          {
            type: 'module',
            children: `import RefreshRuntime from "/@react-refresh"
  RefreshRuntime.injectIntoGlobalHook(window)
  window.$RefreshReg$ = () => {}
  window.$RefreshSig$ = () => (type) => type
  window.__vite_plugin_react_preamble_installed__ = true`,
          },
          {
            type: 'module',
            src: '/@vite/client',
          },
        ]
        : []),
      {
        type: 'module',
        src: import.meta.env.PROD
          ? '/static/entry-client.js'
          : '/src/entry-client.tsx',
      },
    ],
    styles: [{ children: tailwindcss }],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
          <ToastContainer />
          <Outlet />
          <TanStackRouterDevtools position='bottom-right'/>
      </body>
    </html>
  )
}
