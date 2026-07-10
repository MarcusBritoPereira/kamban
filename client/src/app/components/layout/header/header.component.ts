import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { DataService } from '../../../services/data.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

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
  currentUrl = signal<string>('');
  pageTitle = computed(() => this.getPageTitle(this.currentUrl()));

  constructor(
    public authService: AuthService,
    private dataService: DataService,
    private router: Router
  ) { }

  ngOnInit() {
    this.currentUrl.set(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.currentUrl.set(event.urlAfterRedirects));

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
      console.log('Header: Notification clicked', notification.link);
      if (notification.link.startsWith('/tasks/')) {
        // Handle legacy/direct links by fetching context
        const taskId = notification.link.split('/').pop();
        if (taskId) {
          this.dataService.getTask(taskId).subscribe({
            next: (task) => {
              console.log('Header: Resolved legacy task', task);
              if (task && task.list && task.list.folder) {
                const url = `/spaces/${task.list.folder.space_id}/folders/${task.list.folder.id}/lists/${task.list.id}?openTask=${task.id}`;
                console.log('Header: Redirecting to', url);
                this.router.navigateByUrl(url);
              } else {
                console.warn('Could not resolve context for task:', taskId, task);
                // Fallback: try direct navigation if backend supports simple view? No, we need context.
                alert('Não foi possível localizar o contexto desta tarefa antiga.');
              }
            },
            error: (err) => console.error('Error resolving task link:', err)
          });
        }
      } else {
        console.log('Header: Direct navigation to', notification.link);
        this.router.navigateByUrl(notification.link);
      }
      this.showNotifications = false;
    }
  }

  markAllRead() {
    this.dataService.markAllNotificationsAsRead().subscribe(() => {
      this.notifications.update(notes => notes.map(n => ({ ...n, read: true })));
    });
  }

  private getPageTitle(url: string): string {
    if (url.startsWith('/my-tasks')) return 'Minhas Tarefas';
    if (url.startsWith('/spaces')) return 'Espaços';
    if (url.startsWith('/team')) return 'Equipe';
    if (url.startsWith('/companies')) return 'Empresas';
    if (url.startsWith('/users')) return 'Usuários';
    if (url.startsWith('/settings')) return 'Configurações';
    if (url.startsWith('/dashboard')) return 'Dashboard';
    return 'Kamban';
  }
}
