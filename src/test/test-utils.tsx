import type { ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/store/AuthContext';

/**
 * Custom render that wraps the component in all required providers.
 * Pass `routerProps` to use MemoryRouter with specific initial entries.
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  routerProps?: MemoryRouterProps;
  /** Set false to skip AuthProvider (e.g. for components that supply their own). */
  withAuth?: boolean;
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function customRender(ui: ReactElement, options?: CustomRenderOptions) {
  const { routerProps, withAuth = true, ...renderOptions } = options ?? {};
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: React.ReactNode }) {
    const router = routerProps ? (
      <MemoryRouter {...routerProps}>{children}</MemoryRouter>
    ) : (
      <BrowserRouter>{children}</BrowserRouter>
    );

    return (
      <QueryClientProvider client={queryClient}>
        {withAuth ? <AuthProvider>{router}</AuthProvider> : router}
      </QueryClientProvider>
    );
  }

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Re-export everything from RTL so tests import from one place
export * from '@testing-library/react';
export { customRender as render };
