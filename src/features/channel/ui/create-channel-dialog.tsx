import { HashIcon, SpeakerHighIcon } from "@phosphor-icons/react";
import { type ReactNode, type SubmitEvent, useEffect, useState } from "react";
import type { ChannelKind } from "@/entities/channel/model/channel.types";
import { Button } from "@/shared/ui/core/button";
import { Checkbox } from "@/shared/ui/core/checkbox";
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
import { useCreateChannelMutation } from "../api/channel.mutations";

type ChannelTypeOption = {
  kind: ChannelKind;
  label: string;
  icon: ReactNode;
};

const CHANNEL_TYPE_OPTIONS = [
  {
    kind: "text",
    label: "Text",
    icon: <HashIcon />,
  },
  {
    kind: "voice",
    label: "Voice",
    icon: <SpeakerHighIcon />,
  },
] as const satisfies readonly ChannelTypeOption[];

type Props = {
  serverId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultKind?: ChannelKind;
};

export function CreateChannelDialog({ serverId, open, onOpenChange, defaultKind = "text" }: Props) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<ChannelKind>(defaultKind);
  const createChannel = useCreateChannelMutation(serverId);

  useEffect(() => {
    if (open) {
      setKind(defaultKind);
      setName("");
    }
  }, [open, defaultKind]);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formattedName = name.trim().toLowerCase().replace(/\s+/g, "-");
    if (formattedName === "") return;

    createChannel.mutate(
      { name: formattedName, kind },
      {
        onSuccess: () => {
          setName("");
          onOpenChange(false);
        },
      },
    );
  };

  const handleSelectEmoji = (emoji: string) => {
    setName((prev) => `${prev}${emoji}`);
  };

  const activeChannelType = CHANNEL_TYPE_OPTIONS.find((opt) => opt.kind === kind);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
          <DialogDescription>Channels are where your members communicate.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Channel Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {CHANNEL_TYPE_OPTIONS.map((option) => (
                <div
                  key={option.kind}
                  className="relative flex w-full items-center justify-between"
                >
                  <Button
                    type="button"
                    size="lg"
                    variant="secondary"
                    className="w-full justify-start"
                    onClick={() => setKind(option.kind)}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </Button>
                  <Checkbox
                    checked={kind === option.kind}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="pointer-events-none absolute right-2 size-4 rounded-full"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="channel-name" className="text-xs text-muted-foreground">
              Channel Name
            </Label>
            <div className="relative flex items-center">
              <Input
                id="channel-name"
                placeholder="new-channel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-7 pr-9"
                autoFocus
              />
              <span className="pointer-events-none absolute left-2 text-muted-foreground">
                {activeChannelType?.icon}
              </span>

              <div className="absolute right-1">
                <EmojiPicker
                  side="bottom"
                  align="end"
                  sideOffset={6}
                  tooltipText="Insert Channel Emoji"
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
              disabled={createChannel.isPending}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              isLoading={createChannel.isPending}
              loadingText="Creating..."
              disabled={name.trim() === ""}
            >
              Create
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
