import { IconContext } from "@phosphor-icons/react";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
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
    <IconContext.Provider
      value={{
        size: 16,
        weight: "regular",
        className: "select-none shrink-0",
      }}
    >
      <div className="dark h-full bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary-foreground">
        <div className="p-2 flex gap-2 text-lg">
          <Link
            to="/"
            activeProps={{
              className: "font-bold",
            }}
            activeOptions={{ exact: true }}
          >
            Home
          </Link>{" "}
          <Link
            to="/auth"
            activeProps={{
              className: "font-bold",
            }}
          >
            Login
          </Link>
        </div>
        <Outlet />
        <Toaster richColors position="top-right" />
        <Suspense>
          <TanStackRouterDevtools position="bottom-right" />
        </Suspense>
      </div>
    </IconContext.Provider>
  );
}
