import { Component, EventEmitter, Output, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../../services/data.service';

@Component({
  selector: 'app-add-member-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h2 class="text-lg font-bold text-gray-800">Adicionar Profissional</h2>
          <button (click)="close()" class="text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4">
          
          <!-- User Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Profissional</label>
            <div class="relative">
                <select [(ngModel)]="selectedUserId" 
                        class="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all appearance-none text-gray-700">
                    <option value="" disabled selected>Selecione um profissional</option>
                    <option *ngFor="let user of availableUsers()" [value]="user.id">
                        {{ user.name }} ({{ user.email }})
                    </option>
                </select>
                 <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                    <i class="fas fa-chevron-down text-xs"></i>
                </div>
            </div>
             <p *ngIf="users().length === 0" class="text-xs text-amber-600 mt-1">
                <i class="fas fa-exclamation-triangle mr-1"></i> Carregando lista de usuários...
            </p>
          </div>

          <!-- Role Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Função / Cargo</label>
             <div class="relative">
                <select [(ngModel)]="selectedRole" 
                        class="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all appearance-none text-gray-700">
                    <option value="member">Membro</option>
                    <option value="admin">Administrador</option>
                    <option value="manager">Gerente</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                    <i class="fas fa-chevron-down text-xs"></i>
                </div>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button (click)="close()" 
                  class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            Cancelar
          </button>
          <button (click)="save()" 
                  [disabled]="!isValid()"
                  [class.opacity-50]="!isValid()"
                  class="px-4 py-2 text-sm font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-lg shadow-md transition-all flex items-center">
             <i class="fas fa-user-plus mr-2"></i> Adicionar
          </button>
        </div>

      </div>
    </div>
  `
})
export class AddMemberDialogComponent implements OnInit {
  @Input() existingMemberIds: string[] = [];
  @Output() closeDialog = new EventEmitter<void>();
  @Output() addMember = new EventEmitter<{ userId: string, role: string }>();

  users = signal<any[]>([]);
  selectedUserId = '';
  selectedRole = 'member';

  constructor(private dataService: DataService) { }

  ngOnInit() {
    console.log('AddMemberDialogComponent initialized');
    this.loadUsers();
  }

  loadUsers() {
    this.dataService.getDirectory().subscribe({
      next: (data) => {
        this.users.set(data);
      },
      error: (err) => console.error('Error loading users', err)
    });
  }

  availableUsers() {
    // Filter out users who are already members
    return this.users().filter(u => !this.existingMemberIds.includes(u.id));
  }

  close() {
    this.closeDialog.emit();
  }

  save() {
    if (this.isValid()) {
      this.addMember.emit({
        userId: this.selectedUserId,
        role: this.selectedRole
      });
    }
  }

  isValid() {
    return !!this.selectedUserId && !!this.selectedRole;
  }
}
