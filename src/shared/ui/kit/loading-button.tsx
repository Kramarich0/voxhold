import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Button } from "../core/button";
import { Spinner } from "../core/spinner";

type Props = ComponentProps<typeof Button> & {
  children: ReactNode;
  isLoading: boolean;
  loadingText?: string;
};

export function LoadingButton({
  children,
  className,
  disabled,
  isLoading,
  loadingText,
  ...props
}: Props) {
  const content = loadingText ?? (typeof children === "string" ? children : "Loading...");

  return (
    <Button
      {...props}
      disabled={isLoading || disabled}
      className={cn("relative inline-flex items-center justify-center", className)}
    >
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center gap-2 bg-inherit rounded-[inherit]">
          <Spinner />
          {content}
        </span>
      )}
      <span
        className={cn("inline-flex items-center justify-center gap-1.5", isLoading && "invisible")}
      >
        {children}
      </span>
    </Button>
  );
}
