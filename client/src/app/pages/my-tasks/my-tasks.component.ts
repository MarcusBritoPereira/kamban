import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Task } from '../../services/data.service';
import { RouterModule } from '@angular/router';
import { TaskTableComponent } from '../../components/task-table/task-table.component';
import { KanbanBoardComponent } from '../../components/kanban-board/kanban-board.component';
import { TaskCalendarComponent } from '../../components/task-calendar/task-calendar.component';
import { CreateTaskDialogComponent } from '../../components/dialogs/create-task-dialog/create-task-dialog.component';

type ViewMode = 'list' | 'board' | 'calendar';

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule, RouterModule, TaskTableComponent, KanbanBoardComponent, TaskCalendarComponent, CreateTaskDialogComponent],
  template: `
    <div class="h-full flex flex-col bg-gray-50">
      <!-- Header -->
      <div class="px-8 py-6 bg-white border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-10 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight font-display">Minhas Tarefas</h1>
          <p class="text-gray-500 text-sm mt-1">Tarefas para você</p>
        </div>

        <div class="flex items-center gap-4">
            <button *ngIf="hasSpaces(); else createSpaceCta" (click)="openCreateTaskDialog()" 
                class="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center">
                <i class="fas fa-plus mr-2"></i> Nova Tarefa
            </button>
            <ng-template #createSpaceCta>
              <a routerLink="/spaces"
                class="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center">
                <i class="fas fa-rocket mr-2"></i> Criar Espaço
              </a>
            </ng-template>

            <!-- View Switcher -->
            <div class="flex bg-gray-100 p-1 rounded-lg">
            <button (click)="viewMode = 'list'"
                [class.bg-white]="viewMode === 'list'"
                [class.shadow-sm]="viewMode === 'list'"
                [class.text-pink-600]="viewMode === 'list'"
                class="px-4 py-2 rounded-md text-sm font-medium text-gray-600 transition-all flex items-center">
                <i class="fas fa-list mr-2"></i> Lista
            </button>
            <button (click)="viewMode = 'board'"
                [class.bg-white]="viewMode === 'board'"
                [class.shadow-sm]="viewMode === 'board'"
                [class.text-pink-600]="viewMode === 'board'"
                class="px-4 py-2 rounded-md text-sm font-medium text-gray-600 transition-all flex items-center">
                <i class="fas fa-columns mr-2"></i> Quadro
            </button>
            <button (click)="viewMode = 'calendar'"
                [class.bg-white]="viewMode === 'calendar'"
                [class.shadow-sm]="viewMode === 'calendar'"
                [class.text-pink-600]="viewMode === 'calendar'"
                class="px-4 py-2 rounded-md text-sm font-medium text-gray-600 transition-all flex items-center">
                <i class="fas fa-calendar mr-2"></i> Calendário
            </button>
            </div>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-hidden p-0 md:p-8">
        <div *ngIf="tasks.length > 0 || viewMode === 'calendar'; else emptyState" class="h-full flex flex-col">
          <!-- List View -->
          <ng-container *ngIf="viewMode === 'list'">
            <app-task-table [tasks]="tasks" (taskClick)="onTaskClick($event)" (addTask)="openCreateTaskDialog()"></app-task-table>
          </ng-container>

          <!-- Board View -->
          <ng-container *ngIf="viewMode === 'board'">
            <div class="h-full overflow-x-auto">
              <app-kanban-board [tasks]="tasks" (taskClick)="onTaskClick($event)"></app-kanban-board>
            </div>
          </ng-container>

          <!-- Calendar View -->
          <ng-container *ngIf="viewMode === 'calendar'">
            <div class="h-full overflow-hidden">
                <app-task-calendar 
                    [tasks]="tasks" 
                    (taskClick)="onTaskClick($event)"
                    (dateClick)="onCalendarDateClick($event)"
                    (taskDrop)="onTaskDrop($event)">
                </app-task-calendar>
            </div>
          </ng-container>
        </div>

        <!-- Load More / Pagination (Only for List/Board) -->
        <div *ngIf="hasMore && viewMode !== 'calendar'" class="p-4 flex justify-center border-t border-gray-100">
          <button (click)="loadMore()" [disabled]="isLoading"
            class="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-md text-sm font-medium transition-colors border border-gray-200 disabled:opacity-50">
            <i *ngIf="isLoading" class="fas fa-spinner fa-spin mr-2"></i>
            {{ isLoading ? 'Carregando...' : 'Carregar Mais' }}
          </button>
        </div>

        <ng-template #emptyState>
          <div class="flex flex-col items-center justify-center h-full text-gray-400">
            <ng-container *ngIf="hasSpaces(); else noWorkspaceState">
              <i class="fas fa-check-circle text-6xl mb-4 text-gray-300"></i>
              <p class="text-lg font-medium">Você não tem tarefas atribuídas.</p>
              <p class="text-sm text-gray-400 mt-1 max-w-md text-center">Crie uma tarefa em uma lista existente ou aguarde uma atribuição da sua equipe.</p>
              <div class="mt-4">
              <button (click)="openCreateTaskDialog()" class="text-pink-600 hover:text-pink-700 font-medium text-sm flex items-center">
                <i class="fas fa-plus mr-2"></i> Criar uma tarefa
              </button>
              </div>
            </ng-container>

            <ng-template #noWorkspaceState>
              <i class="fas fa-rocket text-6xl mb-4 text-gray-300"></i>
              <p class="text-lg font-semibold text-gray-600">Comece criando seu primeiro espaço.</p>
              <p class="text-sm text-gray-400 mt-2 max-w-md text-center">
                Antes de criar tarefas, você precisa de um espaço com pastas e listas para organizar o trabalho.
              </p>
              <a routerLink="/spaces"
                class="mt-5 bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center">
                <i class="fas fa-plus mr-2"></i> Criar primeiro espaço
              </a>
            </ng-template>
          </div>
        </ng-template>
      </div>

      <!-- Edit Task Dialog (Reused) -->
      <app-create-task-dialog *ngIf="selectedTask"
        [task]="selectedTask"
        [listId]="selectedTask.list_id"
        [spaceId]="getSpaceId(selectedTask)"
        [listName]="selectedTask.list?.name || 'Lista'"
        (created)="loadTasks()"
        (close)="closeTaskDialog()">
      </app-create-task-dialog>

      <!-- Create New Task Dialog -->
      <app-create-task-dialog *ngIf="showCreateTaskDialog"
        [initialDate]="initialDialogDate"
        (created)="loadTasks(); showCreateTaskDialog = false; initialDialogDate = null"
        (close)="showCreateTaskDialog = false; initialDialogDate = null">
      </app-create-task-dialog>
    </div>
  `
})
export class MyTasksComponent implements OnInit {
  tasks: any[] = [];
  spaces = this.dataService.spaces;
  selectedTask: any = null;
  viewMode: ViewMode = 'list';
  initialDialogDate: Date | null = null;

