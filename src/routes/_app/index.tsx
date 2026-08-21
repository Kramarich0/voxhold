import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useChannelsQuery } from "@/entities/channel/api/channel.queries";
import { useMyServersQuery } from "@/entities/server/api/server.queries";
import { EmptyState } from "@/shared/ui/kit/empty-state";

export const Route = createFileRoute("/_app/")({
  component: AppIndexRedirectPage,
});

function AppIndexRedirectPage() {
  const navigate = Route.useNavigate();
  const { data: servers = [], isLoading: isServersLoading } = useMyServersQuery();
  const firstServer = servers[0];
  const serverId = firstServer?.id ?? 0;

  const { data: channels = [], isLoading: isChannelsLoading } = useChannelsQuery(serverId);

  useEffect(() => {
    if (firstServer != null && channels.length > 0) {
      const defaultChannel = channels.find((c) => c.kind === "text") ?? channels[0];
      if (defaultChannel) {
        navigate({
          to: "/channels/$serverId/$channelId",
          params: {
            serverId: String(firstServer.id),
            channelId: String(defaultChannel.id),
          },
          replace: true,
        });
      }
    }
  }, [firstServer, channels, navigate]);

  if (isServersLoading || isChannelsLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6 text-xs text-muted-foreground animate-pulse">
        Connecting to Voxhold instance...
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <EmptyState
        title="No active servers found"
        description="Please initialize or create a server to start chatting."
      />
    </div>
  );
}
