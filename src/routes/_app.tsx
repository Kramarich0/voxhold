import { ChatsCircleIcon, SignOutIcon } from "@phosphor-icons/react";
import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/entities/auth/model/use-auth.store";
import { useLogoutMutation } from "@/features/auth/api/auth.mutations";
import { Button } from "@/shared/ui/core/button";
import { SidebarProvider } from "@/shared/ui/core/sidebar";
import { TooltipProvider } from "@/shared/ui/core/tooltip";
import { AppTooltip } from "@/shared/ui/kit/app-tooltip";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    if (useAuthStore.getState().token == null) {
      throw redirect({ to: "/auth" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const logout = useLogoutMutation();

  return (
    <SidebarProvider defaultOpen={true}>
      <TooltipProvider>
        <div className="flex h-svh w-screen overflow-hidden bg-background">
          <nav className="flex h-full w-16 shrink-0 flex-col items-center gap-2 border-r border-border/50 bg-card py-3 select-none">
            <AppTooltip content="Direct Messages" side="right">
              <Link
                to="/"
                className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-all hover:rounded-xl"
              >
                <ChatsCircleIcon />
              </Link>
            </AppTooltip>

            <div className="h-px w-8 bg-border/60" />

            <div className="flex-1" />

            <AppTooltip content="Log Out" side="right">
              <Button
                variant="ghost"
                size="icon"
                className="size-10 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
              >
                <SignOutIcon />
              </Button>
            </AppTooltip>
          </nav>

          <div className="flex flex-1 h-full min-w-0 overflow-hidden">
            <Outlet />
          </div>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
