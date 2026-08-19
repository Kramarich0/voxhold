import { IconContext } from "@phosphor-icons/react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { lazy, Suspense } from "react";
import { Toaster } from "@/shared/ui/core/sonner";

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null
  : lazy(() =>
      import("@tanstack/router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
      })),
    );

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
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
