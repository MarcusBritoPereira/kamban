import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { DataService } from '../../../services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  user = this.authService.currentUser;
  userParams = computed(() => {
    const u = this.user();
    return u ? { name: u.name, email: u.email, avatar_url: u.avatar_url } : null;
  });

  notifications = signal<any[]>([]);
  showNotifications = false;
  unreadCount = computed(() => this.notifications().filter(n => !n.read).length);

  constructor(
    public authService: AuthService,
    private dataService: DataService,
    private router: Router
  ) { }

  ngOnInit() {
    // Small delay to ensure auth is ready if needed, though usually currentUser is enough
    this.loadNotifications();

    // Optional: Polling every minute
    setInterval(() => this.loadNotifications(), 60000);
  }

  loadNotifications() {
    this.dataService.getNotifications().subscribe({
      next: (res) => this.notifications.set(res),
      error: (err) => console.error('Error loading notifications', err)
    });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(notification: any) {
    if (!notification.read) {
      this.dataService.markNotificationAsRead(notification.id).subscribe(() => {
        this.notifications.update(notes =>
          notes.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
      });
    }
    if (notification.link) {
      this.router.navigateByUrl(notification.link);
      this.showNotifications = false;
    }
  }

  markAllRead() {
    this.dataService.markAllNotificationsAsRead().subscribe(() => {
      this.notifications.update(notes => notes.map(n => ({ ...n, read: true })));
    });
  }
}
