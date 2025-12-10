import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  users = signal<any[]>([]);
  isLoading = signal<boolean>(false);

  // Pagination
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  paginatedUsers = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return this.users().slice(startIndex, startIndex + this.pageSize());
  });

  totalPages = computed(() => Math.ceil(this.users().length / this.pageSize()));

  // Edit Role State
  editingUserId = signal<string | null>(null);
  selectedRole = signal<string>('gestor');

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.loadUsers();
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  loadUsers() {
    this.isLoading.set(true);
    this.dataService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.isLoading.set(false);
      }
    });
  }

  startEditRole(user: any) {
    this.editingUserId.set(user.id);
    this.selectedRole.set(user.role);
  }

  cancelEditRole() {
    this.editingUserId.set(null);
  }

  saveRole(userId: string) {
    const role = this.selectedRole();
    this.dataService.updateUser(userId, { role }).subscribe({
      next: () => {
        this.loadUsers();
        this.editingUserId.set(null);
      },
      error: (err) => console.error('Failed to update role', err)
    });
  }

  deleteUser(userId: string) {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      this.dataService.deleteUser(userId).subscribe({
        next: () => this.loadUsers(),
        error: (err) => console.error('Failed to delete user', err)
      });
    }
  }
}
