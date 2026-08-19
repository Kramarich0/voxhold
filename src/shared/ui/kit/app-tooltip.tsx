import { isValidElement, type ReactNode } from "react";
import { useCanHover } from "@/shared/hooks/use-can-hover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/core/tooltip";

type AppTooltipProps = {
  content?: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "center" | "start" | "end";
  sideOffset?: number;
  alignOffset?: number;
  delay?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  disabled?: boolean;
};

export function AppTooltip({
  content,
  children,
  side = "top",
  align = "center",
  sideOffset = 4,
  alignOffset = 0,
  delay,
  open,
  onOpenChange,
  className,
  disabled = false,
}: AppTooltipProps) {
  const canHover = useCanHover();

  if (content == null || disabled || !canHover) {
    return <>{children}</>;
  }

  const tooltipElement = (
    <Tooltip open={open} onOpenChange={onOpenChange}>
      {isValidElement(children) ? (
        <TooltipTrigger render={children} />
      ) : (
        <TooltipTrigger>{children}</TooltipTrigger>
      )}

      <TooltipContent
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className={className}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );

  if (delay != null) {
    return <TooltipProvider delay={delay}>{tooltipElement}</TooltipProvider>;
  }

  return tooltipElement;
}
