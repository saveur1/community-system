import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRef } from 'react'

function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClientRef = useRef<QueryClient>(
    new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    })
  )

  return (
    <QueryClientProvider client={queryClientRef.current}>
      {children}
    </QueryClientProvider>
  )
}

export default QueryProvider;
