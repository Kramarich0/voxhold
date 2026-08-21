import { PushPinIcon, XIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import { useChannelPinsQuery } from "@/entities/message/api/message.queries";
import type { PinnedMessage } from "@/entities/message/model/message.types";
import {
  PinnedMessageCard,
  PinnedMessageCardSkeleton,
} from "@/entities/message/ui/pinned-message-card";
import { usePinMessageMutation } from "@/features/message/api/message.mutations";
import { cn } from "@/shared/lib/cn";
import { getInitials } from "@/shared/lib/get-initials";
import { Button } from "@/shared/ui/core/button";
import { Card } from "@/shared/ui/core/card";
import { ScrollArea } from "@/shared/ui/core/scroll-area";
import { Skeleton } from "@/shared/ui/core/skeleton";
import { AppAvatar } from "@/shared/ui/kit/app-avatar";
import { AppTooltip } from "@/shared/ui/kit/app-tooltip";
import { EmptyState } from "@/shared/ui/kit/empty-state";
import { SkeletonList } from "@/shared/ui/kit/skeleton-list";

type Props = {
  serverId: number;
  channelId: number;
  onSelectMessage: (pinnedMessage: PinnedMessage) => void;
};

export function PinsPanelContent({ serverId, channelId, onSelectMessage }: Props) {
  const { data: pins = [], isLoading } = useChannelPinsQuery(serverId, channelId);
  const unpinMessage = usePinMessageMutation(serverId, channelId);

  return (
    <ScrollArea className="flex-1 px-2 py-3">
      {isLoading ? (
        <SkeletonList
          count={4}
          component={PinnedMessageCardSkeleton}
          className="flex flex-col gap-2 p-1"
        />
      ) : pins.length === 0 ? (
        <EmptyState
          icon={<PushPinIcon className="size-5 text-warning" />}
          title="No pinned messages"
          description="Pin important messages using the message actions menu."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {pins.map((pin) => (
            <PinnedMessageCard
              key={pin.message.id}
              pin={pin}
              onClick={() => onSelectMessage(pin)}
              onUnpin={() => unpinMessage.mutate({ messageId: pin.message.id, pin: false })}
            />
          ))}
        </div>
      )}
    </ScrollArea>
  );
}
