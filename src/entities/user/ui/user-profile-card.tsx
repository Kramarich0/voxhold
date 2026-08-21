import { CalendarBlankIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { COUNTRIES } from "@/shared/lib/countries";
import { formatDateDivider, formatLastSeen } from "@/shared/lib/date";
import { getInitials } from "@/shared/lib/get-initials";
import { Card } from "@/shared/ui/core/card";
import { Separator } from "@/shared/ui/core/separator";
import { Skeleton } from "@/shared/ui/core/skeleton";
import { AppAvatar } from "@/shared/ui/kit/app-avatar";
import { useUserProfileQuery } from "../api/user.queries";

type Props = {
  userId: number;
  roleBadge?: ReactNode;
  isOnline?: boolean;
  className?: string;
};

export function UserProfileCard({ userId, roleBadge, isOnline = false, className }: Props) {
  const { data: profile, isLoading, isError } = useUserProfileQuery(userId);

  if (isLoading) {
    return <UserProfileCardSkeleton className={className} />;
  }

  if (isError || !profile) {
    return (
      <Card className="w-72 p-4 text-center text-xs text-muted-foreground select-none">
        User profile not found.
      </Card>
    );
  }

  const country = profile.country_code
    ? COUNTRIES.find((c) => c.code === profile.country_code?.toUpperCase())
    : null;

  const initials = getInitials(profile.username);
  const memberSince = formatDateDivider(profile.created_at);
  const lastSeenText = formatLastSeen(profile.last_seen_at);

  return (
    <Card className={cn("w-72 overflow-hidden p-0 select-none", className)}>
      <div className="h-14 w-full bg-linear-to-r from-primary/30 via-primary/15 to-accent/40" />

      <div className="relative px-3.5 pb-3">
        <div className="relative -mt-7 mb-2 inline-block">
          <div className="rounded-full ring-4 ring-card bg-card">
            <AppAvatar name={initials} size="lg" className="size-14 text-sm" />
          </div>
          <span
            className={cn(
              "absolute bottom-0 right-0 size-3 rounded-full ring-2 ring-card",
              isOnline ? "bg-success" : "bg-muted-foreground",
            )}
          />
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="text-sm font-bold text-foreground truncate">{profile.username}</h4>
            {roleBadge}
          </div>

          <span className="text-3xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <span
              className={cn(
                "size-1.5 rounded-full inline-block",
                isOnline ? "bg-success" : "bg-muted-foreground",
              )}
            />
            <span>{isOnline ? "Online" : lastSeenText}</span>
          </span>
        </div>

        <Separator className="my-2.5" />

        <div className="flex flex-col gap-1">
          <span className="text-3xs font-bold uppercase tracking-wider text-muted-foreground">
            About Me
          </span>
          <p className="text-xs text-foreground/90 leading-relaxed wrap-break-word whitespace-pre-wrap line-clamp-4">
            {profile.about?.trim() ? (
              profile.about
            ) : (
              <span className="text-muted-foreground italic text-2xs">No bio yet</span>
            )}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between gap-1.5 text-2xs text-muted-foreground border-t pt-2.5">
          <div className="flex items-center gap-1.5">
            <CalendarBlankIcon className="size-3.5 shrink-0" />
            <span>Joined {memberSince}</span>
          </div>
          {country && (
            <div className="flex items-center gap-1.5">
              <img src={country.flagUrl} alt="" className="size-3.5 rounded-xs object-cover" />
              <span className="truncate">{country.label}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function UserProfileCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("w-72 overflow-hidden border bg-card p-0", className)}>
      <div className="h-14 w-full bg-muted/40" />
      <div className="px-3.5 pb-3">
        <Skeleton className="-mt-7 mb-2 size-14 rounded-full ring-4 ring-card" />
        <div className="flex flex-col gap-1.5 mt-1">
          <Skeleton className="h-4 w-28 rounded-xs" />
          <Skeleton className="h-2.5 w-14 rounded-xs" />
        </div>
        <Separator className="my-2.5" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-2.5 w-16 rounded-xs" />
          <Skeleton className="h-8 w-full rounded-xs" />
        </div>
      </div>
    </Card>
  );
}
