import { useEffect, useState } from "react";

export type AutocompleteEmoji = {
  id: string;
  name: string;
  native?: string;
  url?: string;
  keywords?: string[];
  isCustom?: boolean;
};

type EmojiMartSkin = {
  unified?: string;
  native?: string;
  src?: string;
  x?: number;
  y?: number;
};

type EmojiMartItem = {
  id: string;
  name: string;
  keywords?: string[];
  skins?: EmojiMartSkin[];
  emoticons?: string[];
  version?: number;
};

type EmojiMartData = {
  categories?: Array<{ id: string; emojis: string[] }>;
  emojis: Record<string, EmojiMartItem>;
  aliases?: Record<string, string>;
};

let emojiCache: AutocompleteEmoji[] | null = null;

async function loadAllUnicodeEmojis(): Promise<AutocompleteEmoji[]> {
  if (emojiCache != null) return emojiCache;

  const dataModule = await import("@emoji-mart/data");
  const data = (dataModule.default ?? dataModule) as unknown as EmojiMartData;

  emojiCache = Object.values(data.emojis).map((emoji) => ({
    id: emoji.id,
    name: emoji.id,
    native: emoji.skins?.[0]?.native ?? "",
    keywords: emoji.keywords ?? [],
    isCustom: false,
  }));

  return emojiCache;
}

export function useEmojiAutocomplete(serverEmojis: AutocompleteEmoji[] = []) {
  const [allEmojis, setAllEmojis] = useState<AutocompleteEmoji[]>([]);
  const [query, setQuery] = useState<string | null>(null);
  const [matchIndex, setMatchIndex] = useState<number>(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    loadAllUnicodeEmojis().then((emojis) => {
      setAllEmojis(emojis);
    });
  }, []);

  const fullList = [...serverEmojis, ...allEmojis];

  const suggestions = query
    ? fullList
        .filter((e) => {
          const q = query.toLowerCase();
          const nameMatches = e.name.toLowerCase().startsWith(q);
          const keywordMatches = e.keywords?.some((k) => k.toLowerCase().startsWith(q));
          return nameMatches || keywordMatches;
        })
        .slice(0, 10)
    : [];

  const checkAutocomplete = (text: string, cursorPosition: number) => {
    const textBeforeCursor = text.slice(0, cursorPosition);
    const match = textBeforeCursor.match(/:([a-zA-Z0-9_]{1,15})$/);

    if (match && match.index !== undefined) {
      setQuery(match[1] ?? "");
      setMatchIndex(match.index);
      setSelectedIndex(0);
    } else {
      setQuery(null);
      setMatchIndex(-1);
    }
  };

  const closeAutocomplete = () => {
    setQuery(null);
    setMatchIndex(-1);
  };

  return {
    isOpen: query !== null && suggestions.length > 0,
    suggestions,
    selectedIndex,
    setSelectedIndex,
    matchIndex,
    query,
    checkAutocomplete,
    closeAutocomplete,
  };
}
