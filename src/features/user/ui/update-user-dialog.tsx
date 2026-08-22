import { TrashIcon } from "@phosphor-icons/react";
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
import { Separator } from "@/shared/ui/core/separator";
import { EmojiPicker } from "@/shared/ui/kit/emoji-picker";
import { LoadingButton } from "@/shared/ui/kit/loading-button";
import { useUpdateUserMutation } from "../api/user.mutations";
import { CountryPicker } from "./country-picker";
import { DeleteAccountDialog } from "./delete-account-dialog";

type Props = {
  open: boolean;
  username: string;
  userAbout: string;
  userCountryCode: string;
  onOpenChange: (open: boolean) => void;
};

export function UpdateUserDialog({
  open,
  onOpenChange,
  username,
  userAbout,
  userCountryCode,
}: Props) {
  const [about, setAbout] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const updateUser = useUpdateUserMutation();

  useEffect(() => {
    if (open) {
      setAbout(userAbout);
      setCountryCode(userCountryCode);
    }
  }, [open, userAbout, userCountryCode]);

  const formattedAbout = about.trim();
  const formattedCountryCode = countryCode.trim().toUpperCase();

  const isUnchanged =
    formattedAbout === userAbout.trim() &&
    formattedCountryCode === userCountryCode.trim().toUpperCase();

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isUnchanged || updateUser.isPending) {
      onOpenChange(false);
      return;
    }

    updateUser.mutate(
      {
        payload: {
          about: formattedAbout,
          country_code: formattedCountryCode,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  const handleSelectEmoji = (emoji: string) => {
    setAbout((prev) => `${prev}${emoji}`);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
            <DialogDescription>Update your personal info and country.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <div className="relative flex flex-col gap-1.5">
                <Label htmlFor="user-about" className="text-xs text-muted-foreground">
                  About
                </Label>
                <div className="relative flex items-center">
                  <Input
                    id="user-about"
                    placeholder="Tell us about yourself..."
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
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

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Country</Label>
                <CountryPicker value={countryCode} onChange={setCountryCode} />
              </div>
            </div>

            <Separator />
            <div className="flex items-center justify-between gap-2 p-2 rounded-md border border-destructive/20">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-destructive">Delete Account</span>
                <span className="text-2xs text-muted-foreground">
                  Permanently remove your account
                </span>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <TrashIcon /> Delete
              </Button>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateUser.isPending}
              >
                Cancel
              </Button>
              <LoadingButton type="submit" isLoading={updateUser.isPending} disabled={isUnchanged}>
                Save Changes
              </LoadingButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteAccountDialog
        username={username}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  );
}
