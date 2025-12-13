import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DataService, Task } from '../../../services/data.service';

interface TaskGroup {
    title: string;
    tasks: Task[];
    color: string;
    icon: string;
    isOpen: boolean;
}

@Component({
    selector: 'app-member-profile',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="h-full flex flex-col bg-white overflow-hidden">
       <!-- Header -->
       <div class="px-8 py-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
           <div class="flex items-center gap-4">
               <!-- Avatar -->
               <div class="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden shadow-md">
                   <img *ngIf="user?.avatar_url" [src]="'http://localhost:3000' + user.avatar_url" class="w-full h-full object-cover">
                   <span *ngIf="!user?.avatar_url">{{ getInitials(user?.name) }}</span>
               </div>
               
               <div>
                   <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ user?.name || 'Carregando...' }}</h1>
                   <div class="flex items-center gap-2 text-sm text-gray-500">
                       <span class="w-2 h-2 rounded-full bg-green-500"></span>
                       <span>On-line</span>
                       <span class="text-gray-300">•</span>
                       <span class="uppercase font-medium text-xs bg-gray-100 px-2 py-0.5 rounded">{{ user?.role }}</span>
                   </div>
               </div>
           </div>
           
           <button class="text-gray-400 hover:text-gray-600 text-sm font-medium flex items-center">
               <i class="fas fa-cog mr-2"></i> Faça uma pergunta
           </button>
       </div>

       <!-- Tabs -->
       <div class="px-8 border-b border-gray-200 flex items-center gap-8 bg-white">
           <button class="py-4 text-sm font-medium text-gray-500 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-200 transition-colors">Chat</button>
           <button class="py-4 text-sm font-medium text-gray-500 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-200 transition-colors">Calendário</button>
           <button class="py-4 text-sm font-bold text-gray-900 border-b-2 border-gray-900">Tarefas atribuídas a {{ parseFirstName(user?.name) }}</button>
       </div>

       <!-- Toolbar -->
       <div class="px-8 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
           <div class="flex items-center gap-2 overflow-x-auto">
               <button class="px-3 py-1.5 bg-pink-100 text-pink-700 rounded-full text-xs font-bold flex items-center border border-pink-200">
                   <i class="fas fa-calendar-alt mr-2"></i> Data de vencimento
               </button>
               <button class="px-3 py-1.5 bg-white text-gray-600 rounded-full text-xs font-medium border border-gray-200 hover:bg-gray-50 transition-colors flex items-center">
                   <i class="fas fa-code-branch mr-2"></i> Subtarefas
               </button>
               <button class="px-3 py-1.5 bg-white text-gray-600 rounded-full text-xs font-medium border border-gray-200 hover:bg-gray-50 transition-colors flex items-center">
                   <i class="fas fa-columns mr-2"></i> Colunas
               </button>
           </div>
           
           <div class="flex items-center gap-2">
               <button class="px-3 py-1.5 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600 flex items-center">
                   <i class="fas fa-filter mr-2"></i> Filtro
               </button>
               <input type="text" placeholder="Pesquisar..." class="px-3 py-1.5 bg-white border border-gray-200 rounded text-xs w-48 focus:outline-none focus:border-pink-500">
           </div>
       </div>

       <!-- Tasks Content -->
       <div class="flex-1 overflow-y-auto custom-scrollbar bg-white p-8">
           <div *ngIf="isLoading" class="flex justify-center py-20">
                <i class="fas fa-circle-notch fa-spin text-4xl text-pink-500"></i>
           </div>

           <div *ngIf="!isLoading">
               <div *ngFor="let group of taskGroups" class="mb-8">
                   <!-- Group Header -->
                   <div (click)="group.isOpen = !group.isOpen" class="flex items-center gap-2 mb-4 cursor-pointer select-none group/header">
                       <i class="fas fa-caret-down text-gray-400 transition-transform" [class.-rotate-90]="!group.isOpen"></i>
                       <span [class]="'text-sm font-bold ' + group.color">{{ group.title }}</span>
                       <span class="text-xs text-gray-400 font-medium">{{ group.tasks.length }}</span>
                       
                       <div class="h-px bg-gray-100 flex-1 ml-2 group-hover/header:bg-gray-200 transition-colors"></div>
                       <button class="text-gray-300 hover:text-gray-600 text-xs flex items-center ml-2 opacity-0 group-hover/header:opacity-100 transition-opacity">
                           <i class="fas fa-plus mr-1"></i> Adicionar Tarefa
                       </button>
                   </div>

                   <!-- Tasks List -->
                   <div *ngIf="group.isOpen" class="space-y-1">
                       <div *ngFor="let task of group.tasks" class="group flex items-center py-2 px-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-100 transition-all cursor-pointer">
                           <!-- Status Icon -->
                           <div class="w-8 shrink-0 flex justify-center">
                                <i [class]="getStatusIcon(task.status) + ' text-xs'"></i>
                           </div>

                           <!-- Title & Tags -->
                           <div class="flex-1 min-w-0 pr-4 flex items-center gap-3">
                               <span class="text-sm font-medium text-gray-700 truncate">{{ task.title }}</span>
                               
                               <!-- Tags -->
                               <div class="flex gap-1">
                                   <div *ngFor="let t of task.tags?.slice(0, 2)" class="px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider"
                                        [style.background-color]="t.tag.color">
                                       {{ t.tag.name }}
                                   </div>
                                    <div *ngFor="let t of (task.tags || [])" class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500 border border-gray-200"
                                        [class.hidden]="true"> <!-- Placeholder for logic to show +N tags if needed -->
                                   </div>
                               </div>
                           </div>
                           
                           <!-- Space/Project Context (Optional) -->
                           <div class="hidden md:block w-32 shrink-0 text-xs text-gray-400 truncate text-right mr-4" title="Nome do Projeto">
                                {{ task.list?.folder?.name || '...' }}
                           </div>

                           <!-- Priority -->
                           <div class="w-24 shrink-0 flex items-center">
                               <i class="fas fa-flag text-xs mr-2" [ngClass]="getPriorityColor(task.priority)"></i>
                               <span class="text-xs text-gray-500 capitalize">{{ getPriorityLabel(task.priority) }}</span>
                           </div>

                           <!-- Due Date -->
                           <div class="w-32 shrink-0 text-right">
                               <span [class]="getDueDateColor(task.deadline, group.title)">{{ formatDueDate(task.deadline) }}</span>
                           </div>
                           
                           <!-- Actions -->
                           <div class="w-8 shrink-0 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                               <button class="text-gray-400 hover:text-gray-600"><i class="fas fa-ellipsis-h"></i></button>
                           </div>
                       </div>
                   </div>
               </div>
               
               <div *ngIf="hasNoTasks()" class="text-center py-20 text-gray-400">
                   Este usuário não tem tarefas atribuídas pendentes.
               </div>
           </div>
       </div>
    </div>
  `
})
export class MemberProfileComponent implements OnInit {
    userId: string | null = null;
    user: any = null;
    isLoading = false;

    tasks: Task[] = []; // Typed
    taskGroups: TaskGroup[] = [];

    constructor(
        private route: ActivatedRoute,
        private dataService: DataService
    ) { }

    hasNoTasks(): boolean {
        return this.taskGroups.every(g => g.tasks.length === 0);
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.userId = params.get('userId');
            if (this.userId) {
                this.loadProfile(this.userId);
            }
        });
    }

    loadProfile(id: string) {
        this.isLoading = true;
        // Fetch User Details
        this.dataService.getUsers().subscribe(users => {
            this.user = users.find(u => u.id === id);
        });

        // Fetch Tasks
        this.dataService.getUserTasks(id).subscribe({
            next: (res) => {
                this.tasks = res.data;
                this.groupTasks();
                this.isLoading = false;
            },
            error: (err) => {
                console.error(err);
                this.isLoading = false;
            }
        });
    }

    groupTasks() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const groups = {
            overdue: [] as any[],
            today: [] as any[],
            upcoming: [] as any[],
            noDate: [] as any[]
        };

        this.tasks.forEach(task => {
            if (task.status === 'done') return; // Skip done tasks for now

            if (!task.deadline) {
                groups.noDate.push(task);
                return;
            }

            const dueDate = new Date(task.deadline);
            dueDate.setHours(0, 0, 0, 0);

            if (dueDate < today) {
                groups.overdue.push(task);
            } else if (dueDate.getTime() === today.getTime()) {
                groups.today.push(task);
            } else {
                groups.upcoming.push(task);
            }
        });

        this.taskGroups = [
            { title: 'Em atraso', tasks: groups.overdue, color: 'text-red-500', icon: 'fas fa-exclamation-circle', isOpen: true },
            { title: 'Hoje', tasks: groups.today, color: 'text-green-500', icon: 'fas fa-calendar-day', isOpen: true },
            { title: 'Próximos dias', tasks: groups.upcoming, color: 'text-gray-900', icon: 'fas fa-calendar-alt', isOpen: true },
            { title: 'Sem prazo', tasks: groups.noDate, color: 'text-gray-500', icon: 'far fa-calendar', isOpen: false },
        ].filter(g => g.tasks.length > 0);
    }

    // Helpers
    getInitials(name: string): string {
        if (!name) return '??';
        return name.charAt(0).toUpperCase();
    }

    parseFirstName(name: string): string {
        if (!name) return '...';
        return name.split(' ')[0];
    }

    getStatusIcon(status: string): string {
        switch (status) {
            case 'todo': return 'far fa-circle text-gray-400';
            case 'planned': return 'far fa-circle text-indigo-500';
            case 'doing': return 'far fa-circle text-yellow-500';
            case 'in_review': return 'far fa-circle text-pink-500';
            case 'approved': return 'fas fa-check-circle text-teal-600';
            case 'rejected': return 'fas fa-times-circle text-red-600';
            case 'waiting': return 'fas fa-clock text-amber-700';
            case 'done': return 'fas fa-check-circle text-green-600';
            default: return 'far fa-circle text-gray-400';
        }
    }

    getPriorityColor(priority: string | undefined): string {
        switch (priority) {
            case 'urgent': return 'text-red-500';
            case 'high': return 'text-yellow-500';
            case 'normal': return 'text-blue-500';
            case 'low': return 'text-gray-400';
            default: return 'text-blue-500';
        }
    }

    getPriorityLabel(priority: string | undefined): string {
        const labels: any = { urgent: 'Urgente', high: 'Alta', normal: 'Normal', low: 'Baixa' };
        return labels[priority || 'normal'] || 'Normal';
    }

    formatDueDate(dateStr: string | undefined): string {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Simple format
        const d = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });

        if (date.setHours(0, 0, 0, 0) === today.getTime()) return 'Hoje';
        if (date.setHours(0, 0, 0, 0) === tomorrow.getTime()) return 'Amanhã';

        const diffTime = today.getTime() - date.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 0 && diffDays < 7) return `${diffDays} dias atrás`;

        return d;
    }

    getDueDateColor(dateStr: string | undefined, groupTitle: string): string {
        if (groupTitle === 'Em atraso') return 'text-red-500 font-bold';
        if (groupTitle === 'Hoje') return 'text-orange-500 font-bold';
        return 'text-gray-500';
    }
}
