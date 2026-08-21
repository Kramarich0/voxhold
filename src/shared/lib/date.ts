import { format, formatDistanceToNow, isSameDay } from "date-fns";

export function toDate(timestampInSeconds: number): Date {
  return new Date(timestampInSeconds * 1000);
}

export function formatTime(timestampInSeconds: number): string {
  return format(toDate(timestampInSeconds), "HH:mm");
}

export function formatFullDateTime(timestampInSeconds: number): string {
  return format(toDate(timestampInSeconds), "PPPP 'at' p");
}

export function formatDateDivider(timestampInSeconds: number): string {
  return format(toDate(timestampInSeconds), "MMMM d, yyyy");
}

export function formatShortDateTime(timestampInSeconds: number): string {
  return format(toDate(timestampInSeconds), "MMM d, HH:mm");
}

export function formatLastSeen(timestampInSeconds?: number | null): string {
  if (!timestampInSeconds || timestampInSeconds <= 0) {
    return "Offline";
  }
  return `Last seen ${formatDistanceToNow(toDate(timestampInSeconds), { addSuffix: true })}`;
}

export function isSameDayTimestamp(timestampSecA: number, timestampSecB: number): boolean {
  return isSameDay(toDate(timestampSecA), toDate(timestampSecB));
}
