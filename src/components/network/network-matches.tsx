import { Link } from "@tanstack/react-router";

import { Check, Send, UserMinus, UserPlus } from "lucide-react";

import type { NetworkUser } from "@/lib/api";
import { texts } from "@/texts";
import type { ConnectionUiState } from "@/utils/network";

import type { NetworkMatchViewModel } from "@/components/network/network-types";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";

type NetworkMatchesProps = {
  matches: NetworkMatchViewModel[];
  isPending: boolean;
  onConnect: (userId: string) => void;
  onRemove: (userId: string) => void;
};

export function NetworkMatches({ matches, isPending, onConnect, onRemove }: NetworkMatchesProps) {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold">{texts.network.matchesTitle}</h2>
          <p className="text-sm text-muted-foreground">{texts.network.matchesDescription}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matches.map(({ user, connectionState }) => (
          <NetworkUserCard
            key={user.id}
            user={user}
            connectionState={connectionState}
            isPending={isPending}
            onConnect={onConnect}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  );
}

type NetworkUserCardProps = {
  user: NetworkUser;
  connectionState: ConnectionUiState;
  isPending: boolean;
  onConnect: (userId: string) => void;
  onRemove: (userId: string) => void;
};

function NetworkUserCard({
  user,
  connectionState,
  isPending,
  onConnect,
  onRemove,
}: NetworkUserCardProps) {
  const actionsByState: Record<
    ConnectionUiState,
    {
      Icon: React.ElementType;
      label: string;
      variant: "default" | "outline";
      className: string;
      run: () => void;
    }
  > = {
    connected: {
      Icon: UserMinus,
      label: texts.network.remove,
      variant: "outline",
      className: "text-destructive hover:text-destructive",
      run: () => onRemove(user.id),
    },
    requested: {
      Icon: Send,
      label: texts.network.requested,
      variant: "default",
      className: "",
      run: () => onConnect(user.id),
    },
    available: {
      Icon: UserPlus,
      label: texts.network.connect,
      variant: "default",
      className: "",
      run: () => onConnect(user.id),
    },
  };
  const action = actionsByState[connectionState];
  const ActionIcon = action.Icon;

  return (
    <article className="surface-card overflow-hidden text-center">
      <div className="h-16" style={{ background: "var(--gradient-soft)" }} />
      <div className="-mt-10 px-5 pb-5">
        <UserAvatar
          src={user.avatar}
          alt={user.name}
          className="mx-auto h-20 w-20 ring-4 ring-card"
        />
        <Link
          to="/perfil/$username"
          params={{ username: user.username }}
          className="mt-3 block font-semibold hover:underline"
        >
          {user.name}
        </Link>
        <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs text-muted-foreground">
          {user.headline}
        </p>
        <p className="mt-2 text-xs text-primary">
          <Check className="mr-1 inline h-3 w-3" />
          {user.connected ? texts.network.connected : texts.network.commonInterests}
        </p>
        <Button
          className={`mt-4 w-full rounded-full gap-1.5 ${action.className}`}
          variant={action.variant}
          disabled={isPending}
          onClick={action.run}
        >
          <ActionIcon className="h-4 w-4" /> {action.label}
        </Button>
      </div>
    </article>
  );
}
