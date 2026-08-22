import { SpeakerHighIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import * as v from "valibot";
import { channelsQueryOptions, useChannelsQuery } from "@/entities/channel/api/channel.queries";
import type { Channel } from "@/entities/channel/model/channel.types";
import {
  channelMessagesQueryOptions,
  channelPinsQueryOptions,
} from "@/entities/message/api/message.queries";
import type { SearchResult } from "@/entities/message/model/message.types";
import { useMyServersQuery } from "@/entities/server/api/server.queries";
import { Button } from "@/shared/ui/core/button";
import { EmptyState } from "@/shared/ui/kit/empty-state";
import { ChatPanel } from "@/widgets/chat-panel/ui/chat-panel";
import {
  SecondarySidebar,
  type SecondarySidebarMode,
} from "@/widgets/secondary-sidebar/ui/secondary-sidebar";

const channelSearchSchema = v.object({
  panel: v.optional(v.picklist(["members", "search", "pins", "none"])),
  targetMessageId: v.optional(v.number()),
});

export type ChannelSearch = v.InferOutput<typeof channelSearchSchema>;

export const Route = createFileRoute("/_app/channels/$serverId/$channelId")({
  validateSearch: channelSearchSchema,
  remountDeps: ({ params }) => [params.channelId],
  loader: ({ params, context }) => {
    const serverId = Number(params.serverId);
    const channelId = Number(params.channelId);

    const channels = context.queryClient.getQueryData<Channel[]>(
      channelsQueryOptions(serverId).queryKey,
    );

    const currentChannel = channels?.find((c) => c.id === channelId);

    if (currentChannel?.kind === "text") {
      void context.queryClient.prefetchInfiniteQuery(
        channelMessagesQueryOptions(serverId, channelId),
      );
      void context.queryClient.prefetchQuery(channelPinsQueryOptions(serverId, channelId));
    }
  },
  component: ChannelViewPage,
});

function ChannelViewPage() {
  const { serverId: rawServerId, channelId: rawChannelId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const serverId = Number(rawServerId);
  const channelId = Number(rawChannelId);

  const activePanel: SecondarySidebarMode | null =
    search.panel === "none" ? null : (search.panel ?? "members");
  const targetMessageId = search.targetMessageId;

  const { data: servers = [] } = useMyServersQuery();
  const currentServer = servers.find((s) => s.id === serverId);

  const { data: channels = [], isLoading: isChannelsLoading } = useChannelsQuery(serverId);
  const currentChannel = channels.find((c) => c.id === channelId);

  const handleTogglePanel = (panel: SecondarySidebarMode) => {
    navigate({
      search: (prev) => {
        const currentEffective = prev.panel === "none" ? null : (prev.panel ?? "members");
        return {
          ...prev,
          panel: currentEffective === panel ? "none" : panel,
        };
      },
    });
  };

  const handleClosePanel = () => {
    navigate({
      search: (prev) => ({ ...prev, panel: "none" }),
    });
  };

  const handleSelectSearchResult = (result: SearchResult) => {
    navigate({
      to: "/channels/$serverId/$channelId",
      params: {
        serverId: String(serverId),
        channelId: String(result.channel_id),
      },
      search: (prev) => ({ ...prev, targetMessageId: result.id }),
    });
  };

  if (isChannelsLoading && !currentChannel) {
    return (
      <p className="flex h-full w-full items-center justify-center p-6 text-xs text-muted-foreground animate-pulse">
        Connecting to channel...
      </p>
    );
  }

  if (!currentChannel) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          title="Channel not found"
          description="Select another channel from the sidebar."
        />
      </div>
    );
  }

  if (currentChannel.kind === "voice") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 bg-background">
        <EmptyState
          icon={<SpeakerHighIcon className="size-8 text-primary" />}
          title={`Voice Channel: #${currentChannel.name}`}
          description="You are viewing a voice channel. Voice chat WebRTC room will connect here."
          action={
            <Button size="lg" className="gap-2">
              <SpeakerHighIcon /> Join Voice
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <>
      <ChatPanel
        key={channelId}
        serverId={serverId}
        channel={currentChannel}
        activePanel={activePanel}
        targetMessageId={targetMessageId}
        onTogglePanel={handleTogglePanel}
      />

      {currentServer != null && (
        <SecondarySidebar
          serverId={serverId}
          serverName={currentServer.name}
          channel={currentChannel}
          mode={activePanel}
          onClose={handleClosePanel}
          onSelectSearchResult={handleSelectSearchResult}
          onSelectPinnedMessage={(pin) => {
            navigate({
              search: (prev) => ({ ...prev, targetMessageId: pin.message.id }),
            });
          }}
        />
      )}
    </>
  );
}
