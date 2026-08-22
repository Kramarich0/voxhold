import { ChatsCircleIcon } from "@phosphor-icons/react";
import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuthStore } from "@/entities/auth/model/use-auth.store";
import { useReadStateSubscriptions } from "@/entities/readstate/api/read.subscriptions";
import { myServersQueryOptions } from "@/entities/server/api/server.queries";
import { meQueryOptions } from "@/entities/user/api/user.queries";
import { useInviteSubscriptions } from "@/features/invite/api/invite.mutations";
import { wsClient } from "@/shared/api/ws-client";
import { SidebarProvider } from "@/shared/ui/core/sidebar";
import { TooltipProvider } from "@/shared/ui/core/tooltip";
import { AppTooltip } from "@/shared/ui/kit/app-tooltip";

export const Route = createFileRoute("/_app")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/auth" });
    }
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(meQueryOptions()),
      context.queryClient.ensureQueryData(myServersQueryOptions()),
    ]);
  },
  component: AppLayout,
});

function AppLayout() {
  useEffect(() => {
    void wsClient.connect();

    return () => {
      wsClient.disconnect();
    };
  }, []);

  useReadStateSubscriptions();
  useInviteSubscriptions();

  return (
    <SidebarProvider defaultOpen={true}>
      <TooltipProvider>
        <div className="flex h-svh w-screen overflow-hidden bg-background">
          <div className="flex flex-1 h-full min-w-0 overflow-hidden">
            <Outlet />
          </div>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
