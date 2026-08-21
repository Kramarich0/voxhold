import { useEffect, useRef } from "react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/core/button";
import type { AutocompleteEmoji } from "../model/message.types";

type EmojiSuggestionItemProps = {
  emoji: AutocompleteEmoji;
  isSelected: boolean;
  onSelect: (emoji: AutocompleteEmoji) => void;
};

export function EmojiSuggestionItem({ emoji, isSelected, onSelect }: EmojiSuggestionItemProps) {
  const itemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isSelected) {
      itemRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [isSelected]);

  return (
    <Button
      ref={itemRef}
      type="button"
      variant="ghost"
      size="sm"
      onMouseDown={(e) => {
        e.preventDefault();
        onSelect(emoji);
      }}
      className={cn(
        "flex h-7.5 w-full items-center justify-start gap-2.5 px-2 text-xs font-normal",
        isSelected && "bg-accent text-accent-foreground font-medium",
      )}
    >
      <span className="text-base select-none size-5 flex items-center justify-center shrink-0">
        {emoji.isCustom ? (
          <img src={emoji.url} alt={emoji.name} className="size-4 object-contain" />
        ) : (
          emoji.native
        )}
      </span>
      <span className="truncate font-mono text-xs text-muted-foreground">:{emoji.name}:</span>
    </Button>
  );
}
