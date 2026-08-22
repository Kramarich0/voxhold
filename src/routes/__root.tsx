import { IconContext, SmileySadIcon } from "@phosphor-icons/react";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { type ComponentType, lazy, Suspense } from "react";
import { Button } from "@/shared/ui/core/button";
import { Toaster } from "@/shared/ui/core/sonner";
import { EmptyState } from "@/shared/ui/kit/empty-state";
import { ErrorState } from "@/shared/ui/kit/error-state";

type AppRouterContext = {
  queryClient: QueryClient;
  auth: {
    token: string | null;
    isAuthenticated: boolean;
  };
};

const TanStackRouterDevtools: ComponentType<{
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}> = import.meta.env.PROD
  ? () => null
  : lazy(() =>
      import("@tanstack/react-router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
      })),
    );

export const Route = createRootRouteWithContext<AppRouterContext>()({
  component: RootComponent,
  notFoundComponent: () => (
    <div className="flex h-screen w-screen items-center justify-center p-6 bg-background">
      <EmptyState
        icon={<SmileySadIcon />}
        title="Page not found"
        description="The page you are looking for does not exist or has been moved."
        action={<Button render={<Link to="/" />}>Go back home</Button>}
      />
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="flex h-screen w-screen items-center justify-center p-6 bg-background">
      <ErrorState
        reset={reset}
        extraAction={
          <Button render={<Link to="/" />} variant="outline">
            Go back home
          </Button>
        }
      />
    </div>
  ),
});

function RootComponent() {
  return (
    <ThemeProvider
      storageKey="voxhold-theme"
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <IconContext.Provider
        value={{
          size: 16,
          weight: "regular",
          className: "select-none shrink-0",
        }}
      >
        <div className="h-full bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary-foreground">
          <Outlet />
          <Toaster duration={4000} gap={8} position="top-center" />
          <Suspense>
            <TanStackRouterDevtools position="bottom-right" />
          </Suspense>
        </div>
      </IconContext.Provider>
    </ThemeProvider>
  );
}
