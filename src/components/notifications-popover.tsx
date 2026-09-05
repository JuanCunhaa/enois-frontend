import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Bell, CheckCheck } from "lucide-react";

import { networkApi, notificationApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { texts } from "@/texts";
import {
  getNotificationBadge,
  getUnreadCount,
  notificationTabs,
  type NotificationTab,
} from "@/utils/notifications";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { NotificationItem } from "./notification-item";

export function NotificationsPopover() {
  const queryClient = useQueryClient();
  const [activeNotificationTab, setActiveNotificationTab] = useState<NotificationTab>("new");

  const { data: notificationsResponse } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationApi.list(),
  });

  const markNotificationReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationApi.markRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllNotificationsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const acceptConnectionRequestMutation = useMutation({
    mutationFn: (actorId: string) => networkApi.acceptConnectionRequest(actorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network"] });
    },
  });

  const notifications = notificationsResponse?.items ?? [];
  const unreadCount = getUnreadCount(notifications);
  const activeTabConfig = notificationTabs[activeNotificationTab];
  const displayedNotifications = notifications.filter(activeTabConfig.matches);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative grid h-10 w-10 place-items-center rounded-full text-text-subtle transition hover:bg-surface-2 hover:text-primary"
          aria-label={
            unreadCount > 0
              ? texts.notifications.unreadLabel(unreadCount)
              : texts.notifications.title
          }
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-medium leading-none text-primary-foreground">
              {getNotificationBadge(unreadCount)}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[min(calc(100vw-2rem),24rem)] overflow-hidden rounded-2xl border-border-soft bg-surface-card p-0 shadow-card"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border-soft px-4 py-3">
          <span className="text-[14px] font-light text-text-strong">{texts.notifications.title}</span>
          {unreadCount > 0 && activeNotificationTab === "new" && (
            <button
              type="button"
              onClick={() => markAllNotificationsReadMutation.mutate()}
              className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-light text-text-subtle transition hover:text-primary"
            >
              <CheckCheck className="h-3 w-3" />
              {texts.notifications.markAllRead}
            </button>
          )}
        </div>

        <div className="flex border-b border-border-soft">
          {(
            Object.entries(notificationTabs) as [
              NotificationTab,
              (typeof notificationTabs)[NotificationTab],
            ][]
          ).map(([tabKey, tabConfig]) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => setActiveNotificationTab(tabKey)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[12px] font-light transition",
                activeNotificationTab === tabKey
                  ? "border-b-2 border-primary text-primary"
                  : "text-text-subtle hover:text-text-strong",
              )}
            >
              {tabConfig.label}
              {tabKey === "new" && unreadCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="max-h-[28rem] overflow-y-auto">
          {displayedNotifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] font-light text-text-subtle">
              {activeTabConfig.emptyMessage}
            </p>
          ) : (
            displayedNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={(notificationId) =>
                  markNotificationReadMutation.mutate(notificationId)
                }
                onAcceptConnection={(actorId) =>
                  acceptConnectionRequestMutation.mutate(actorId)
                }
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
