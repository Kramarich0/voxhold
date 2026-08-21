import {
  CaretRightIcon,
  GearIcon,
  PlusIcon,
  SignOutIcon,
  UserPlusIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { useChannelsQuery } from "@/entities/channel/api/channel.queries";
import { useChannelListSubscriptions } from "@/entities/channel/api/channel.subscriptions";
import type { Channel, ChannelKind } from "@/entities/channel/model/channel.types";
import { ChannelItem, ChannelItemSkeleton } from "@/entities/channel/ui/channel-item";
import { useMeQuery } from "@/entities/user/api/user.queries";
import { useLogoutMutation } from "@/features/auth/api/auth.mutations";
import { ChannelActions } from "@/features/channel/ui/channel-actions";
import { CreateChannelDialog } from "@/features/channel/ui/create-channel-dialog";
import { DeleteChannelDialog } from "@/features/channel/ui/delete-channel-dialog";
import { UpdateChannelDialog } from "@/features/channel/ui/update-channel-dialog";
import { UpdateServerDialog } from "@/features/server/ui/update-server-dialog";
import { UpdateUserDialog } from "@/features/user/ui/update-user-dialog";
import { Button, buttonVariants } from "@/shared/ui/core/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/ui/core/collapsible";
import { ScrollArea } from "@/shared/ui/core/scroll-area";
import { AppAvatar } from "@/shared/ui/kit/app-avatar";
import { AppTooltip } from "@/shared/ui/kit/app-tooltip";
import { SkeletonList } from "@/shared/ui/kit/skeleton-list";

type Props = {
  serverId: number;
  serverName?: string;
  activeChannelId?: number;
  onSelectChannel?: (channel: Channel) => void;
};

export function ChannelsSidebar({
  serverId,
  serverName = "Voxhold",
  activeChannelId,
  onSelectChannel,
}: Props) {
  useChannelListSubscriptions(serverId);

  const { data: channels = [], isLoading: isChannelsLoading } = useChannelsQuery(serverId);
  const { data: user } = useMeQuery();
  const logout = useLogoutMutation();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDialogKind, setCreateDialogKind] = useState<ChannelKind>("text");
  const [updateServerOpen, setUpdateServerOpen] = useState(false);
  const [updateUserOpen, setUpdateUserOpen] = useState(false);

  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [deletingChannel, setDeletingChannel] = useState<Channel | null>(null);

  const textChannels = channels.filter((c) => c.kind === "text");
  const voiceChannels = channels.filter((c) => c.kind === "voice");

  const handleOpenCreate = (kind: ChannelKind) => {
    setCreateDialogKind(kind);
    setCreateDialogOpen(true);
  };

  return (
    <>
      <aside className="flex h-full w-60 shrink-0 flex-col border-r bg-sidebar select-none">
        <header className="flex h-12 items-center justify-between border-b px-3 shrink-0">
          <div className="flex flex-col min-w-0">
            <span className="text-2xs font-semibold text-muted-foreground">Workspace</span>
            <span className="truncate text-sm font-bold text-foreground">{serverName}</span>
          </div>
          <AppTooltip content="Server Settings" side="bottom">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
              onClick={() => setUpdateServerOpen(true)}
              aria-label={`Update ${serverName}`}
            >
              <GearIcon />
            </Button>
          </AppTooltip>
        </header>

        <ScrollArea className="flex-1 px-2 py-2">
          <div className="flex flex-col gap-4">
            <ChannelSection
              title="Text Channels"
              kind="text"
              channels={textChannels}
              isLoading={isChannelsLoading}
              activeChannelId={activeChannelId}
              onSelectChannel={onSelectChannel}
              onCreateChannel={handleOpenCreate}
              onEditChannel={setEditingChannel}
              onDeleteChannel={setDeletingChannel}
            />

            <ChannelSection
              title="Voice Channels"
              kind="voice"
              channels={voiceChannels}
              isLoading={isChannelsLoading}
              activeChannelId={activeChannelId}
              onSelectChannel={onSelectChannel}
              onCreateChannel={handleOpenCreate}
              onEditChannel={setEditingChannel}
              onDeleteChannel={setDeletingChannel}
            />
          </div>
        </ScrollArea>

        <footer className="flex h-13 items-center justify-between border-t px-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative shrink-0">
              <AppAvatar name={user?.username} size="sm" />
              <span className="absolute bottom-0 right-0 size-2 rounded-full bg-success ring-2 ring-background" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-xs font-medium">{user?.username ?? "Loading..."}</span>
              <span className="text-2xs text-muted-foreground">Online</span>
            </div>
          </div>

          <div className="flex items-center shrink-0">
            <AppTooltip content="Invite">
              <Button variant="ghost" size="icon-sm">
                <UserPlusIcon />
              </Button>
            </AppTooltip>

            <AppTooltip content="Settings">
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground"
                onClick={() => setUpdateUserOpen(true)}
                aria-label={`Update ${user?.username}`}
              >
                <GearIcon />
              </Button>
            </AppTooltip>

            <AppTooltip content="Log Out">
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
              >
                <SignOutIcon />
              </Button>
            </AppTooltip>
          </div>
        </footer>
      </aside>

      <CreateChannelDialog
        serverId={serverId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        defaultKind={createDialogKind}
      />

      <UpdateChannelDialog
        channel={editingChannel}
        open={editingChannel != null}
        onOpenChange={(open) => {
          if (!open) setEditingChannel(null);
        }}
      />

      <DeleteChannelDialog
        channel={deletingChannel}
        open={deletingChannel != null}
        onOpenChange={(open) => {
          if (!open) setDeletingChannel(null);
        }}
      />

      <UpdateServerDialog
        serverId={serverId}
        serverName={serverName}
        open={updateServerOpen}
        onOpenChange={setUpdateServerOpen}
      />

      <UpdateUserDialog
        open={updateUserOpen}
        userAbout={user?.about ?? ""}
        userCountryCode={user?.country_code ?? ""}
        onOpenChange={setUpdateUserOpen}
      />
    </>
  );
}

type ChannelSectionProps = {
  title: string;
  kind: ChannelKind;
  channels: Channel[];
  isLoading?: boolean;
  activeChannelId?: number;
  onSelectChannel?: (channel: Channel) => void;
  onCreateChannel: (kind: ChannelKind) => void;
  onEditChannel: (channel: Channel) => void;
  onDeleteChannel: (channel: Channel) => void;
};

function ChannelSection({
  title,
  kind,
  channels,
  isLoading = false,
  activeChannelId,
  onSelectChannel,
  onCreateChannel,
  onEditChannel,
  onDeleteChannel,
}: ChannelSectionProps) {
  return (
    <Collapsible defaultOpen className="flex flex-col">
      <div className="flex items-center justify-between">
        <CollapsibleTrigger
          className={buttonVariants({
            variant: "plain",
            size: "xs",
            className: "group flex flex-1 min-w-0 items-center justify-start",
          })}
        >
          <span className="text-2xs font-bold uppercase tracking-wider">{title}</span>
          <CaretRightIcon className="size-3 transition-transform group-aria-expanded:rotate-90" />
        </CollapsibleTrigger>

        <AppTooltip content={`Create ${kind === "text" ? "Text" : "Voice"} Channel`}>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground"
            onClick={() => onCreateChannel(kind)}
            aria-label={`Create ${title}`}
          >
            <PlusIcon />
          </Button>
        </AppTooltip>
      </div>

      <CollapsibleContent>
        <div className="flex flex-col gap-px mt-0.5">
          {isLoading && channels.length === 0 ? (
            <SkeletonList count={3} component={ChannelItemSkeleton} />
          ) : (
            channels.map((channel) => (
              <ChannelItem
                key={channel.id}
                channel={channel}
                isActive={channel.id === activeChannelId}
                onClick={() => onSelectChannel?.(channel)}
                actions={
                  <ChannelActions
                    channel={channel}
                    onEdit={onEditChannel}
                    onDelete={onDeleteChannel}
                  />
                }
              />
            ))
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
