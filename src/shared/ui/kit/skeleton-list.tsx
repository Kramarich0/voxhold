import type { ComponentProps, ComponentType, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export type SkeletonListProps = ComponentProps<"div"> & {
  count?: number;
  component?: ComponentType<{ index?: number; className?: string }>;
  renderItem?: (index: number) => ReactNode;
  children?: ((index: number) => ReactNode) | ReactNode;
};

export function SkeletonList({
  count = 5,
  component: Component,
  renderItem,
  children,
  className,
  ...props
}: SkeletonListProps) {
  return (
    <div
      data-slot="skeleton-list"
      aria-busy="true"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    >
      {Array.from({ length: count }, (_, index) => {
        if (Component) {
          return <Component key={index} index={index} />;
        }
        if (renderItem) {
          return <div key={index}>{renderItem(index)}</div>;
        }
        if (typeof children === "function") {
          return <div key={index}>{children(index)}</div>;
        }
        return <div key={index}>{children}</div>;
      })}
    </div>
  );
}
