"use client";

import { cn } from "cn";
import { BellIcon, CheckCheckIcon, CheckIcon, Trash2Icon } from "lucide-react";
import * as React from "react";
import { Link, useLocale } from "react-aria-components";
import { Badge } from "@/core/badge/badge";
import { Button, LinkButton } from "@/core/button/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/core/empty/empty";
import {
  Glance,
  GlanceContent,
  GlanceFooter,
  GlanceHeader,
  GlanceIndicator,
  GlanceTitle,
  GlanceTrigger,
} from "@/core/glance/glance";
import { Skeleton } from "@/core/skeleton/skeleton";
import { Tooltip, TooltipTrigger } from "@/core/tooltip/tooltip";
import { type DictionaryNamespace, useFmaMessages } from "@/lib/i18n/i18n";

type NotificationLabels = {
  /** The panel and page list name. */
  title: string;
  /** The bell's accessible name. */
  trigger: (unread: number) => string;
  unread: string;
  read: string;
  markAsRead: string;
  markAllAsRead: string;
  delete: string;
  empty: string;
  emptyDescription: string;
  loading: string;
  viewAll: string;
  formatDate: (date: Date, locale: string) => string;
};

export type NotificationCenterConfig = { labels: NotificationLabels };

declare global {
  interface FmaNamespaces {
    notificationCenter: NotificationCenterConfig;
  }
}

export const notificationCenterEn: DictionaryNamespace<NotificationCenterConfig> = {
  labels: {
    title: "Notifications",
    trigger: (unread) =>
      unread > 0 ? `Notifications, ${unread} unread` : "Notifications, none unread",
    unread: "Unread",
    read: "Read",
    markAsRead: "Mark as read",
    markAllAsRead: "Mark all as read",
    delete: "Delete",
    empty: "No notifications",
    emptyDescription: "You're all caught up.",
    loading: "Loading notifications…",
    viewAll: "View all notifications",
    formatDate: (date, locale) =>
      new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date),
  },
};

type NotificationData = {
  id: string;
  title: React.ReactNode;
  message?: React.ReactNode;
  date?: Date | null;
  isRead?: boolean;
  /** Where the notification leads; makes the title a link. */
  href?: string;
  /** Replaces the unread dot with an icon (e.g. an `IconTile`). */
  icon?: React.ReactNode;
};

type NotificationI18n = { labels?: Partial<NotificationLabels> };

const defaultNotificationLabels = notificationCenterEn.labels;

function useNotificationLabels(i18n?: NotificationI18n): NotificationLabels {
  return useFmaMessages("notificationCenter", notificationCenterEn, i18n).labels;
}

type NotificationHandlers = {
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  /** Called when the title link is followed (e.g. to mark it as read). */
  onOpen?: (notification: NotificationData) => void;
};

type NotificationVariant = "compact" | "card";

/** What `NotificationMenu` and `NotificationList` hand to the items they render. */
type NotificationListContextValue = NotificationHandlers & {
  variant: NotificationVariant;
  i18n?: NotificationI18n;
};

const NotificationListContext = React.createContext<NotificationListContextValue | null>(null);

type NotificationItemContextValue = NotificationHandlers & {
  notification: NotificationData;
  variant: NotificationVariant;
  labels: NotificationLabels;
  titleId: string;
};

const NotificationItemContext = React.createContext<NotificationItemContextValue | null>(null);

function useNotificationItem(part: string) {
  const context = React.useContext(NotificationItemContext);
  if (!context) throw new Error(`${part} must be used within NotificationItem`);
  return context;
}

type NotificationItemProps = NotificationHandlers & {
  notification: NotificationData;
  /** Defaults to the list's: `compact` in `NotificationMenu`, `card` in `NotificationList`. */
  variant?: NotificationVariant;
  i18n?: NotificationI18n;
  className?: string;
  /**
   * The parts (`NotificationItemMedia`, `NotificationItemContent`,
   * `NotificationItemHeader`, `NotificationItemTitle`, `NotificationItemStatus`,
   * `NotificationItemMessage`, `NotificationItemDate`,
   * `NotificationItemActions`), to restyle, reorder or add to them. Without
   * it, all of them in that order.
   */
  children?: React.ReactNode;
};

/**
 * One notification: unread dot (or icon), title (a link when it has `href`),
 * message, date and the read/delete actions. `variant="card"` is the roomier
 * page layout, with a status badge and the full message. Inside a
 * `NotificationMenu` or `NotificationList` it takes their handlers.
 */
