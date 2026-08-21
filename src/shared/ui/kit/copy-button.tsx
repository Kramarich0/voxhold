import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";
import { useCopyToClipboard } from "@/shared/lib/use-copy-to-clipboard";
import { Button, type buttonVariants } from "@/shared/ui/core/button";
import { AppTooltip } from "@/shared/ui/kit/app-tooltip";

type Props = {
  value: string;
  className?: string;
  disabled?: boolean;
  tooltipSide?: "top" | "right" | "bottom" | "left";
  tooltipText?: string;
  copiedTooltipText?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
};

export function CopyButton({
  value,
  className,
  disabled = false,
  tooltipSide = "top",
  tooltipText = "Copy",
  copiedTooltipText = "Copied!",
  variant = "ghost",
}: Props) {
  const { copy, isCopied } = useCopyToClipboard();

  return (
    <AppTooltip
      content={isCopied ? copiedTooltipText : tooltipText}
      side={tooltipSide}
      disabled={disabled}
    >
      <Button
        type="button"
        variant={variant}
        size="icon-sm"
        disabled={disabled}
        aria-label={tooltipText}
        onClick={() => void copy(value)}
        className={cn(
          "relative size-6 shrink-0 rounded-sm transition-colors text-muted-foreground hover:text-foreground",
          isCopied && "text-success hover:text-success",
          className,
        )}
      >
        <CopyIcon
          className={cn(
            "size-3.5 transition-all duration-200",
            isCopied ? "scale-0 opacity-0" : "scale-100 opacity-100",
          )}
        />

        <CheckIcon
          className={cn(
            "absolute size-3.5 text-success transition-all duration-200",
            isCopied ? "scale-100 opacity-100" : "scale-0 opacity-0",
          )}
        />

        <span className="sr-only">Copy</span>
      </Button>
    </AppTooltip>
  );
}
