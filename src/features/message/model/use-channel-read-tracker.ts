import { useEffect, useEffectEvent, useRef } from "react";
import { useMarkChannelAsReadMutation } from "../api/message.mutations";

type ChannelReadTrackerOptions = {
  serverId: number;
  channelId: number;
  lastMessageId?: number | null;
  enabled?: boolean;
  isAtBottom?: boolean;
  debounceMs?: number;
};

function isWindowVisible(): boolean {
  if (typeof document === "undefined") return false;
  return document.visibilityState === "visible";
}

export function useChannelReadTracker({
  serverId,
  channelId,
  lastMessageId,
  enabled = true,
  isAtBottom = true,
  debounceMs = 500,
}: ChannelReadTrackerOptions) {
  const markAsRead = useMarkChannelAsReadMutation(serverId, channelId);

  const markedByChannelRef = useRef<Map<number, number>>(new Map());
  const pendingReadsRef = useRef<Map<number, number>>(new Map());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const executeMarkAsRead = useEffectEvent((targetChannelId: number, messageId: number) => {
    const lastMarked = markedByChannelRef.current.get(targetChannelId) ?? 0;

    if (messageId > lastMarked && targetChannelId === channelId) {
      markedByChannelRef.current.set(targetChannelId, messageId);
      pendingReadsRef.current.delete(targetChannelId);
      markAsRead.mutate({ last_read_message_id: messageId });
    }
  });

  const scheduleOrQueueRead = useEffectEvent(
    (targetChannelId: number, messageId: number, atBottom: boolean) => {
      if (!enabled || messageId <= 0) return;

      const lastMarked = markedByChannelRef.current.get(targetChannelId) ?? 0;
      if (messageId <= lastMarked) {
        pendingReadsRef.current.delete(targetChannelId);
        return;
      }

      if (!atBottom || !isWindowVisible()) {
        const currentPending = pendingReadsRef.current.get(targetChannelId) ?? 0;
        if (messageId > currentPending) {
          pendingReadsRef.current.set(targetChannelId, messageId);
        }
        if (timerRef.current != null) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        return;
      }

      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      if (debounceMs <= 0) {
        executeMarkAsRead(targetChannelId, messageId);
        return;
      }

      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        if (isAtBottom && isWindowVisible()) {
          executeMarkAsRead(targetChannelId, messageId);
        } else {
          pendingReadsRef.current.set(targetChannelId, messageId);
        }
      }, debounceMs);
    },
  );

  const handleWindowActivity = useEffectEvent(() => {
    if (!isWindowVisible()) return;

    const targetId = pendingReadsRef.current.get(channelId) ?? (isAtBottom ? lastMessageId : null);

    if (targetId != null && targetId > 0) {
      scheduleOrQueueRead(channelId, targetId, isAtBottom);
    }
  });

  useEffect(() => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (enabled && lastMessageId != null && lastMessageId > 0) {
      scheduleOrQueueRead(channelId, lastMessageId, isAtBottom);
    }

    return () => {
      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [channelId, lastMessageId, isAtBottom, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const onActivity = () => {
      handleWindowActivity();
    };

    document.addEventListener("visibilitychange", onActivity);
    window.addEventListener("focus", onActivity);
    window.addEventListener("pointerdown", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity, { passive: true });

    return () => {
      document.removeEventListener("visibilitychange", onActivity);
      window.removeEventListener("focus", onActivity);
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
    };
  }, [enabled]);
}