function NotificationItem({
  notification,
  variant: variantProp,
  i18n: i18nProp,
  onMarkAsRead,
  onDelete,
  onOpen,
  className,
  children,
}: NotificationItemProps) {
  const list = React.useContext(NotificationListContext);
  const labels = useNotificationLabels(i18nProp ?? list?.i18n);
  const titleId = React.useId();
  const variant = variantProp ?? list?.variant ?? "compact";
  const isRead = notification.isRead ?? false;

  return (
    <NotificationItemContext.Provider
      value={{
        notification,
        variant,
        labels,
        titleId,
        onMarkAsRead: onMarkAsRead ?? list?.onMarkAsRead,
        onDelete: onDelete ?? list?.onDelete,
        onOpen: onOpen ?? list?.onOpen,
      }}
    >
      <li
        data-slot="notification-item"
        data-variant={variant}
        data-read={isRead || undefined}
        className={cn(
          "flex min-w-0 items-start gap-3",
          variant === "card"
            ? "rounded-xl border bg-card p-4 text-card-foreground"
            : "rounded-lg p-2",
          className,
        )}
      >
        {children ?? (
          <>
            <NotificationItemMedia />
            <NotificationItemContent>
              <NotificationItemHeader>
                <NotificationItemTitle />
                <NotificationItemStatus />
              </NotificationItemHeader>
              <NotificationItemMessage />
              <NotificationItemDate />
            </NotificationItemContent>
            <NotificationItemActions />
          </>
        )}
      </li>
    </NotificationItemContext.Provider>
  );
}

/**
 * The notification's `icon` (or `children`, e.g. an `Avatar`) with the unread
 * dot on its corner; without either, just the dot.
 */
function NotificationItemMedia({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const { notification, variant } = useNotificationItem("NotificationItemMedia");
  const media = children ?? notification.icon;
  const isRead = notification.isRead ?? false;

  if (!media) {
    return (
      <span
        data-slot="notification-dot"
        aria-hidden="true"
        className={cn("mt-1.5 size-2 shrink-0 rounded-full", !isRead && "bg-primary", className)}
      />
    );
  }
  return (
    <span
      data-slot="notification-media"
      aria-hidden="true"
      className={cn("relative shrink-0", className)}
    >
      {media}
      {!isRead && (
        <span
          data-slot="notification-dot"
          className={cn(
            "absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary ring-2",
            variant === "card" ? "ring-card" : "ring-popover",
          )}
        />
      )}
    </span>
  );
}

/** The column holding the title, message and date. */
function NotificationItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="notification-content"
      className={cn("flex min-w-0 flex-1 flex-col gap-1", className)}
      {...props}
    />
  );
}

