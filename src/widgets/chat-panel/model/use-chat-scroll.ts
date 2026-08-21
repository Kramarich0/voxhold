import { useEffect, useRef, useState } from "react";
import type { VirtuosoHandle } from "react-virtuoso";

const START_INDEX = 100_000;

type UseChatScrollOptions = {
  displayedMessages: Array<{ id: number }>;
  targetMessageId?: number | null;
  isMessagesLoading?: boolean;
  isContextMode?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchOlderPage: () => Promise<{ prependedCount: number }>;
  fetchNewerPage: () => Promise<void>;
};

export function useChatScroll({
  displayedMessages,
  targetMessageId,
  isMessagesLoading = false,
  isContextMode = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchOlderPage,
  fetchNewerPage,
}: UseChatScrollOptions) {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [firstItemIndex, setFirstItemIndex] = useState(START_INDEX);

  const lastNavigatedTargetIdRef = useRef<number | null>(null);

  useEffect(() => {
    setFirstItemIndex(START_INDEX);
    lastNavigatedTargetIdRef.current = null;
  }, [isContextMode, targetMessageId]);

  const handleStartReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchOlderPage().then(({ prependedCount }) => {
        if (prependedCount > 0) {
          setFirstItemIndex((prev) => prev - prependedCount);
        }
      });
    }
  };

  const handleEndReached = () => {
    if (isContextMode) {
      fetchNewerPage();
    }
  };

  useEffect(() => {
    if (targetMessageId == null || isContextMode) {
      return;
    }

    if (isMessagesLoading || displayedMessages.length === 0) {
      return;
    }

    if (lastNavigatedTargetIdRef.current === targetMessageId) {
      return;
    }

    const targetIndex = displayedMessages.findIndex((m) => m.id === targetMessageId);
    if (targetIndex === -1) return;

    lastNavigatedTargetIdRef.current = targetMessageId;

    const timer = setTimeout(() => {
      virtuosoRef.current?.scrollToIndex({
        index: firstItemIndex + targetIndex,
        align: "center",
        behavior: "auto",
      });
    }, 32);

    return () => clearTimeout(timer);
  }, [targetMessageId, isContextMode, isMessagesLoading, displayedMessages, firstItemIndex]);

  const scrollToBottom = () => {
    virtuosoRef.current?.scrollToIndex({
      index: firstItemIndex + displayedMessages.length - 1,
      align: "end",
      behavior: "auto",
    });
  };

  return {
    virtuosoRef,
    isAtBottom,
    setIsAtBottom,
    firstItemIndex,
    handleStartReached,
    handleEndReached,
    scrollToBottom,
  };
}
