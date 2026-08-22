import { HashIcon, PlusIcon } from "@phosphor-icons/react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { channelsQueryOptions, useChannelsQuery } from "@/entities/channel/api/channel.queries";
import { useMyServersQuery } from "@/entities/server/api/server.queries";
import { CreateChannelDialog } from "@/features/channel/ui/create-channel-dialog";
import { Button } from "@/shared/ui/core/button";
import { EmptyState } from "@/shared/ui/kit/empty-state";

export const Route = createFileRoute("/_app/channels/$serverId/")({
  loader: async ({ params, context }) => {
    const serverId = Number(params.serverId);
    const channels = await context.queryClient.ensureQueryData(channelsQueryOptions(serverId));

    if (channels.length > 0) {
      const defaultChannel = channels.find((c) => c.kind === "text") ?? channels[0];
      if (defaultChannel) {
        throw redirect({
          to: "/channels/$serverId/$channelId",
          params: {
            serverId: String(serverId),
            channelId: String(defaultChannel.id),
          },
          replace: true,
        });
      }
    }
  },
  component: ServerIndexPage,
});

function ServerIndexPage() {
  const { serverId: rawServerId } = Route.useParams();
  const serverId = Number(rawServerId);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: servers = [] } = useMyServersQuery();
  const currentServer = servers.find((s) => s.id === serverId);

  return (
    <div className="flex flex-1 items-center justify-center p-6 bg-background">
      <EmptyState
        icon={<HashIcon className="size-6 text-primary" />}
        title={`Welcome to ${currentServer?.name ?? "the server"}!`}
        description="There are no channels in this server yet. Create your first channel to get started."
        action={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <PlusIcon /> Create Channel
          </Button>
        }
      />

      <CreateChannelDialog
        serverId={serverId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
