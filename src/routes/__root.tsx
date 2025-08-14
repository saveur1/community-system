import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import type { RouterContext } from '../routerContext'
import tailwindcss from "../styles.css?url";
import { ToastContainer } from 'react-toastify';
import toastCss from 'react-toastify/dist/ReactToastify.css?url';


export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    links: [
      { rel: 'icon', href: '/images/favicon.ico' },
      { rel: 'stylesheet', href: toastCss },
      { rel: 'stylesheet', href: tailwindcss },
    ],
    meta: [
      {
        title: 'RICH CLS',
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
    // styles: [{ children: tailwindcss }],
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
