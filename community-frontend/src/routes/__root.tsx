import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanstackDevtools } from '@tanstack/react-devtools'
import QueryProvider from '@/providers/query-provider'
import { ToastContainer } from 'react-toastify'
import { OfflineProvider } from '@/contexts/OfflineContext';
import { NetworkStatusIndicator } from '@/components/NetworkStatusIndicator';
// import { OfflineStatusBar } from '@/components/OfflineStatusBar';

export const Route = createRootRoute({
  component: () => (
    <>
      <OfflineProvider>
        <QueryProvider>
          <NetworkStatusIndicator />
          {/* <OfflineStatusBar /> */}
          <ToastContainer
            position="bottom-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
          <Outlet />

          {/* Show Devtools only in dev */}
          {import.meta.env.DEV && (
            <TanstackDevtools
              config={{
                position: 'bottom-left',
              }}
              plugins={[
                {
                  name: 'Tanstack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                },
              ]}
            />
          )}
        </QueryProvider>
      </OfflineProvider>
    </>
  ),
})