  // Pagination State
  page = 1;
  limit = 50;
  total = 0;
  isLoading = false;
  hasMore = false;
  showCreateTaskDialog = false;

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.dataService.getSpaces().subscribe();
    this.loadTasks();
  }

  hasSpaces(): boolean {
    return this.spaces().length > 0;
  }

  loadTasks(reset: boolean = true) {
    if (reset) {
      this.page = 1;
      this.tasks = [];
    }

    this.isLoading = true;
    const currentLimit = this.viewMode === 'calendar' ? 1000 : this.limit;

    this.dataService.getMyTasks(this.page, currentLimit).subscribe({
      next: (res) => {
        if (reset) {
          this.tasks = res.data;
        } else {
          this.tasks = [...this.tasks, ...res.data];
        }
        this.total = res.meta.total;
        this.hasMore = this.page < res.meta.lastPage;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading my tasks:', err);
        this.isLoading = false;
      }
    });
  }

  loadMore() {
    if (!this.isLoading && this.hasMore) {
      this.page++;
      this.loadTasks(false);
    }
  }

  onTaskClick(task: any) {
    this.selectedTask = task;
  }

  closeTaskDialog() {
    this.selectedTask = null;
    this.loadTasks();
  }

  openCreateTaskDialog() {
    this.showCreateTaskDialog = true;
  }

  onCalendarDateClick(date: Date) {
    this.initialDialogDate = date;
    this.showCreateTaskDialog = true;
  }

  onTaskDrop(event: { task: any, newDate: Date }) {
    // Optimistic Update
    const index = this.tasks.findIndex(t => t.id === event.task.id);
    if (index !== -1) {
      // Create new object to trigger change detection in component
      const updatedTask = { ...this.tasks[index], deadline: event.newDate };
      this.tasks[index] = updatedTask;
      this.tasks = [...this.tasks];
    }

    this.dataService.updateTask(event.task.id, { deadline: event.newDate }).subscribe({
      error: (err) => {
        console.error('Error rescheduling task', err);
        // Revert if needed?
      }
    });
  }

  getSpaceId(task: any): string {
    return task.list?.folder?.space_id || '';
  }
}
