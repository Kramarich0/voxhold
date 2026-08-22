import {
  ArrowClockwiseIcon,
  PaperPlaneRightIcon,
  QrCodeIcon,
  SparkleIcon,
  UserPlusIcon,
} from "@phosphor-icons/react";
import { QRCodeSVG } from "qrcode.react";
import { type FormEvent, useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/core/select";
import { Switch } from "@/shared/ui/core/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/core/tabs";
import { CopyButton } from "@/shared/ui/kit/copy-button";
import { LoadingButton } from "@/shared/ui/kit/loading-button";
import {
  useCreateDirectInviteMutation,
  useCreateInviteLinkMutation,
} from "../api/invite.mutations";

type Props = {
  serverId: number;
  serverName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const LIFETIME_OPTIONS = [
  { label: "30 minutes", value: "1800" },
  { label: "1 hour", value: "3600" },
  { label: "6 hours", value: "21600" },
  { label: "12 hours", value: "43200" },
  { label: "1 day (24h)", value: "86400" },
  { label: "7 days", value: "604800" },
  { label: "30 days", value: "2592000" },
];

const MAX_USES_OPTIONS = [
  { label: "No limit", value: "unlimited" },
  { label: "1 use", value: "1" },
  { label: "5 uses", value: "5" },
  { label: "10 uses", value: "10" },
  { label: "25 uses", value: "25" },
  { label: "50 uses", value: "50" },
  { label: "100 uses", value: "100" },
];

export function CreateInviteDialog({ serverId, serverName, open, onOpenChange }: Props) {
  const [activeTab, setActiveTab] = useState<"link" | "direct">("link");
  const [expiresIn, setExpiresIn] = useState("86400");
  const [maxUses, setMaxUses] = useState("1");
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [directUsername, setDirectUsername] = useState("");

  const createLink = useCreateInviteLinkMutation(serverId);
  const createDirect = useCreateDirectInviteMutation(serverId);

  useEffect(() => {
    if (open) {
      setGeneratedToken(null);
      setShowQR(false);
      setExpiresIn("86400");
      setMaxUses("1");
      setAllowRegistration(true);
      setDirectUsername("");
      setActiveTab("link");
    }
  }, [open]);

  const handleAllowRegistrationChange = (enabled: boolean) => {
    setAllowRegistration(enabled);
    if (enabled) {
      if (Number(expiresIn) > 86400) {
        setExpiresIn("86400");
      }
      if (maxUses === "unlimited") {
        setMaxUses("1");
      }
    }
  };

  const handleGenerateLink = () => {
    createLink.mutate(
      {
        expires_in_seconds: Number(expiresIn),
        max_uses: maxUses === "unlimited" ? null : Number(maxUses),
        allow_registration: allowRegistration,
      },
      {
        onSuccess: (data) => {
          setGeneratedToken(data.token);
        },
      },
    );
  };

  const handleSendDirect = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = directUsername.trim();
    if (!trimmed || createDirect.isPending) return;

    createDirect.mutate(
      { username: trimmed },
      {
        onSuccess: () => {
          setDirectUsername("");
          onOpenChange(false);
        },
      },
    );
  };

  const inviteUrl = generatedToken ? `${window.location.origin}/invite/${generatedToken}` : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite People to {serverName}</DialogTitle>
          <DialogDescription>
            Share an invite link with QR code or invite an existing user directly.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "link" | "direct")}>
          <TabsList className="grid w-full grid-cols-2 mb-2">
            <TabsTrigger value="link">Invite Link</TabsTrigger>
            <TabsTrigger value="direct">Direct Invite</TabsTrigger>
          </TabsList>

          <TabsContent value="link">
            {!generatedToken ? (
              <div className="flex flex-col gap-4 py-1">
                <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg border bg-muted/30">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <SparkleIcon className="size-3.5 text-primary" />
                      Allow Registration
                    </span>
                    <span className="text-2xs text-muted-foreground">
                      Allow new users to register an account with this link
                    </span>
                  </div>
                  <Switch
                    checked={allowRegistration}
                    onCheckedChange={handleAllowRegistrationChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">Expire After</Label>
                    <Select value={expiresIn} onValueChange={(v) => v && setExpiresIn(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LIFETIME_OPTIONS.map((opt) => {
                          if (allowRegistration && Number(opt.value) > 86400) return null;
                          return (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">Max Number of Uses</Label>
                    <Select value={maxUses} onValueChange={(v) => v && setMaxUses(v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MAX_USES_OPTIONS.map((opt) => {
                          if (allowRegistration && opt.value === "unlimited") return null;
                          return (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter className="mt-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <LoadingButton
                    type="button"
                    onClick={handleGenerateLink}
                    isLoading={createLink.isPending}
                  >
                    Generate Link
                  </LoadingButton>
                </DialogFooter>
              </div>
            ) : (
              <div className="flex flex-col gap-4 py-1 animate-in fade-in-0 duration-200">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">Share this invite link</Label>
                  <div className="relative flex items-center">
                    <Input
                      readOnly
                      value={inviteUrl}
                      className="pr-9 font-mono text-xs select-all bg-muted/40"
                      onFocus={(e) => e.target.select()}
                    />
                    <div className="absolute right-1.5">
                      <CopyButton value={inviteUrl} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-3 rounded-lg border bg-card gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs text-muted-foreground"
                    onClick={() => setShowQR((prev) => !prev)}
                  >
                    <QrCodeIcon className="size-4" />
                    {showQR ? "Hide QR Code" : "Show QR Code"}
                  </Button>

                  {showQR && (
                    <div className="p-3 bg-white rounded-xl shadow-xs animate-in zoom-in-95 duration-150">
                      <QRCodeSVG
                        value={inviteUrl}
                        size={160}
                        level="M"
                        bgColor="#ffffff"
                        fgColor="#000000"
                      />
                    </div>
                  )}
                </div>

                <DialogFooter className="flex items-center justify-between sm:justify-between w-full mt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => setGeneratedToken(null)}
                  >
                    <ArrowClockwiseIcon className="size-3.5" />
                    New Link
                  </Button>
                  <Button type="button" variant="default" onClick={() => onOpenChange(false)}>
                    Done
                  </Button>
                </DialogFooter>
              </div>
            )}
          </TabsContent>

          <TabsContent value="direct">
            <form onSubmit={handleSendDirect} className="flex flex-col gap-4 py-1">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="direct-username" className="text-xs text-muted-foreground">
                  Username
                </Label>
                <div className="relative flex items-center">
                  <Input
                    id="direct-username"
                    placeholder="e.g. alex_dev"
                    value={directUsername}
                    onChange={(e) => setDirectUsername(e.target.value)}
                    autoFocus
                  />
                </div>
                <span className="text-2xs text-muted-foreground">
                  The user will receive an instant notification and can accept or decline.
                </span>
              </div>

              <DialogFooter className="mt-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <LoadingButton
                  type="submit"
                  isLoading={createDirect.isPending}
                  disabled={!directUsername.trim()}
                >
                  <PaperPlaneRightIcon /> Send Invitation
                </LoadingButton>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
