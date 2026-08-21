import { MagnifyingGlassIcon, PushPinIcon, UsersIcon, XIcon } from "@phosphor-icons/react";
import type { Channel } from "@/entities/channel/model/channel.types";
import type { PinnedMessage, SearchResult } from "@/entities/message/model/message.types";
import { useIsMobile } from "@/shared/lib/use-mobile";
import { Button } from "@/shared/ui/core/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/core/sheet";
import { MembersPanelContent } from "./members-panel-content";
import { PinsPanelContent } from "./pins-panel-content";
import { SearchPanelContent } from "./search-panel-content";

export type SecondarySidebarMode = "members" | "search" | "pins";

type Props = {
  serverId: number;
  serverName?: string;
  channel: Channel;
  mode: SecondarySidebarMode | null;
  onClose: () => void;
  onSelectSearchResult: (result: SearchResult) => void;
  onSelectPinnedMessage: (pin: PinnedMessage) => void;
};

export function SecondarySidebar({
  serverId,
  serverName = "Server",
  channel,
  mode,
  onClose,
  onSelectSearchResult,
  onSelectPinnedMessage,
}: Props) {
  const isMobile = useIsMobile();

  if (mode == null) return null;

  const headerConfig = {
    members: {
      title: "Members",
      icon: <UsersIcon className="text-muted-foreground" />,
      description: "List of server members and presence",
    },
    search: {
      title: `Search in ${serverName}`,
      icon: <MagnifyingGlassIcon className="text-muted-foreground" />,
      description: "Search message history across all server channels",
    },
    pins: {
      title: `Pinned in #${channel.name}`,
      icon: <PushPinIcon className="text-warning" />,
      description: "Pinned messages in this channel",
    },
  }[mode];

  const sidebarContent = (
    <div className="flex h-full w-full flex-col bg-sidebar select-none">
      <header className="flex h-12 items-center justify-between border-b px-3 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          {headerConfig.icon}
          <span className="text-xs font-semibold text-foreground truncate">
            {headerConfig.title}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground shrink-0"
          aria-label="Close secondary sidebar"
        >
          <XIcon />
        </Button>
      </header>

      <div className="flex flex-1 min-h-0 flex-col">
        {mode === "members" && <MembersPanelContent serverId={serverId} />}

        {mode === "search" && (
          <SearchPanelContent serverId={serverId} onSelectResult={onSelectSearchResult} />
        )}

        {mode === "pins" && (
          <PinsPanelContent
            serverId={serverId}
            channelId={channel.id}
            onSelectMessage={onSelectPinnedMessage}
          />
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="w-80 p-0 bg-sidebar [&>button]:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>{headerConfig.title}</SheetTitle>
            <SheetDescription>{headerConfig.description}</SheetDescription>
          </SheetHeader>
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  return <aside className="flex h-full w-80 shrink-0 flex-col border-l">{sidebarContent}</aside>;
}
