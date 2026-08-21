import { UserIcon } from "@phosphor-icons/react";
import { type ComponentProps, type ReactNode, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { getInitials } from "@/shared/lib/get-initials";
import { Avatar, AvatarFallback } from "@/shared/ui/core/avatar";

type AppAvatarProps = ComponentProps<typeof Avatar> & {
  name?: string | null;
  src?: string | null;
  alt?: string;
  icon?: ReactNode;
  fallbackClassName?: string;
  priority?: boolean;
};

const loadedAvatarUrls = new Set<string>();

function resolveStatus(src?: string | null): "loading" | "success" | "error" {
  if (src?.trim() == null || src.trim() === "") return "error";
  return loadedAvatarUrls.has(src) ? "success" : "loading";
}

export function AppAvatar({
  name,
  src,
  alt,
  icon,
  size = "default",
  className,
  fallbackClassName,
  priority = false,
  ...props
}: AppAvatarProps) {
  const [prevSrc, setPrevSrc] = useState(src);
  const [status, setStatus] = useState(() => resolveStatus(src));

  if (src !== prevSrc) {
    setPrevSrc(src);
    setStatus(resolveStatus(src));
  }

  const label = name ?? alt ?? "";
  const initials = getInitials(label);
  const isError = status === "error";

  return (
    <Avatar
      size={size}
      className={cn("relative select-none shrink-0 overflow-hidden", className)}
      {...props}
    >
      {status === "loading" && (
        <span className="absolute inset-0 z-10 animate-pulse rounded-full bg-muted/50" />
      )}

      {!isError && src && (
        <img
          src={src}
          alt={label}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setStatus("error")}
          onLoad={() => {
            loadedAvatarUrls.add(src);
            setStatus("success");
          }}
          className={cn(
            "aspect-square size-full object-cover transition-opacity duration-200",
            status === "success" ? "opacity-100" : "opacity-0",
          )}
        />
      )}

      {isError && (
        <AvatarFallback
          className={cn("bg-primary/10 text-primary font-semibold text-xs", fallbackClassName)}
        >
          {initials !== "?" ? initials : (icon ?? <UserIcon className="size-3.5" />)}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
