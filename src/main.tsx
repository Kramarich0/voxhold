import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { routeTree } from "./routeTree.gen";
import "./global.css";
import { useAuthStore } from "./entities/auth/model/use-auth.store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
});

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPreloadDelay: 50,
  defaultPendingMs: 150,
  defaultPendingMinMs: 400,
  scrollRestoration: true,
  context: {
    queryClient,
    auth: {
      get token() {
        return useAuthStore.getState().token;
      },
      get isAuthenticated() {
        return useAuthStore.getState().token !== null;
      },
    },
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app") || document.getElementById("root");

if (rootElement && rootElement.innerHTML === "") {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  );
}
