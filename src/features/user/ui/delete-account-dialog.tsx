import { WarningIcon } from "@phosphor-icons/react";
import { type SubmitEvent, useEffect, useState } from "react";
import { useDeleteAccountMutation } from "@/features/auth/api/auth.mutations";
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

type Props = {
  username: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteAccountDialog({ username, open, onOpenChange }: Props) {
  const [confirmUsername, setConfirmUsername] = useState("");
  const deleteAccount = useDeleteAccountMutation();

  useEffect(() => {
    if (!open) {
      setConfirmUsername("");
    }
  }, [open]);

  const isUsernameMatching = confirmUsername.trim() === username;

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isUsernameMatching || deleteAccount.isPending) return;

    deleteAccount.mutate(undefined, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-1">
            <WarningIcon className="size-5" />
            <DialogTitle>Delete Account</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete your account{" "}
            <span className="font-semibold text-foreground">@{username}</span>? This action is
            permanent and cannot be undone. All your messages will be anonymized.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm-username" className="text-xs text-muted-foreground">
              Please type{" "}
              <div className="flex text-foreground items-center bg-accent rounded-md p-1 px-2 gap-1">
                <span className="truncate max-w-32">{username}</span>
                <CopyButton className="size-4" value={username} variant="plain" />
              </div>{" "}
              to confirm
            </Label>
            <div className="relative flex items-center">
              <Input
                id="confirm-username"
                placeholder={username}
                value={confirmUsername}
                onChange={(e) => setConfirmUsername(e.target.value)}
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
              disabled={deleteAccount.isPending}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="destructive"
              isLoading={deleteAccount.isPending}
              disabled={!isUsernameMatching}
            >
              Delete Account
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
