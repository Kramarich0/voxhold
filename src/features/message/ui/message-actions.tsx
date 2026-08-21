import { PenIcon, PushPinIcon, PushPinSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/core/button";
import { AppTooltip } from "@/shared/ui/kit/app-tooltip";
import { CopyButton } from "@/shared/ui/kit/copy-button";

type Props = {
  messageId: number;
  isPinned: boolean;
  messageContent: string;
  onStartEdit: () => void;
  onPin: (messageId: number, nextPinned: boolean) => void;
  onDelete: (messageId: number) => void;
  isPinPending?: boolean;
  isDeletePending?: boolean;
};

type ActionsItem = {
  key: string;
  tooltipContent: string;
  onClick: () => void;
  disabled?: boolean;
  icon: ReactNode;
  className?: string;
};

export function MessageActions({
  messageId,
  isPinned,
  messageContent,
  onStartEdit,
  onPin,
  onDelete,
  isPinPending = false,
  isDeletePending = false,
}: Props) {
  const ACTIONS: readonly ActionsItem[] = [
    {
      key: "pin",
      tooltipContent: isPinned ? "Unpin" : "Pin",
      onClick: () => onPin(messageId, !isPinned),
      disabled: isPinPending,
      icon: isPinned ? <PushPinIcon className="text-warning" /> : <PushPinSimpleIcon />,
    },
    {
      key: "edit",
      tooltipContent: "Edit Message",
      onClick: onStartEdit,
      icon: <PenIcon />,
    },
    {
      key: "delete",
      tooltipContent: "Delete Message",
      onClick: () => onDelete(messageId),
      disabled: isDeletePending,
      icon: <TrashIcon />,
      className: "hover:text-destructive hover:bg-destructive/10",
    },
  ] as const;

  return (
    <div className="absolute -top-3.5 right-2 flex items-center p-0.5 rounded-md bg-card opacity-0 group-hover/message:opacity-100 transition-opacity z-10">
      <CopyButton value={messageContent} />
      {ACTIONS.map((action) => (
        <AppTooltip key={action.key} content={action.tooltipContent}>
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn("text-muted-foreground", action.className)}
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.icon}
          </Button>
        </AppTooltip>
      ))}
    </div>
  );
}
