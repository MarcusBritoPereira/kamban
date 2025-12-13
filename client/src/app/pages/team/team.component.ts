import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-team',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    template: `
    <div class="h-full flex flex-col bg-gray-50 overflow-hidden">
      <!-- Header -->
      <div class="px-8 py-6 bg-white border-b border-gray-200 sticky top-0 z-10">
         <div class="flex items-center justify-between mb-4">
             <h1 class="text-2xl font-bold text-gray-900 tracking-tight font-display">Todas as pessoas</h1>
             <div class="flex gap-2 relative">
                 <button (click)="showExportDropdown = !showExportDropdown; showStatusDropdown = false" class="px-3 py-1.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center"
                    [class.border-pink-500]="showExportDropdown"
                    [class.text-pink-600]="showExportDropdown">
                    <i class="fas fa-file-export mr-2"></i> Exportar
                    <i class="fas fa-chevron-down ml-2 text-[10px] transition-transform" [class.rotate-180]="showExportDropdown"></i>
                 </button>

                 <!-- Export Dropdown -->
                 <div *ngIf="showExportDropdown" class="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-fadeIn">
                     <div class="py-1">
                         <div class="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                             Formato
                         </div>
                         <button (click)="exportToCSV(); showExportDropdown = false" class="w-full px-4 py-2 flex items-center text-sm hover:bg-gray-50 text-gray-700 group transition-colors">
                             <div class="w-8 h-8 rounded bg-green-50 flex items-center justify-center mr-3 text-green-600 group-hover:bg-green-100 transition-colors">
                                 <i class="fas fa-file-csv"></i>
                             </div>
                             <span>CSV</span>
                         </button>
                         <button (click)="exportToJSON(); showExportDropdown = false" class="w-full px-4 py-2 flex items-center text-sm hover:bg-gray-50 text-gray-700 group transition-colors">
                            <div class="w-8 h-8 rounded bg-yellow-50 flex items-center justify-center mr-3 text-yellow-600 group-hover:bg-yellow-100 transition-colors">
                                <i class="fas fa-file-code"></i>
                            </div>
                            <span>JSON</span>
                        </button>
                     </div>
                 </div>

                 <button class="px-4 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded text-sm font-bold shadow-md transition-all">
                    Convidar
                 </button>
             </div>
         </div>
         
         <!-- Search & Filters -->
         <div class="flex flex-col gap-4">
            <div class="relative">
                <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input type="text" [(ngModel)]="searchTerm"
                     placeholder="Pesquisar" class="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-500 transition-colors shadow-sm">
            </div>
            
            <div class="flex items-center justify-between">
                <div class="flex gap-2 relative">
                    <!-- Status Button -->
                    <button (click)="showStatusDropdown = !showStatusDropdown" 
                         class="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center transition-colors"
                         [class.border-pink-500]="showStatusDropdown || statusFilter() !== 'all'"
                         [class.text-pink-600]="showStatusDropdown || statusFilter() !== 'all'">
                        Status 
                        <span *ngIf="statusFilter() !== 'all'" class="ml-1 text-[10px] font-bold">({{ statusFilter() === 'online' ? 'On' : 'Off' }})</span>
                        <i class="fas fa-chevron-down ml-1 text-[10px] transition-transform" [class.rotate-180]="showStatusDropdown"></i>
                    </button>

                    <!-- Status Dropdown -->
                    <div *ngIf="showStatusDropdown" class="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-fadeIn">
                        <div class="py-1">
                            <button (click)="setStatusFilter('all')" class="w-full px-4 py-2 flex items-center justify-between text-sm hover:bg-gray-50 group border-b border-gray-100">
                                <div class="flex items-center">
                                    <i *ngIf="statusFilter() === 'all'" class="fas fa-check text-pink-600 mr-2 text-xs"></i>
                                    <span [class.ml-5]="statusFilter() !== 'all'" [class.text-pink-600]="statusFilter() === 'all'" class="text-gray-700 font-medium">Todos</span>
                                </div>
                                <span class="text-xs text-gray-400 font-normal">{{ totalCount }}</span>
                            </button>
                            
                            <button (click)="setStatusFilter('online')" class="w-full px-4 py-2 flex items-center justify-between text-sm hover:bg-gray-50 group">
                                <div class="flex items-center">
                                    <i *ngIf="statusFilter() === 'online'" class="fas fa-check text-pink-600 mr-2 text-xs"></i>
                                    <span [class.ml-5]="statusFilter() !== 'online'" [class.text-pink-600]="statusFilter() === 'online'" class="text-gray-700">On-line</span>
                                </div>
                                <span class="text-xs text-gray-400 font-normal">{{ onlineCount }}</span>
                            </button>

                            <button (click)="setStatusFilter('offline')" class="w-full px-4 py-2 flex items-center justify-between text-sm hover:bg-gray-50 group">
                                <div class="flex items-center">
                                    <i *ngIf="statusFilter() === 'offline'" class="fas fa-check text-pink-600 mr-2 text-xs"></i>
                                    <span [class.ml-5]="statusFilter() !== 'offline'" [class.text-pink-600]="statusFilter() === 'offline'" class="text-gray-700">Off-line</span>
                                </div>
                                <span class="text-xs text-gray-400 font-normal">{{ offlineCount }}</span>
                            </button>
                        </div>
                    </div>

                    <!-- Backdrop for Dropdown -->
                    <div *ngIf="showStatusDropdown" (click)="showStatusDropdown = false" class="fixed inset-0 z-40 cursor-default"></div>

                    <button class="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center">
                        Equipe <i class="fas fa-chevron-down ml-1 text-[10px]"></i>
                    </button>
                    <button class="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center">
                        Tipo de conta <i class="fas fa-chevron-down ml-1 text-[10px]"></i>
                    </button>
                </div>
                
                <div class="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                    <button (click)="setView('list')" 
                        class="p-1.5 rounded transition-all flex items-center justify-center w-8 h-8"
                        [ngClass]="viewMode() === 'list' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500 hover:text-gray-800'">
                        <i class="fas fa-list"></i>
                    </button>
                    <button (click)="setView('grid')" 
                        class="p-1.5 rounded transition-all flex items-center justify-center w-8 h-8"
                        [ngClass]="viewMode() === 'grid' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500 hover:text-gray-800'">
                        <i class="fas fa-th-large"></i>
                    </button>
                </div>
            </div>
         </div>
      </div>

      <!-- Content Grid/List -->
      <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div *ngIf="isLoading()" class="flex justify-center py-20">
             <i class="fas fa-circle-notch fa-spin text-4xl text-pink-500"></i>
          </div>

          <ng-container *ngIf="!isLoading()">
            
            <!-- GRID VIEW -->
            <div *ngIf="viewMode() === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
                <div *ngFor="let user of filteredUsers()" [routerLink]="['/team', user.id]" 
                    class="bg-white rounded-xl border border-gray-200 p-0 hover:shadow-lg hover:border-pink-200 transition-all cursor-pointer group flex flex-col h-[280px]">
                    
                    <!-- Avatar Area -->
                    <div class="h-40 bg-indigo-600 relative overflow-hidden flex items-center justify-center rounded-t-xl group-hover:bg-indigo-700 transition-colors">
                        <!-- If Avatar Image -->
                        <img *ngIf="user.avatar_url" [src]="'http://localhost:3000' + user.avatar_url" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100">
                        
                        <!-- If No Avatar (Initials) -->
                        <div *ngIf="!user.avatar_url" class="text-white text-6xl font-bold tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity">
                            {{ getInitials(user.name) }}
                        </div>
                    </div>

                    <!-- Info -->
                    <div class="p-4 flex-1 flex flex-col justify-between">
                        <div>
                            <h3 class="font-bold text-gray-900 text-lg group-hover:text-pink-600 transition-colors truncate">{{ user.name }}</h3>
                            <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
                        </div>
                        
                        <div class="flex items-center justify-between mt-4">
                            <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 uppercase border border-gray-200">
                                {{ user.role }}
                            </span>
                            <!-- Online Status Indicator -->
                            <div class="w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm"
                                 [ngClass]="user.isOnline ? 'bg-green-500' : 'bg-gray-300'"
                                 [title]="user.isOnline ? 'Online' : 'Offline'"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- LIST VIEW -->
            <div *ngIf="viewMode() === 'list'" class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-fadeIn">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nome</th>
                            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Função</th>
                            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Status</th>
                            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr *ngFor="let user of filteredUsers()" [routerLink]="['/team', user.id]" 
                            class="hover:bg-gray-50 transition-colors cursor-pointer group">
                            <!-- Name & Avatar -->
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm mr-4 overflow-hidden shrink-0 border border-gray-200">
                                         <img *ngIf="user.avatar_url" [src]="'http://localhost:3000' + user.avatar_url" class="w-full h-full object-cover">
                                         <span *ngIf="!user.avatar_url">{{ getInitials(user.name) }}</span>
                                    </div>
                                    <span class="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">{{ user.name }}</span>
                                </div>
                            </td>
                            <!-- Email -->
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ user.email }}
                            </td>
                            <!-- Role -->
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 uppercase border border-gray-200">
                                    {{ user.role }}
                                </span>
                            </td>
                            <!-- Status -->
                            <td class="px-6 py-4 whitespace-nowrap text-right">
                                <span class="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border"
                                      [ngClass]="user.isOnline ? 'text-green-600 bg-green-50 border-green-100' : 'text-gray-600 bg-gray-50 border-gray-200'">
                                    <div class="w-1.5 h-1.5 rounded-full mr-1.5"
                                         [ngClass]="user.isOnline ? 'bg-green-500' : 'bg-gray-400'"></div>
                                    {{ user.isOnline ? 'Online' : 'Offline' }}
                                </span>
                            </td>
                             <!-- Actions -->
                             <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button class="text-gray-400 group-hover:text-pink-600 transition-colors p-2 hover:bg-white rounded-full">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

          </ng-container>
          
           <div *ngIf="!isLoading() && filteredUsers().length === 0" class="text-center py-20">
                <p class="text-gray-400 text-lg">Nenhum membro encontrado.</p>
           </div>
      </div>
    </div>
  `
})
export class TeamComponent implements OnInit {
    users = signal<any[]>([]);
    isLoading = signal<boolean>(false);
    searchTerm = '';
    viewMode = signal<'grid' | 'list'>('grid'); // Default to grid

    // Status Filter    // Filters
    statusFilter = signal<'all' | 'online' | 'offline'>('all');
    showStatusDropdown = false;
    showExportDropdown = false;

    constructor(private dataService: DataService) { }

    ngOnInit() {
        this.isLoading.set(true);
        this.dataService.getUsers().subscribe({
            next: (data) => {
                // Mock online status for demo
                const usersWithStatus = data.map(u => ({
                    ...u,
                    isOnline: Math.random() > 0.5
                }));
                this.users.set(usersWithStatus);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error(err);
                this.isLoading.set(false);
            }
        });
    }

    filteredUsers() {
        let result = this.users();

        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            result = result.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
        }

        if (this.statusFilter() !== 'all') {
            const isOnline = this.statusFilter() === 'online';
            result = result.filter(u => u.isOnline === isOnline);
        }

        return result;
    }

    // Counts
    get totalCount() { return this.users().length; }
    get onlineCount() { return this.users().filter(u => u.isOnline).length; }
    get offlineCount() { return this.users().filter(u => !u.isOnline).length; }

    setStatusFilter(status: 'all' | 'online' | 'offline') {
        this.statusFilter.set(status);
        this.showStatusDropdown = false;
    }

    getInitials(name: string): string {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    setView(mode: 'grid' | 'list') {
        this.viewMode.set(mode);
    }

    exportToCSV() {
        const data = this.filteredUsers().map(user => ({
            Nome: user.name,
            Email: user.email,
            Funcao: user.role,
            Status: user.isOnline ? 'Online' : 'Offline'
        }));

        if (data.length === 0) return;

        const headers = Object.keys(data[0]).join(',');
        const csvContent = [
            headers,
            ...data.map(row => Object.values(row).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', 'equipe_export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    exportToJSON() {
        const data = this.filteredUsers().map(user => ({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.isOnline ? 'online' : 'offline',
            id: user.id
        }));

        if (data.length === 0) return;

        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', 'equipe_export.json');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
