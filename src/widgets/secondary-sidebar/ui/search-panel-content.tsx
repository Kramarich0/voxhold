import { HashIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import { useState } from "react";
import { useServerMessageSearchQuery } from "@/entities/message/api/message.queries";
import type { SearchResult } from "@/entities/message/model/message.types";
import {
  SearchResultCard,
  SearchResultCardSkeleton,
} from "@/entities/message/ui/search-result-card";
import { cn } from "@/shared/lib/cn";
import { getInitials } from "@/shared/lib/get-initials";
import { Badge } from "@/shared/ui/core/badge";
import { Button } from "@/shared/ui/core/button";
import { Card } from "@/shared/ui/core/card";
import { ScrollArea } from "@/shared/ui/core/scroll-area";
import { Skeleton } from "@/shared/ui/core/skeleton";
import { AppAvatar } from "@/shared/ui/kit/app-avatar";
import { AppSearch } from "@/shared/ui/kit/app-search";
import { EmptyState } from "@/shared/ui/kit/empty-state";
import { SkeletonList } from "@/shared/ui/kit/skeleton-list";

type Props = {
  serverId: number;
  initialQuery?: string;
  onSelectResult: (result: SearchResult) => void;
};

export function SearchPanelContent({ serverId, initialQuery = "", onSelectResult }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useServerMessageSearchQuery(serverId, query);

  const results = data?.pages.flatMap((page) => page.messages) ?? [];

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div className="p-2.5">
        <AppSearch
          value={query}
          onSearch={setQuery}
          placeholder="Search keywords..."
          className="w-full"
          autoFocus
        />
      </div>

      <ScrollArea className="flex-1 px-2 py-2">
        {isLoading ? (
          <SkeletonList
            count={5}
            component={SearchResultCardSkeleton}
            className="flex flex-col gap-2 p-1"
          />
        ) : query.trim() === "" ? (
          <EmptyState
            icon={<MagnifyingGlassIcon className="size-5" />}
            title="Find anything in text channels"
            description="Search across all channels"
          />
        ) : results.length === 0 ? (
          <EmptyState
            icon={<MagnifyingGlassIcon className="size-5 opacity-40" />}
            title="No matches found"
            description={`No results found for "${query}"`}
          />
        ) : (
          <div className="flex flex-col gap-1">
            <div className="text-3xs font-bold uppercase tracking-wider text-muted-foreground px-2 py-1 select-none">
              {results.length} Results
            </div>

            {results.map((result) => (
              <SearchResultCard
                key={result.id}
                result={result}
                query={query}
                onClick={() => onSelectResult(result)}
              />
            ))}

            {hasNextPage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="mt-2 w-full text-xs text-muted-foreground hover:text-foreground"
              >
                {isFetchingNextPage ? "Loading more..." : "Load more results"}
              </Button>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
