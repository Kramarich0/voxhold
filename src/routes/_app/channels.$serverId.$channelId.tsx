import { createFileRoute } from "@tanstack/react-router";
import * as v from "valibot";
import { useChannelsQuery } from "@/entities/channel/api/channel.queries";
import { useMyServersQuery } from "@/entities/server/api/server.queries";
import { ChannelsSidebar } from "@/widgets/channels-sidebar/ui/channels-sidebar";
import { ChatPanel } from "@/widgets/chat-panel/ui/chat-panel";
import { MembersSidebar } from "@/widgets/members-sidebar/ui/members-sidebar";

const channelSearchSchema = v.object({
  members: v.optional(v.boolean()),
  search: v.optional(v.string()),
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

  const isMembersOpen = search.members ?? true;

  const serverId = Number(rawServerId);
  const channelId = Number(rawChannelId);

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
      search: (prev) => prev,
    });
  };

  const handleToggleMembers = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        members: !(prev.members ?? true),
      }),
    });
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
      <p className="flex h-full w-full items-center justify-center p-6 text-center text-xs text-muted-foreground">
        Server not found or you don't have access.
      </p>
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
          serverId={serverId}
          channel={currentChannel}
          isMembersOpen={isMembersOpen}
          onToggleMembers={handleToggleMembers}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
          Channel not found. Select another channel from the sidebar.
        </div>
      )}

      {isMembersOpen && <MembersSidebar serverId={serverId} onClose={handleToggleMembers} />}
    </div>
  );
}
