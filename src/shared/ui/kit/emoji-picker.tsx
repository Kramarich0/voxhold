import { SmileyIcon } from "@phosphor-icons/react";
import { isValidElement, lazy, type ReactNode, Suspense, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { Button } from "../core/button";
import { Popover, PopoverContent, PopoverTrigger } from "../core/popover";
import { Skeleton } from "../core/skeleton";

const LazyEmojiMart = lazy(() => import("./emoji-mart-content"));

export type EmojiData = {
  id: string;
  name: string;
  native?: string;
  shortcodes?: string;
  src?: string;
};

type Props = {
  onSelect: (emoji: string, raw?: EmojiData) => void;
  disabled?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  alignOffset?: number;
  trigger?: ReactNode;
  triggerClassName?: string;
  tooltipText?: string;
  serverEmojis?: Array<{ id: string; name: string; url: string }>;
  serverName?: string;
};

function EmojiPickerSkeleton() {
  return (
    <div className="flex h-108.75 w-88 flex-col rounded-2xl border border-border/50 bg-card p-3">
      <div className="flex items-center gap-2 border-b border-border/40 pb-2">
        <Skeleton className="h-7 w-full rounded-lg" />
      </div>
      <div className="grid flex-1 grid-cols-8 gap-2 pt-3">
        {Array.from({ length: 40 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
          <Skeleton key={i} className="size-7 rounded-md" />
        ))}
      </div>
    </div>
  );
}

export function EmojiPicker({
  onSelect,
  disabled = false,
  side = "top",
  align = "end",
  sideOffset = 8,
  alignOffset = 0,
  trigger,
  triggerClassName,
  tooltipText = "Add Emoji",
  serverEmojis,
  serverName,
}: Props) {
  const [open, setOpen] = useState(false);

  const handleSelect = (emojiItem: EmojiData) => {
    const value = emojiItem.native || emojiItem.shortcodes || emojiItem.id;
    onSelect(value, emojiItem);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          isValidElement(trigger) ? (
            trigger
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={tooltipText}
              disabled={disabled}
              className={cn(
                "text-muted-foreground hover:text-foreground shrink-0",
                triggerClassName,
              )}
            >
              <SmileyIcon />
            </Button>
          )
        }
      />

      <PopoverContent
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="w-88 h-108.75 p-0 border-none bg-transparent z-50 overflow-hidden"
      >
        <Suspense fallback={<EmojiPickerSkeleton />}>
          <LazyEmojiMart
            onSelect={handleSelect}
            serverEmojis={serverEmojis}
            serverName={serverName}
          />
        </Suspense>
      </PopoverContent>
    </Popover>
  );
}
