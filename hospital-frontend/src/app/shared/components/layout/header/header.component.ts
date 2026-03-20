import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../../../core/models/auth.models';
import { AppNotificationService } from '../../../../core/services/app-notification.service';
import { AppNotification } from '../../../../core/models/notification.models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  user: User | null = null;
  today = new Date();
  notifications: AppNotification[] = [];
  isNotificationPanelOpen = false;

  constructor(
    private authService: AuthService,
    private appNotificationService: AppNotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });

    this.appNotificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  get roleLabel(): string {
    return this.user?.role ? this.user.role.replaceAll('_', ' ') : 'Staff';
  }

  get unreadCount(): number {
    return this.notifications.filter(notification => !notification.read).length;
  }

  toggleNotifications(): void {
    this.isNotificationPanelOpen = !this.isNotificationPanelOpen;
    if (this.isNotificationPanelOpen) {
      this.appNotificationService.markAllAsRead();
    }
  }

  clearNotifications(): void {
    this.appNotificationService.clear();
  }

  trackByNotificationId(_: number, notification: AppNotification): string {
    return notification.id;
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
