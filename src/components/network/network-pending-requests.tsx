import { Link } from "@tanstack/react-router";

import { Check, X } from "lucide-react";

import { texts } from "@/texts";
import type { RequestDirection } from "@/utils/network";

import type { NetworkRequestViewModel } from "@/components/network/network-types";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";

type NetworkPendingRequestsProps = {
  incomingRequests: NetworkRequestViewModel[];
  outgoingRequests: NetworkRequestViewModel[];
  onAccept: (userId: string) => void;
  onCancel: (userId: string) => void;
};

export function NetworkPendingRequests({
  incomingRequests,
  outgoingRequests,
  onAccept,
  onCancel,
}: NetworkPendingRequestsProps) {
  const groups = [
    { direction: "incoming" as const, label: texts.network.received, requests: incomingRequests },
    { direction: "outgoing" as const, label: texts.network.sent, requests: outgoingRequests },
  ];
  const totalRequestCount = incomingRequests.length + outgoingRequests.length;

  if (totalRequestCount === 0) return null;

  return (
    <section>
      <div className="mb-3">
        <h2 className="text-lg font-semibold">{texts.network.pendingTitle}</h2>
        <p className="text-sm text-muted-foreground">
          {texts.network.pendingCount(totalRequestCount)}
        </p>
      </div>
      <div className="space-y-3">
        {groups.map(({ direction, label, requests }) => {
          if (requests.length === 0) return null;
          return (
            <div
              key={direction}
              className={direction === "outgoing" && incomingRequests.length > 0 ? "pt-3" : ""}
            >
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
              <div className="space-y-3">
                {requests.map((requestViewModel) => (
                  <NetworkRequestCard
                    key={requestViewModel.request.id}
                    requestViewModel={requestViewModel}
                    onAccept={onAccept}
                    onCancel={onCancel}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

type NetworkRequestCardProps = {
  requestViewModel: NetworkRequestViewModel;
  onAccept: (userId: string) => void;
  onCancel: (userId: string) => void;
};

function NetworkRequestCard({
  requestViewModel,
  onAccept,
  onCancel,
}: NetworkRequestCardProps) {
  const { request, direction, targetUserId, user } = requestViewModel;
  const descriptionsByDirection: Record<RequestDirection, string> = {
    outgoing: texts.network.requestSent,
    incoming: texts.network.wantsToConnect,
  };
  const actionsByDirection: Record<RequestDirection, React.ReactNode> = {
    outgoing: (
      <Button
        size="sm"
        variant="outline"
        className="shrink-0 rounded-full gap-1.5"
        onClick={() => onCancel(request.toUserId)}
      >
        <X className="h-4 w-4" /> {texts.network.cancel}
      </Button>
    ),
    incoming: (
      <div className="flex shrink-0 gap-2">
        <Button
          size="sm"
          variant="outline"
          className="rounded-full gap-1.5"
          onClick={() => onCancel(request.fromUserId)}
        >
          <X className="h-4 w-4" /> {texts.network.reject}
        </Button>
        <Button
          size="sm"
          className="rounded-full gap-1.5"
          onClick={() => onAccept(request.fromUserId)}
        >
          <Check className="h-4 w-4" /> {texts.network.accept}
        </Button>
      </div>
    ),
  };

  return (
    <div className="surface-card flex items-center justify-between gap-4 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <UserAvatar src={user?.avatar} alt={user?.name} className="h-12 w-12 shrink-0" />
        <div className="min-w-0">
          <Link
            to="/perfil/$username"
            params={{ username: user?.username ?? targetUserId }}
            className="font-semibold hover:underline"
          >
            {user?.name ?? texts.common.loading}
          </Link>
          {user?.headline && (
            <p className="truncate text-xs text-muted-foreground">{user.headline}</p>
          )}
          <p className="text-[11px] text-muted-foreground">{descriptionsByDirection[direction]}</p>
        </div>
      </div>
      {actionsByDirection[direction]}
    </div>
  );
}
