import { PaperPlaneRightIcon, PlusIcon } from "@phosphor-icons/react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { useClickOutside } from "@/shared/hooks/use-click-outside";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/core/button";
import { Card } from "@/shared/ui/core/card";
import { Textarea } from "@/shared/ui/core/textarea";
import { AppTooltip } from "@/shared/ui/kit/app-tooltip";
import { EmojiPicker } from "@/shared/ui/kit/emoji-picker";
import { useSendMessageMutation } from "../api/message.mutations";
import { type AutocompleteEmoji, useEmojiAutocomplete } from "../model/use-emoji-autocomplete";

type Props = {
  serverId: number;
  channelId: number;
  channelName: string;
  serverEmojis?: AutocompleteEmoji[];
};

export function MessageInput({ serverId, channelId, channelName, serverEmojis }: Props) {
  const [content, setContent] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendMessage = useSendMessageMutation(serverId, channelId);

  const {
    isOpen,
    suggestions,
    selectedIndex,
    setSelectedIndex,
    matchIndex,
    checkAutocomplete,
    closeAutocomplete,
  } = useEmojiAutocomplete(serverEmojis);

  useClickOutside(containerRef, () => closeAutocomplete(), isOpen);

  const hasContent = content.trim().length > 0;

  const handleSend = () => {
    const trimmed = content.trim();
    if (trimmed == null || trimmed === "" || sendMessage.isPending) return;

    sendMessage.mutate(
      { content: trimmed },
      {
        onSuccess: () => {
          setContent("");
          textareaRef.current?.focus();
        },
      },
    );
  };

  const handleApplyEmoji = (emoji: AutocompleteEmoji) => {
    const textarea = textareaRef.current;
    if (textarea == null || matchIndex === -1) return;

    const insertText = emoji.isCustom ? `<:${emoji.name}:${emoji.id}> ` : `${emoji.native} `;

    const currentCursor = textarea.selectionStart ?? content.length;
    const nextContent = content.slice(0, matchIndex) + insertText + content.slice(currentCursor);

    setContent(nextContent);
    closeAutocomplete();

    requestAnimationFrame(() => {
      textarea.focus();
      const newCursor = matchIndex + insertText.length;
      textarea.setSelectionRange(newCursor, newCursor);
    });
  };

  const handlePickerSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea == null) {
      setContent((prev) => prev + emoji);
      return;
    }

    const start = textarea.selectionStart ?? content.length;
    const end = textarea.selectionEnd ?? content.length;
    const nextContent = content.slice(0, start) + emoji + content.slice(end);

    setContent(nextContent);

    requestAnimationFrame(() => {
      textarea.focus();
      const newCursor = start + emoji.length;
      textarea.setSelectionRange(newCursor, newCursor);
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (isOpen) {
      const actions: Record<string, () => void> = {
        ArrowDown: () => setSelectedIndex((prev) => (prev + 1) % suggestions.length),
        ArrowUp: () =>
          setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length),
        Enter: () => suggestions[selectedIndex] && handleApplyEmoji(suggestions[selectedIndex]),
        Tab: () => suggestions[selectedIndex] && handleApplyEmoji(suggestions[selectedIndex]),
        Escape: closeAutocomplete,
      };

      const executeAction = actions[event.key];

      if (executeAction) {
        event.preventDefault();
        executeAction();
        return;
      }
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const updateCursorAutocomplete = () => {
    const textarea = textareaRef.current;
    if (textarea == null) return;
    checkAutocomplete(textarea.value, textarea.selectionStart ?? textarea.value.length);
  };

  return (
    <div ref={containerRef} className="shrink-0 p-4 pt-0 bg-background relative">
      {isOpen && (
        <Card className="absolute bottom-full left-4 mb-2 w-72 max-h-60 overflow-y-auto bg-popover text-popover-foreground p-1 z-50 shadow-2xl border border-border/60 flex flex-col gap-0.5 animate-in fade-in-0 zoom-in-95">
          <div className="px-2 py-1 text-2xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 select-none">
            Emoji matching
          </div>
          {suggestions.map((emoji, index) => (
            <EmojiSuggestionItem
              key={emoji.id}
              emoji={emoji}
              isSelected={index === selectedIndex}
              onSelect={handleApplyEmoji}
            />
          ))}
        </Card>
      )}

      <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-1.5 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
        <AppTooltip content="Upload File" side="top">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <PlusIcon />
          </Button>
        </AppTooltip>

        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            checkAutocomplete(e.target.value, e.target.selectionStart ?? e.target.value.length);
          }}
          onFocus={updateCursorAutocomplete}
          onClick={updateCursorAutocomplete}
          onKeyUp={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              updateCursorAutocomplete();
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${channelName}`}
          className="min-h-8 max-h-32 border-none bg-transparent px-3 py-1.5 text-xs focus-visible:ring-0 resize-none leading-relaxed"
          rows={1}
        />

        <div className="flex items-center gap-1 shrink-0">
          <EmojiPicker
            side="top"
            align="end"
            sideOffset={8}
            onSelect={handlePickerSelect}
            disabled={sendMessage.isPending}
          />

          <AppTooltip content="Send Message" side="top">
            <Button
              type="button"
              variant={hasContent ? "default" : "ghost"}
              size="icon-sm"
              onClick={handleSend}
              disabled={!hasContent || sendMessage.isPending}
            >
              <PaperPlaneRightIcon />
            </Button>
          </AppTooltip>
        </div>
      </div>
    </div>
  );
}

type EmojiSuggestionItemProps = {
  emoji: AutocompleteEmoji;
  isSelected: boolean;
  onSelect: (emoji: AutocompleteEmoji) => void;
};

function EmojiSuggestionItem({ emoji, isSelected, onSelect }: EmojiSuggestionItemProps) {
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
