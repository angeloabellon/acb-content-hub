export type CommunityNotificationReadState = {
  id: string;
  readAt: string | null;
};

export function countUnreadCommunityNotifications(
  notifications: CommunityNotificationReadState[],
): number {
  return notifications.filter((notification) => !notification.readAt).length;
}

export function markCommunityNotificationReadInState<T extends CommunityNotificationReadState>(
  notifications: T[],
  notificationId: string,
  readAt: string,
): T[] {
  return notifications.map((notification) => (
    notification.id === notificationId && !notification.readAt
      ? { ...notification, readAt }
      : notification
  ));
}

export function markAllCommunityNotificationsReadInState<T extends CommunityNotificationReadState>(
  notifications: T[],
  readAt: string,
): T[] {
  return notifications.map((notification) => (
    notification.readAt ? notification : { ...notification, readAt }
  ));
}
