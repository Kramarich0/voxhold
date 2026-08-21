import { type SubmitEvent, useEffect, useState } from "react";
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
import { useUpdateServerMutation } from "../api/server.mutations";

type Props = {
  serverId: number;
  open: boolean;
  serverName: string;
  onOpenChange: (open: boolean) => void;
};

export function UpdateServerDialog({ serverId, open, onOpenChange, serverName }: Props) {
  const [name, setName] = useState("");
  const updateServer = useUpdateServerMutation(serverId);

  useEffect(() => {
    if (open) {
      setName(serverName);
    }
  }, [open, serverName]);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formattedName = name.trim().toLowerCase().replace(/\s+/g, "-");
    if (formattedName === "") return;

    updateServer.mutate(
      { payload: { name: formattedName } },
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
          <DialogTitle>Update Server</DialogTitle>
          <DialogDescription>Update server name.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="server-name" className="text-xs text-muted-foreground">
              Server Name
            </Label>
            <div className="relative flex items-center">
              <Input
                id="server-name"
                placeholder="new-server"
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
                  tooltipText="Insert Server Emoji"
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
              disabled={updateServer.isPending}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              isLoading={updateServer.isPending}
              disabled={name.trim() === ""}
            >
              Update
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
