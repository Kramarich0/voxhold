import { createFileRoute } from "@tanstack/react-router";
import * as v from "valibot";
import { useChannelsQuery } from "@/entities/channel/api/channel.queries";
import type { SearchResult } from "@/entities/message/model/message.types";
import { useMyServersQuery } from "@/entities/server/api/server.queries";
import { useServerSubscriptions } from "@/entities/server/api/server.subscriptions";
import { EmptyState } from "@/shared/ui/kit/empty-state";
import { ChannelsSidebar } from "@/widgets/channels-sidebar/ui/channels-sidebar";
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
  validateSearch: (search: Record<string, unknown>): ChannelSearch =>
    v.parse(channelSearchSchema, search),
  component: ChannelViewPage,
});

function ChannelViewPage() {
  const { serverId: rawServerId, channelId: rawChannelId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const serverId = Number(rawServerId);
  const channelId = Number(rawChannelId);
  useServerSubscriptions(serverId);

  const activePanel: SecondarySidebarMode | null =
    search.panel === "none" ? null : (search.panel ?? "members");
  const targetMessageId = search.targetMessageId;

  const { data: servers = [], isLoading: isServersLoading } = useMyServersQuery();
  const currentServer = servers.find((s) => s.id === serverId) ?? servers[0];

  const { data: channels = [], isLoading: isChannelsLoading } = useChannelsQuery(serverId);
  const currentChannel = channels.find((c) => c.id === channelId);

  const handleSelectChannel = (selectedChannelId: number) => {
    navigate({
      to: "/channels/$serverId/$channelId",
      params: {
        serverId: String(serverId),
        channelId: String(selectedChannelId),
      },
      search: (prev) => ({ ...prev, targetMessageId: undefined }),
    });
  };

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
    if (result.channel_id === channelId) {
      navigate({
        search: (prev) => ({ ...prev, targetMessageId: result.id }),
      });
    } else {
      navigate({
        to: "/channels/$serverId/$channelId",
        params: {
          serverId: String(serverId),
          channelId: String(result.channel_id),
        },
        search: (prev) => ({ ...prev, targetMessageId: result.id }),
      });
    }
  };

  if (isServersLoading || (isChannelsLoading && channels.length === 0)) {
    return (
      <p className="flex h-full w-full items-center justify-center p-6 text-xs text-muted-foreground animate-pulse">
        Connecting to channel...
      </p>
    );
  }

  if (currentServer == null) {
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
        activeChannelId={channelId}
        onSelectChannel={(channel) => handleSelectChannel(channel.id)}
      />

      {currentChannel ? (
        <ChatPanel
          key={channelId}
          serverId={serverId}
          channel={currentChannel}
          activePanel={activePanel}
          targetMessageId={targetMessageId}
          onTogglePanel={handleTogglePanel}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            title="Channel not found"
            description="Select another channel from the sidebar."
          />
        </div>
      )}

      {currentChannel != null && (
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
    </div>
  );
}
