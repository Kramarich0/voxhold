import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import type { AutocompleteEmoji, Message } from "@/entities/message/model/message.types";
import { EmojiSuggestionItem } from "@/entities/message/ui/emoji-suggestion-item";
import { Button } from "@/shared/ui/core/button";
import { Card } from "@/shared/ui/core/card";
import { Textarea } from "@/shared/ui/core/textarea";
import { EmojiPicker } from "@/shared/ui/kit/emoji-picker";
import { useUpdateMessageMutation } from "../api/message.mutations";
import { useEmojiAutocomplete } from "../model/use-emoji-autocomplete";

type Props = {
  serverId: number;
  channelId: number;
  message: Message;
  onCancel: () => void;
};

export function EditMessageForm({ serverId, channelId, message, onCancel }: Props) {
  const [content, setContent] = useState(message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    isOpen,
    suggestions,
    selectedIndex,
    setSelectedIndex,
    matchIndex,
    checkAutocomplete,
    closeAutocomplete,
  } = useEmojiAutocomplete();

  const updateMessage = useUpdateMessageMutation(serverId, channelId);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }
  }, []);

  const handleSave = () => {
    const trimmed = content.trim();
    if (!trimmed || updateMessage.isPending) return;

    if (trimmed === message.content) {
      onCancel();
      return;
    }

    updateMessage.mutate(
      {
        messageId: message.id,
        payload: { content: trimmed },
      },
      {
        onSuccess: () => {
          onCancel();
        },
      },
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (isOpen) {
      const actions: Record<string, () => void> = {
        ArrowDown: () => setSelectedIndex((prev) => (prev + 1) % suggestions.length),
        ArrowUp: () =>
          setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length),
        Enter: () => suggestions[selectedIndex] && handleApplyEmoji(suggestions[selectedIndex]),
        Tab: () => suggestions[selectedIndex] && handleApplyEmoji(suggestions[selectedIndex]),
        Escape: () => onCancel(),
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
      handleSave();
    }
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

  const updateCursorAutocomplete = () => {
    const textarea = textareaRef.current;
    if (textarea == null) return;
    checkAutocomplete(textarea.value, textarea.selectionStart ?? textarea.value.length);
  };

  const handleSelectEmoji = (emoji: string) => {
    setContent((prev) => `${prev}${emoji}`);
  };

  return (
    <div className="flex relative flex-col gap-1.5 mt-1 w-full">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={updateCursorAutocomplete}
        onClick={updateCursorAutocomplete}
        onKeyUp={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            updateCursorAutocomplete();
          }
        }}
        disabled={updateMessage.isPending}
        className="min-h-16 text-xs bg-muted/50 border p-2 leading-relaxed"
        rows={1}
      />
      {isOpen && (
        <Card className="absolute bottom-full left-4 mb-2 w-72 max-h-60 overflow-y-auto bg-popover text-popover-foreground p-1 z-50 border flex flex-col gap-0.5 animate-in fade-in-0 zoom-in-95">
          <div className="px-2 py-1 text-2xs font-bold uppercase tracking-wider text-muted-foreground border-b select-none">
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
      <div className="flex items-center gap-1 text-2xs select-none">
        <span>
          esc to{" "}
          <Button className="pr-0" variant="plain" type="button" onClick={onCancel}>
            cancel
          </Button>
        </span>
        <span>|</span>
        <span>
          enter to{" "}
          <Button
            variant="plain"
            type="button"
            onClick={handleSave}
            disabled={!content.trim() || updateMessage.isPending}
          >
            save
          </Button>
        </span>
        <EmojiPicker
          align="end"
          triggerClassName="absolute bottom-9 right-1"
          sideOffset={8}
          onSelect={handleSelectEmoji}
          disabled={updateMessage.isPending}
        />
      </div>
    </div>
  );
}