/** The title row: the title, with the status pushed to the end in a card. */
function NotificationItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { variant } = useNotificationItem("NotificationItemHeader");
  return (
    <div
      data-slot="notification-header"
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1",
        variant === "card" && "justify-between",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The title, a link when the notification has `href` (calling `onOpen`).
 * `children` replaces its text.
 */
function NotificationItemTitle({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const { notification, variant, titleId, onOpen } = useNotificationItem("NotificationItemTitle");
  const { title, href } = notification;
  const isRead = notification.isRead ?? false;
  const text = children ?? title;

  return (
    <span
      id={titleId}
      data-slot="notification-title"
      className={cn(
        "min-w-0 leading-snug",
        variant === "card" ? "text-base" : "text-sm",
        isRead ? "text-muted-foreground" : "font-medium",
        className,
      )}
    >
      {href ? (
        <Link
          href={href}
          onPress={() => onOpen?.(notification)}
          className="rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {text}
        </Link>
      ) : (
        text
      )}
    </span>
  );
}

/**
 * Read or unread: a badge in a card; in the compact variant only read out
 * (the dot shows it).
 */
function NotificationItemStatus({ className }: { className?: string }) {
  const { notification, variant, labels } = useNotificationItem("NotificationItemStatus");
  const isRead = notification.isRead ?? false;
  if (variant === "card") {
    return (
      <Badge
        data-slot="notification-status"
        variant={isRead ? "muted-dot" : "primary-dot"}
        className={className}
      >
        {isRead ? labels.read : labels.unread}
      </Badge>
    );
  }
  return isRead ? null : <span className="sr-only">{labels.unread}</span>;
}

/** The message (or `children`); clamped to two lines in the compact variant. */
function NotificationItemMessage({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const { notification, variant } = useNotificationItem("NotificationItemMessage");
  const message = children ?? notification.message;
  if (!message) return null;
  return (
    <div
      data-slot="notification-message"
      className={cn(
        "text-sm text-muted-foreground",
        variant !== "card" && "line-clamp-2",
        className,
      )}
    >
      {message}
    </div>
  );
}

/** The date, formatted by the `formatDate` label. */
function NotificationItemDate({ className }: { className?: string }) {
  const { notification, labels } = useNotificationItem("NotificationItemDate");
  const { locale } = useLocale();
  const { date } = notification;
  if (!date) return null;
  return (
    <time
      dateTime={date.toISOString()}
      data-slot="notification-date"
      className={cn("text-xs text-muted-foreground", className)}
    >
      {labels.formatDate(date, locale)}
    </time>
  );
}

/** An icon button with its label in a tooltip, tied to the notification's title. */
function NotificationItemAction({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress: () => void;
  /** The icon. */
  children: React.ReactNode;
}) {
  const { titleId } = useNotificationItem("NotificationItemAction");
  return (
    <TooltipTrigger>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={label}
        aria-describedby={titleId}
        onPress={onPress}
      >
        {children}
      </Button>
      <Tooltip>{label}</Tooltip>
    </TooltipTrigger>
  );
}

/**
 * "Mark as read" (while unread) and "Delete", for the handlers given.
 * `children` adds more `NotificationItemAction`s before them.
 */
function NotificationItemActions({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const { notification, labels, onMarkAsRead, onDelete } =
    useNotificationItem("NotificationItemActions");
  const { id } = notification;
  const isRead = notification.isRead ?? false;
  if (!children && !onDelete && !(onMarkAsRead && !isRead)) return null;

  return (
    <div
      data-slot="notification-actions"
      className={cn("-my-1 flex shrink-0 items-center", className)}
    >
      {children}
      {onMarkAsRead && !isRead && (
        <NotificationItemAction label={labels.markAsRead} onPress={() => onMarkAsRead(id)}>
          <CheckIcon />
        </NotificationItemAction>
      )}
      {onDelete && (
        <NotificationItemAction label={labels.delete} onPress={() => onDelete(id)}>
          <Trash2Icon />
        </NotificationItemAction>
      )}
    </div>
  );
}

function NotificationsEmpty({
  labels,
  className,
}: {
  labels: NotificationLabels;
  className?: string;
}) {
  return (
    <Empty data-slot="notification-empty" className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CheckCheckIcon />
        </EmptyMedia>
        <EmptyTitle>{labels.empty}</EmptyTitle>
        <EmptyDescription>{labels.emptyDescription}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function NotificationsLoading({
  labels,
  count,
  variant,
}: {
  labels: NotificationLabels;
  count: number;
  variant: "compact" | "card";
}) {
  return (
    <div
      role="status"
      data-slot="notification-loading"
      className={cn("flex flex-col", variant === "card" ? "gap-3" : "gap-1")}
    >
      <span className="sr-only">{labels.loading}</span>
      {Array.from({ length: count }, (_, index) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
          key={index}
          aria-hidden="true"
          className={cn(
            "flex gap-3",
            variant === "card" ? "rounded-xl border p-4" : "rounded-lg p-2",
          )}
        >
          <Skeleton className="mt-1 size-2 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

type NotificationMenuProps = NotificationHandlers & {
  notifications: NotificationData[];
  /** Defaults to the unread items in `notifications`; pass the server's total if it pages. */
  unreadCount?: number;
  isLoading?: boolean;
  /** Shows "Mark all as read" in the panel header while there are unread items. */
  onMarkAllAsRead?: () => void;
  /** The page with every notification; shows the "View all" link in the footer. */
  viewAllHref?: string;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  i18n?: NotificationI18n;
  /** `sm` matches a compact top bar, next to `Glance` triggers in `size="sm"`. */
  size?: "default" | "sm";
  className?: string;
  /** Renders each notification, to compose the `NotificationItem`'s parts. */
  children?: (notification: NotificationData) => React.ReactNode;
};

/**
 * The header bell: an icon `GlanceTrigger` with the unread count, opening a
 * panel with the recent notifications, their actions, "Mark all as read" and
 * a link to the full page.
 */
function NotificationMenu({
  notifications,
  unreadCount,
  isLoading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onOpen,
  viewAllHref,
  isOpen,
  onOpenChange,
  i18n,
  className,
  size = "default",
  children,
}: NotificationMenuProps) {
  const labels = useNotificationLabels(i18n);
  const unread = unreadCount ?? notifications.filter((item) => !item.isRead).length;

  return (
    <Glance isOpen={isOpen} onOpenChange={onOpenChange}>
      <GlanceTrigger
        size={size === "sm" ? "icon-sm" : "icon"}
        aria-label={labels.trigger(unread)}
        data-slot="notification-trigger"
        className={className}
      >
        <BellIcon />
        {unread > 0 && <GlanceIndicator>{unread > 99 ? "99+" : unread}</GlanceIndicator>}
      </GlanceTrigger>
      <GlanceContent data-slot="notification-menu" className="w-[min(24rem,calc(100vw-2rem))]">
        {({ close }) => (
          <>
            <GlanceHeader className="items-center justify-between">
              <GlanceTitle>{labels.title}</GlanceTitle>
              {onMarkAllAsRead && unread > 0 && (
                <Button variant="ghost" size="xs" onPress={onMarkAllAsRead}>
                  <CheckCheckIcon data-icon="inline-start" />
                  {labels.markAllAsRead}
                </Button>
              )}
            </GlanceHeader>
            <div className="-mx-1 max-h-[min(28rem,60vh)] min-h-0 overflow-y-auto px-1">
              {isLoading ? (
                <NotificationsLoading labels={labels} count={3} variant="compact" />
              ) : notifications.length === 0 ? (
                <NotificationsEmpty labels={labels} className="p-4" />
              ) : (
                <NotificationListContext.Provider
                  value={{
                    variant: "compact",
                    i18n,
                    onMarkAsRead,
                    onDelete,
                    onOpen: (item) => {
                      onOpen?.(item);
                      close();
                    },
                  }}
                >
                  <ul aria-label={labels.title} className="flex flex-col gap-1">
                    {notifications.map((notification) => (
                      <React.Fragment key={notification.id}>
                        {children ? (
                          children(notification)
                        ) : (
                          <NotificationItem notification={notification} />
                        )}
                      </React.Fragment>
                    ))}
                  </ul>
                </NotificationListContext.Provider>
              )}
            </div>
            {viewAllHref && (
              <GlanceFooter>
                <LinkButton href={viewAllHref} variant="outline" onPress={close}>
                  {labels.viewAll}
                </LinkButton>
              </GlanceFooter>
            )}
          </>
        )}
      </GlanceContent>
    </Glance>
  );
}

type NotificationListProps = NotificationHandlers & {
  notifications: NotificationData[];
  isLoading?: boolean;
  /** How many placeholders to show while loading. */
  loadingCount?: number;
  i18n?: NotificationI18n;
  className?: string;
  /** Renders each notification, to compose the `NotificationItem`'s parts. */
  children?: (notification: NotificationData) => React.ReactNode;
};

/** Every notification as cards, for a dedicated page; pair it with `Pagination`. */
function NotificationList({
  notifications,
  isLoading = false,
  loadingCount = 3,
  onMarkAsRead,
  onDelete,
  onOpen,
  i18n,
  className,
  children,
}: NotificationListProps) {
  const labels = useNotificationLabels(i18n);

  if (isLoading) {
    return <NotificationsLoading labels={labels} count={loadingCount} variant="card" />;
  }
  if (notifications.length === 0) {
    return <NotificationsEmpty labels={labels} className={cn("border", className)} />;
  }
  return (
    <NotificationListContext.Provider
      value={{ variant: "card", i18n, onMarkAsRead, onDelete, onOpen }}
    >
      <ul
        aria-label={labels.title}
        data-slot="notification-list"
        className={cn("flex flex-col gap-3", className)}
      >
        {notifications.map((notification) => (
          <React.Fragment key={notification.id}>
            {children ? children(notification) : <NotificationItem notification={notification} />}
          </React.Fragment>
        ))}
      </ul>
    </NotificationListContext.Provider>
  );
}

export type {
  NotificationData,
  NotificationI18n,
  NotificationItemProps,
  NotificationLabels,
  NotificationListProps,
  NotificationMenuProps,
};
export {
  type defaultNotificationLabels,
  NotificationItem,
  NotificationItemAction,
  NotificationItemActions,
  NotificationItemContent,
  NotificationItemDate,
  NotificationItemHeader,
  NotificationItemMedia,
  NotificationItemMessage,
  NotificationItemStatus,
  NotificationItemTitle,
  NotificationList,
  NotificationMenu,
};
