import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export type EmptyStateProps = ComponentProps<"div"> & {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  size?: "default" | "sm";
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  size = "default",
  className,
  ...props
}: EmptyStateProps) {
  const isSmall = size === "sm";

  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex h-full min-h-48 w-full flex-col items-center justify-center p-6 text-center select-none animate-in fade-in-0 duration-150",
        isSmall && "min-h-32 p-4",
        className,
      )}
      {...props}
    >
      {icon && (
        <div
          data-slot="empty-state-icon"
          className={cn(
            "mb-3 flex size-10 items-center justify-center rounded-full bg-muted/60 text-muted-foreground [&_svg]:size-5 [&_svg]:shrink-0",
            isSmall && "mb-2 size-8 [&_svg]:size-4",
          )}
        >
          {icon}
        </div>
      )}

      <h3
        data-slot="empty-state-title"
        className={cn(
          "font-semibold text-foreground tracking-tight text-xs",
          isSmall && "text-xs-tight",
        )}
      >
        {title}
      </h3>

      {description && (
        <p
          data-slot="empty-state-description"
          className={cn(
            "mt-1 max-w-xs text-2xs text-muted-foreground leading-relaxed",
            isSmall && "text-3xs max-w-44",
          )}
        >
          {description}
        </p>
      )}

      {action && (
        <div data-slot="empty-state-action" className="mt-3 flex items-center gap-2">
          {action}
        </div>
      )}
    </div>
  );
}
