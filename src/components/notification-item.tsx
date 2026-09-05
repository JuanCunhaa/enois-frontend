import { useNavigate } from "@tanstack/react-router";

import type { Notification } from "@/lib/api";
import { cn } from "@/lib/utils";
import { texts } from "@/texts";
import { navigateToHref } from "@/utils/navigation";
import { formatNotificationTime } from "@/utils/time";

import { notificationMeta } from "./notification-meta";

type NotificationItemProps = {
  notification: Notification;
  onMarkAsRead: (notificationId: string) => void;
  onAcceptConnection: (actorId: string) => void;
};

type NotificationActionKind = "accept" | "navigate" | "none";

export function NotificationItem({
  notification,
  onMarkAsRead,
  onAcceptConnection,
}: NotificationItemProps) {
  const navigate = useNavigate();
  const notificationKind = notification.kind.toLowerCase();
  const notificationMetaConfig =
    notificationMeta[notificationKind] ?? notificationMeta.connection;
  const NotificationIcon = notificationMetaConfig.icon;

  const handleMarkAsRead = () => {
    if (!notification.read) onMarkAsRead(notification.id);
  };

  const handleNavigate = () => {
    handleMarkAsRead();
    navigateToHref(notification.href, navigate);
  };

  const handleAcceptConnection = () => {
    if (!notification.actorId) return;
    handleMarkAsRead();
    onAcceptConnection(notification.actorId);
  };

  const canAcceptConnection =
    notificationKind === "connection_request" && Boolean(notification.actorId);
  const actionKind: NotificationActionKind = canAcceptConnection
    ? "accept"
    : notification.ctaLabel
      ? "navigate"
      : "none";

  const actionConfigByKind: Record<
    Exclude<NotificationActionKind, "none">,
    { label: string; onClick: () => void }
  > = {
    accept: {
      label: notification.ctaLabel || texts.notifications.accept,
      onClick: handleAcceptConnection,
    },
    navigate: {
      label: notification.ctaLabel ?? "",
      onClick: handleNavigate,
    },
  };

  const actionConfig = actionKind === "none" ? null : actionConfigByKind[actionKind];

  return (
    <div
      className={cn(
        "border-b border-border-soft px-4 py-3 last:border-b-0",
        notification.read ? "bg-surface-card" : "bg-surface-3",
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={handleNavigate}
          className="shrink-0 rounded-full transition hover:opacity-80"
        >
          {notification.actorAvatar ? (
            <img
              src={notification.actorAvatar}
              alt={notification.actorName ?? ""}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <span
              className={cn(
                "grid h-9 w-9 place-items-center rounded-full",
                notificationMetaConfig.className,
              )}
            >
              <NotificationIcon className="h-4 w-4" />
            </span>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[13px] font-light leading-tight text-text-strong">
              {notification.actorName && <span>{notification.actorName} </span>}
              <span className="text-text-subtle">{notification.title.toLowerCase()}</span>
            </p>
            {!notification.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
          </div>

          <p className="mt-1 break-words text-[13px] font-light leading-snug text-text-subtle">
            {notification.body}
          </p>

          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-[11px] font-light text-text-subtle">
              {formatNotificationTime(notification.createdAt)}
            </span>

            <div className="flex items-center gap-2">
              {!notification.read && (
                <button
                  type="button"
                  onClick={handleMarkAsRead}
                  className="rounded-full px-2 py-1 text-[11px] font-light text-text-subtle transition hover:bg-surface-2 hover:text-text-strong"
                >
                  {texts.notifications.markRead}
                </button>
              )}

              {actionConfig && (
                <button
                  type="button"
                  onClick={actionConfig.onClick}
                  className="rounded-full bg-primary px-3 py-1 text-[11px] font-light text-primary-foreground transition hover:bg-primary/90"
                >
                  {actionConfig.label}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
