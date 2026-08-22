import { PenIcon, TrashIcon } from "@phosphor-icons/react";
import type { MouseEvent, ReactNode } from "react";
import type { Channel } from "@/entities/channel/model/channel.types";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/core/button";
import { AppTooltip } from "@/shared/ui/kit/app-tooltip";

type Props = {
  channel: Channel;
  onEdit: (channel: Channel) => void;
  onDelete: (channel: Channel) => void;
};

type ActionsItem = {
  key: string;
  tooltipContent: string;
  icon: ReactNode;
  className?: string;
  handle: (event: MouseEvent) => void;
};

export function ChannelActions({ channel, onEdit, onDelete }: Props) {
  const handleEditClick = (event: MouseEvent) => {
    event.stopPropagation();
    onEdit(channel);
  };

  const handleDeleteClick = (event: MouseEvent) => {
    event.stopPropagation();
    onDelete(channel);
  };

  const ACTIONS: readonly ActionsItem[] = [
    {
      key: "update",
      tooltipContent: "Update Channel",
      handle: handleEditClick,
      icon: <PenIcon />,
    },
    {
      key: "delete",
      tooltipContent: "Delete Channel",
      handle: handleDeleteClick,
      icon: <TrashIcon />,
      className: "hover:text-destructive",
    },
  ] as const;

  return (
    <div className="flex items-center gap-0.5 opacity-0 group-hover/channel:opacity-100 transition-opacity">
      {ACTIONS.map((action) => (
        <AppTooltip key={action.key} content={action.tooltipContent}>
          <Button
            variant="plain"
            size="icon-sm"
            className={cn("text-muted-foreground", action.className)}
            onClick={action.handle}
            aria-label={`Edit #${channel.name}`}
          >
            {action.icon}
          </Button>
        </AppTooltip>
      ))}
    </div>
  );
}
