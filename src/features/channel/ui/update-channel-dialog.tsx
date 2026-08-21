import { type SubmitEvent, useEffect, useState } from "react";
import type { Channel } from "@/entities/channel/model/channel.types";
import { Button } from "@/shared/ui/core/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/core/dialog";
import { Input } from "@/shared/ui/core/input";
import { Label } from "@/shared/ui/core/label";
import { EmojiPicker } from "@/shared/ui/kit/emoji-picker";
import { LoadingButton } from "@/shared/ui/kit/loading-button";
import { useUpdateChannelMutation } from "../api/channel.mutations";

type Props = {
  channel: Channel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UpdateChannelDialog({ channel, open, onOpenChange }: Props) {
  const [name, setName] = useState("");
  const updateChannel = useUpdateChannelMutation(channel?.server_id ?? 0);

  useEffect(() => {
    if (channel && open) {
      setName(channel.name);
    }
  }, [channel, open]);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (channel == null) return;
    const formattedName = name.trim().toLowerCase().replace(/\s+/g, "-");
    if (formattedName === "" || formattedName === channel.name) {
      onOpenChange(false);
      return;
    }

    updateChannel.mutate(
      { channelId: channel.id, payload: { name: formattedName } },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  const handleSelectEmoji = (emoji: string) => {
    setName((prev) => `${prev}${emoji}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Channel</DialogTitle>
          <DialogDescription>Update the channel name or emoji.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-channel-name" className="text-xs text-muted-foreground">
              Channel Name
            </Label>
            <div className="relative flex items-center">
              <Input
                id="edit-channel-name"
                placeholder="channel-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pr-9"
                autoFocus
              />

              <div className="absolute right-1">
                <EmojiPicker
                  side="bottom"
                  align="end"
                  sideOffset={6}
                  tooltipText="Insert Emoji"
                  triggerClassName="size-7"
                  onSelect={handleSelectEmoji}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateChannel.isPending}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              isLoading={updateChannel.isPending}
              disabled={name.trim() === ""}
            >
              Save Changes
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
