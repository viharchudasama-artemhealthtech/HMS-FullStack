import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppNotification, AppNotificationType } from '../models/notification.models';

@Injectable({
  providedIn: 'root'
})
export class AppNotificationService {
  private readonly storageKey = 'hms_app_notifications';
  private readonly notificationsSubject = new BehaviorSubject<AppNotification[]>(this.loadNotifications());
  readonly notifications$ = this.notificationsSubject.asObservable();

  get notifications(): AppNotification[] {
    return this.notificationsSubject.value;
  }

  get unreadCount(): number {
    return this.notifications.filter(notification => !notification.read).length;
  }

  push(type: AppNotificationType, title: string, message: string): void {
    const next: AppNotification = {
      id: crypto.randomUUID(),
      title,
      message,
      type,
      createdAt: new Date().toISOString(),
      read: false
    };

    const updated = [next, ...this.notifications].slice(0, 25);
    this.save(updated);
  }

  success(title: string, message: string): void {
    this.push('success', title, message);
  }

  error(title: string, message: string): void {
    this.push('error', title, message);
  }

  info(title: string, message: string): void {
    this.push('info', title, message);
  }

  markAllAsRead(): void {
    this.save(this.notifications.map(notification => ({ ...notification, read: true })));
  }

  markAsRead(id: string): void {
    this.save(this.notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  }

  clear(): void {
    this.save([]);
  }

  private loadNotifications(): AppNotification[] {
    const raw = sessionStorage.getItem(this.storageKey);
    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as AppNotification[];
    } catch {
      sessionStorage.removeItem(this.storageKey);
      return [];
    }
  }

  private save(notifications: AppNotification[]): void {
    this.notificationsSubject.next(notifications);
    sessionStorage.setItem(this.storageKey, JSON.stringify(notifications));
  }
}
