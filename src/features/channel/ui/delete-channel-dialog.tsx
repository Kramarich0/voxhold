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
import { CopyButton } from "@/shared/ui/kit/copy-button";
import { LoadingButton } from "@/shared/ui/kit/loading-button";
import { useDeleteChannelMutation } from "../api/channel.mutations";

type Props = {
  channel: Channel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteChannelDialog({ channel, open, onOpenChange }: Props) {
  const [confirmName, setConfirmName] = useState("");
  const deleteChannel = useDeleteChannelMutation(channel?.server_id ?? 0);

  useEffect(() => {
    if (!open) {
      setConfirmName("");
    }
  }, [open]);

  if (channel == null) return null;

  const isNameMatching = confirmName.trim() === channel.name;

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isNameMatching || deleteChannel.isPending) return;

    deleteChannel.mutate(channel.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Channel</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">#{channel.name}</span>? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm-channel-name" className="text-xs text-muted-foreground">
              Please type{" "}
              <div className="flex text-foreground items-center bg-accent rounded-md p-1 px-2 gap-1">
                <span className="truncate max-w-32">{channel.name}</span>{" "}
                <CopyButton className="size-4" value={channel.name} variant="plain" />
              </div>{" "}
              to confirm
            </Label>
            <div className="relative flex items-center">
              <Input
                id="confirm-channel-name"
                placeholder={channel.name}
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                autoFocus
                autoComplete="off"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={deleteChannel.isPending}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="destructive"
              isLoading={deleteChannel.isPending}
              disabled={!isNameMatching}
            >
              Delete Channel
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
