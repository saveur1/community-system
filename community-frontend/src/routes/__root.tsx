import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanstackDevtools } from '@tanstack/react-devtools'
import QueryProvider from '@/providers/query-provider'
import { ToastContainer } from 'react-toastify'
import { OfflineProvider } from '@/providers/OfflineContext';
import { NetworkStatusIndicator } from '@/components/NetworkStatusIndicator';
import { QueryClient } from '@tanstack/react-query';
import type { AuthContext } from '@/lib/auth';
// import { OfflineStatusBar } from '@/components/OfflineStatusBar';

// Define the router context interface
interface RouterContext {
  queryClient: QueryClient;
  auth: AuthContext;
}

export const Route = createRootRoute({
  // Define the context type for type safety
  context: (): RouterContext => ({
    queryClient: new QueryClient(),
    auth: {
      isAuthenticated: false,
      user: null,
      isLoading: true
    }
  }),
  component: () => (
    <div className="dark:bg-white">
      <OfflineProvider>
        <QueryProvider>
          <NetworkStatusIndicator />
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
    </div>
  ),
})
