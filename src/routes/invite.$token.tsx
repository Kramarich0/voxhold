import {
  ArrowRightIcon,
  ClockIcon,
  SignInIcon,
  SmileySadIcon,
  SparkleIcon,
  UserCheckIcon,
  UserPlusIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/entities/auth/model/use-auth.store";
import {
  resolveInviteQueryOptions,
  useResolveInviteQuery,
} from "@/entities/invite/api/invite.queries";
import { useAcceptInviteLinkMutation } from "@/features/invite/api/invite.mutations";
import { formatShortDateTime } from "@/shared/lib/date";
import { getInitials } from "@/shared/lib/get-initials";
import { Badge } from "@/shared/ui/core/badge";
import { Button } from "@/shared/ui/core/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/core/card";
import { Separator } from "@/shared/ui/core/separator";
import { Skeleton } from "@/shared/ui/core/skeleton";
import { AppAvatar } from "@/shared/ui/kit/app-avatar";
import { EmptyState } from "@/shared/ui/kit/empty-state";
import { LoadingButton } from "@/shared/ui/kit/loading-button";

export const Route = createFileRoute("/invite/$token")({
  loader: async ({ params, context }) => {
    try {
      await context.queryClient.ensureQueryData(resolveInviteQueryOptions(params.token));
    } catch {
      // Ignore the error in the loader; the component will render the 404 page nicely on its own.
    }
  },
  component: InviteLandingPage,
});

function InviteLandingPage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.token !== null);

  const { data: preview, isLoading, isError } = useResolveInviteQuery(token);
  const acceptInvite = useAcceptInviteLinkMutation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-sm p-6 flex flex-col items-center gap-4">
          <Skeleton className="size-16 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-9 w-full mt-2" />
        </Card>
      </div>
    );
  }

  if (isError || !preview) {
    return (
      <div className="flex h-screen w-screen items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-6">
            <EmptyState
              icon={<SmileySadIcon className="size-8 text-destructive" />}
              title="Invalid or Expired Invite"
              description="This invite link may have expired, reached its maximum number of uses, or does not exist."
              action={
                <Button render={<Link to="/auth" />} variant="default">
                  Go to Login
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = getInitials(preview.server_name);
  const usesText =
    preview.max_uses != null ? `${preview.use_count} / ${preview.max_uses} uses` : "Unlimited uses";

  const handleAuthenticatedJoin = () => {
    acceptInvite.mutate(token);
  };

  const handleRegisterJoin = () => {
    navigate({
      to: "/auth",
      search: { tab: "register", invite: token },
    });
  };

  const handleLoginJoin = () => {
    navigate({
      to: "/auth",
      search: { tab: "login", invite: token },
    });
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center p-4 bg-background selection:bg-primary/20">
      <Card className="w-full pt-0 max-w-sm shadow-lg overflow-hidden border">
        <div className="h-16 w-full bg-linear-to-r from-primary/30 via-primary/15 to-accent/40" />

        <div className="relative px-6 pb-6 pt-0 flex flex-col items-center text-center">
          <div className="relative -mt-8 mb-3">
            <div className="rounded-full ring-4 ring-card bg-card">
              <AppAvatar name={initials} size="lg" className="size-16 text-base font-bold" />
            </div>
          </div>

          <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
            You've been invited to join
          </span>

          <h2 className="text-lg font-bold text-foreground mt-1 truncate max-w-full">
            {preview.server_name}
          </h2>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <UserCheckIcon className="size-3.5" />
            <span>
              Invited by{" "}
              <strong className="text-foreground font-medium">@{preview.creator_username}</strong>
            </span>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-center gap-2 flex-wrap w-full mb-4">
            <Badge variant="outline" className="gap-1 text-2xs py-0.5">
              <ClockIcon className="size-3 text-muted-foreground" />
              <span>Expires {formatShortDateTime(preview.expires_at)}</span>
            </Badge>

            <Badge variant="outline" className="gap-1 text-2xs py-0.5">
              <UsersIcon className="size-3 text-muted-foreground" />
              <span>{usesText}</span>
            </Badge>

            {preview.allow_registration && (
              <Badge variant="secondary" className="gap-1 text-2xs py-0.5 text-primary">
                <SparkleIcon className="size-3" />
                <span>Open Registration</span>
              </Badge>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full">
            {isAuthenticated ? (
              <LoadingButton
                type="button"
                size="lg"
                className="w-full font-medium"
                isLoading={acceptInvite.isPending}
                onClick={handleAuthenticatedJoin}
              >
                Join Server <ArrowRightIcon />
              </LoadingButton>
            ) : preview.allow_registration ? (
              <>
                <Button
                  type="button"
                  size="lg"
                  className="w-full font-medium"
                  onClick={handleRegisterJoin}
                >
                  <UserPlusIcon /> Create Account & Join
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={handleLoginJoin}
                >
                  <SignInIcon /> Already have an account? Sign in
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  size="lg"
                  className="w-full font-medium"
                  onClick={handleLoginJoin}
                >
                  <SignInIcon /> Sign in to Join
                </Button>
                <span className="text-3xs text-muted-foreground mt-1">
                  This invite requires an existing account.
                </span>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
