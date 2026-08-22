import { createFileRoute, redirect } from "@tanstack/react-router";
import { myServersQueryOptions } from "@/entities/server/api/server.queries";
import { EmptyState } from "@/shared/ui/kit/empty-state";

export const Route = createFileRoute("/_app/")({
  loader: async ({ context }) => {
    const servers = await context.queryClient.ensureQueryData(myServersQueryOptions());
    const firstServer = servers[0];

    if (firstServer != null) {
      throw redirect({
        to: "/channels/$serverId",
        params: {
          serverId: String(firstServer.id),
        },
        replace: true,
      });
    }
  },
  component: AppIndexRedirectPage,
});

function AppIndexRedirectPage() {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <EmptyState
        title="No active servers found"
        description="Please initialize or create a server to start chatting."
      />
    </div>
  );
}
