import { createRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  })

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        throwOnError: (error) => {
          if (error.message.includes('401')) {
            router.navigate({ to: '/' })

            return true
          }

        return false
      }
      }
    }
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  return router
}
