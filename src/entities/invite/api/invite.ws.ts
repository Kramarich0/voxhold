import { type IncomingInvite, wsClient } from "@/shared/api/ws-client";

export const inviteWs = {
  onInvitationReceived: (callback: (data: IncomingInvite) => void): (() => void) => {
    return wsClient.on("invitation.received", callback);
  },
};
