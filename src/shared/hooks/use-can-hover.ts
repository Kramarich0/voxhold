import { useSyncExternalStore } from "react";

const MEDIA_QUERY = "(hover: hover) and (pointer: fine)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(MEDIA_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(MEDIA_QUERY).matches;
}

export function useCanHover() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
