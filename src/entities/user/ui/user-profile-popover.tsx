import { type ReactNode, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/core/popover";
import { UserProfileCard } from "./user-profile-card";

type Props = {
  userId?: number;
  roleBadge?: ReactNode;
  isOnline?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  children: ReactNode;
};

export function UserProfilePopover({
  userId,
  roleBadge,
  isOnline,
  side = "right",
  align = "start",
  sideOffset = 8,
  children,
}: Props) {
  const [open, setOpen] = useState(false);

  if (!userId || userId <= 0) {
    return <>{children}</>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<span className="inline-flex cursor-pointer" />}>
        {children}
      </PopoverTrigger>

      <PopoverContent
        side={side}
        align={align}
        sideOffset={sideOffset}
        className="w-auto p-0 border-none bg-transparent shadow-none z-50"
      >
        {open && <UserProfileCard userId={userId} roleBadge={roleBadge} isOnline={isOnline} />}
      </PopoverContent>
    </Popover>
  );
}
