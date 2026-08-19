import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useTheme } from "next-themes";
import type { EmojiData } from "./emoji-picker";

type Props = {
  onSelect: (emoji: EmojiData) => void;
  serverEmojis?: Array<{ id: string; name: string; url: string }>;
  serverName?: string;
};

export default function EmojiMartContent({
  onSelect,
  serverEmojis = [],
  serverName = "Server Emojis",
}: Props) {
  const { resolvedTheme } = useTheme();

  const customCategories =
    serverEmojis.length > 0
      ? [
          {
            id: "server-custom",
            name: serverName,
            emojis: serverEmojis.map((e) => ({
              id: e.id,
              name: e.name,
              keywords: [e.name],
              skins: [{ src: e.url }],
            })),
          },
        ]
      : undefined;

  return (
    <div className="w-88 h-108.75 overflow-hidden bg-card">
      <Picker
        data={data}
        custom={customCategories}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        previewPosition="none"
        skinTonePosition="search"
        navPosition="top"
        onEmojiSelect={onSelect}
        autoFocus={true}
        dynamicWidth={false}
      />
    </div>
  );
}
