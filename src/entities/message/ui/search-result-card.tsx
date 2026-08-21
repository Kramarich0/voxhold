import { HashIcon } from "@phosphor-icons/react";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { formatShortDateTime } from "@/shared/lib/date";
import { getInitials } from "@/shared/lib/get-initials";
import { Badge } from "@/shared/ui/core/badge";
import { Card } from "@/shared/ui/core/card";
import { Skeleton } from "@/shared/ui/core/skeleton";
import { AppAvatar } from "@/shared/ui/kit/app-avatar";
import type { SearchResult } from "../model/message.types";

type Props = ComponentProps<typeof Card> & {
  result: SearchResult;
  query?: string;
};

export function SearchResultCard({ result, query = "", className, ...props }: Props) {
  const initials = getInitials(result.author.username);
  const timeFormatted = formatShortDateTime(result.created_at);

  return (
    <Card
      size="sm"
      className={cn(
        "group/search-result flex flex-row items-start gap-2.5 rounded-md px-2.5 py-2 transition-colors",
        "hover:bg-muted/50 cursor-pointer border-none ring-0 select-none",
        className,
      )}
      {...props}
    >
      <AppAvatar name={initials} size="sm" className="mt-0.5" />

      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-semibold text-foreground truncate">
              {result.author.username}
            </span>
            <Badge variant="outline" className="h-3.5 gap-0.5 px-1 text-3xs font-normal shrink-0">
              <HashIcon className="size-2.5" />
              <span className="truncate max-w-20">{result.channel_name}</span>
            </Badge>
          </div>

          <span className="text-3xs text-muted-foreground tabular-nums shrink-0">
            {timeFormatted}
          </span>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground wrap-break-word mt-0.5 line-clamp-2">
          <HighlightQuery text={result.content} query={query} />
        </p>
      </div>
    </Card>
  );
}

export function SearchResultCardSkeleton({ className }: { className?: string }) {
  return (
    <Card
      size="sm"
      className={cn(
        "flex flex-row items-center gap-2.5 rounded-md px-2 py-2 border-none ring-0 bg-transparent",
        className,
      )}
    >
      <Skeleton className="size-8 rounded-full shrink-0" />
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <Skeleton className="h-3 w-24 rounded-xs" />
        <Skeleton className="h-3.5 w-full rounded-xs" />
      </div>
    </Card>
  );
}

function HighlightQuery({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: highlight tokens
          <mark key={i} className="bg-primary/20 text-foreground font-semibold rounded-xs px-0.5">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}
