import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import { channelsQueryOptions } from "@/entities/channel/api/channel.queries";
import {
  myServersQueryOptions,
  serverMembersQueryOptions,
  useMyServersQuery,
} from "@/entities/server/api/server.queries";
import { useServerSubscriptions } from "@/entities/server/api/server.subscriptions";
import { EmptyState } from "@/shared/ui/kit/empty-state";
import { ErrorState } from "@/shared/ui/kit/error-state";
import { ChannelsSidebar } from "@/widgets/channels-sidebar/ui/channels-sidebar";

export const Route = createFileRoute("/_app/channels/$serverId")({
  component: ServerLayout,
  loader: async ({ params, context }) => {
    const serverId = Number(params.serverId);

    await Promise.all([
      context.queryClient.ensureQueryData(channelsQueryOptions(serverId)),
      context.queryClient.ensureQueryData(serverMembersQueryOptions(serverId)),
    ]);
  },
  errorComponent: ({ reset }) => (
    <div className="flex h-full w-full items-center justify-center p-6">
      <ErrorState
        title="Failed to load server"
        description="This server might be temporarily unavailable or you don't have access."
        reset={reset}
      />
    </div>
  ),
});

function ServerLayout() {
  const { serverId: rawServerId, channelId: rawChannelId } = useParams({ strict: false });
  const serverId = Number(rawServerId);
  const activeChannelId = rawChannelId ? Number(rawChannelId) : undefined;
  const navigate = Route.useNavigate();

  useServerSubscriptions(serverId);

  const { data: servers = [], isLoading: isServersLoading } = useMyServersQuery();
  const currentServer = servers.find((s) => s.id === serverId);

  if (isServersLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6 text-xs text-muted-foreground animate-pulse">
        Connecting to server...
      </div>
    );
  }

  if (!currentServer) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <EmptyState
          title="Server not found"
          description="Server not found or you don't have access."
        />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full min-w-0 min-h-0 overflow-hidden">
      <ChannelsSidebar
        serverId={serverId}
        serverName={currentServer.name}
        activeChannelId={activeChannelId}
        onSelectChannel={(channel) => {
          navigate({
            to: "/channels/$serverId/$channelId",
            params: {
              serverId: String(serverId),
              channelId: String(channel.id),
            },
          });
        }}
      />

      <div className="flex flex-1 min-w-0 min-h-0 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
