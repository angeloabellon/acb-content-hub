"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import {
  markAllCommunityNotificationsRead,
  markCommunityNotificationRead,
} from "@/app/comunidad/actions";
import type { CommunityNotification } from "@/lib/community-notifications";
import {
  markAllCommunityNotificationsReadInState,
  markCommunityNotificationReadInState,
} from "@/lib/community-notification-state";

type CommunityNotificationsProps = {
  initialNotifications: CommunityNotification[];
  initialUnreadCount: number;
  variant: "header" | "mobile-menu";
  onNavigate?: () => void;
};

function notificationCopy(notification: CommunityNotification): string {
  const actor = notification.actorUsername ? `@${notification.actorUsername}` : notification.actorName;
  return notification.type === "mention"
    ? `${actor} te mencionó`
    : `Nueva respuesta de ${actor}`;
}

function badgeLabel(count: number): string {
  return `${count} ${count === 1 ? "aviso sin leer" : "avisos sin leer"}`;
}

function NotificationBell() {
  return (
    <svg className="community-notifications-icon" aria-hidden="true" viewBox="0 0 24 24">
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

export default function CommunityNotifications({
  initialNotifications,
  initialUnreadCount,
  variant,
  onNavigate,
}: CommunityNotificationsProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isOpen, setIsOpen] = useState(false);
  const [, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || variant !== "header") return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen, variant]);

  const groups = useMemo(() => {
    const byTopic = new Map<string, CommunityNotification[]>();
    for (const notification of notifications) {
      const group = byTopic.get(notification.topicId) ?? [];
      group.push(notification);
      byTopic.set(notification.topicId, group);
    }
    return [...byTopic.entries()].map(([topicId, items]) => ({ topicId, items }));
  }, [notifications]);

  const markRead = (id: string) => {
    const target = notifications.find((notification) => notification.id === id);
    if (!target || target.readAt) return;

    const readAt = new Date().toISOString();
    setNotifications((current) => markCommunityNotificationReadInState(current, id, readAt));
    setUnreadCount((current) => Math.max(0, current - 1));
    startTransition(async () => {
      const result = await markCommunityNotificationRead(id);
      if (!result.ok) {
        setNotifications((current) => current.map((notification) => (
          notification.id === id ? { ...notification, readAt: null } : notification
        )));
        setUnreadCount((current) => current + 1);
      }
    });
  };

  const markAllRead = () => {
    const unreadIds = new Set(notifications.filter((notification) => !notification.readAt).map(({ id }) => id));
    if (!unreadIds.size) return;
    const readAt = new Date().toISOString();
    setNotifications((current) => markAllCommunityNotificationsReadInState(current, readAt));
    setUnreadCount(0);
    startTransition(async () => {
      const result = await markAllCommunityNotificationsRead();
      if (!result.ok) {
        setNotifications((current) => current.map((notification) => (
          unreadIds.has(notification.id) ? { ...notification, readAt: null } : notification
        )));
        setUnreadCount(unreadIds.size);
      }
    });
  };

  const notificationPanel = (
    <div id={`community-notifications-${variant}`} className="community-notifications-panel">
      <div className="community-notifications-heading">
        <div>
          <p>Comunidad</p>
          <h2>Avisos</h2>
        </div>
        {unreadCount > 0 && (
          <button type="button" onClick={markAllRead}>Marcar todas como leídas</button>
        )}
      </div>
      {groups.length ? (
        <div className="community-notifications-list">
          {groups.map(({ topicId, items }) => (
            <section key={topicId} className="community-notification-group">
              <Link href={`/comunidad/tema/${items[0].topicSlug}`} onClick={onNavigate} className="community-notification-topic">
                {items[0].topicTitle}
              </Link>
              {items.map((notification) => (
                <Link
                  key={notification.id}
                  href={`/comunidad/tema/${notification.topicSlug}`}
                  onClick={() => {
                    markRead(notification.id);
                    setIsOpen(false);
                    onNavigate?.();
                  }}
                  className={`community-notification-item${notification.readAt ? "" : " is-unread"}`}
                >
                  <span>{notificationCopy(notification)}</span>
                  <small>{notification.readAt ? "Leído" : "Nuevo"}</small>
                </Link>
              ))}
            </section>
          ))}
        </div>
      ) : (
        <p className="community-notifications-empty">No tienes avisos por ahora.</p>
      )}
    </div>
  );

  if (variant === "mobile-menu") {
    return (
      <div className="community-notifications community-notifications--mobile-menu">
        <button type="button" className="community-notifications-trigger" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} aria-controls="community-notifications-mobile-menu">
          <NotificationBell /> Avisos
          {unreadCount > 0 && <strong aria-label={badgeLabel(unreadCount)}>{unreadCount > 99 ? "99+" : unreadCount}</strong>}
        </button>
        {isOpen && notificationPanel}
      </div>
    );
  }

  return (
    <div className="community-notifications community-notifications--header" ref={panelRef}>
      <button type="button" className="community-notifications-trigger" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} aria-controls="community-notifications-header" aria-label={badgeLabel(unreadCount)}>
        <NotificationBell />
        <span className="sr-only">Avisos</span>
        {unreadCount > 0 && <strong aria-hidden="true">{unreadCount > 99 ? "99+" : unreadCount}</strong>}
      </button>
      {isOpen && notificationPanel}
    </div>
  );
}
