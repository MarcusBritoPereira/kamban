import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Task } from '../../services/data.service';
import { Router, RouterModule } from '@angular/router';
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
    <div class="h-full min-h-full bg-gray-50">

      <!-- ====================================================== -->
      <!-- MOBILE - visível somente abaixo de 768px               -->
      <!-- ====================================================== -->
      <div class="md:hidden min-h-screen bg-gray-50 pb-28">

        <!-- Cabeçalho mobile -->
        <section class="mobile-top">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 tracking-tight">
              Minhas Tarefas
            </h1>

            <p class="text-gray-500 text-sm mt-1">
              Tarefas para você
            </p>
          </div>

          <button
            *ngIf="hasSpaces(); else mobileCreateSpace"
            type="button"
            (click)="openCreateTaskDialog()"
            class="mobile-primary-button">
            <i class="fas fa-plus"></i>
            <span>Nova Tarefa</span>
          </button>

          <ng-template #mobileCreateSpace>
            <a
              routerLink="/spaces"
              class="mobile-primary-button">
              <i class="fas fa-plus"></i>
              <span>Criar Espaço</span>
            </a>
          </ng-template>
        </section>

        <!-- Alternador de visualização -->
        <section class="px-4 mt-5">
          <div class="mobile-view-switcher">

            <button
              type="button"
              (click)="viewMode = 'list'"
              [class.mobile-view-active]="viewMode === 'list'">
              <i class="fas fa-list"></i>
              <span>Lista</span>
            </button>

            <button
              type="button"
              (click)="viewMode = 'board'"
              [class.mobile-view-active]="viewMode === 'board'">
              <i class="fas fa-columns"></i>
              <span>Quadro</span>
            </button>

            <button
              type="button"
              (click)="viewMode = 'calendar'"
              [class.mobile-view-active]="viewMode === 'calendar'">
              <i class="fas fa-calendar"></i>
              <span>Calendário</span>
            </button>

          </div>
        </section>

        <!-- Espaços -->
        <section
          *ngIf="hasSpaces()"
          class="mobile-section-card mx-4 mt-5">

          <div class="mobile-section-label">
            Espaços
          </div>

          <a
            routerLink="/spaces"
            class="mobile-space-row">

            <div class="mobile-space-icon">
              <i class="fas fa-layer-group"></i>
            </div>

            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-900 truncate">
                {{ getPrimarySpaceName() }}
              </div>

              <div class="text-xs text-gray-400 mt-0.5">
                Ver projetos e listas
              </div>
            </div>

            <i class="fas fa-chevron-right text-gray-400"></i>
          </a>
        </section>

        <!-- Lista mobile -->
        <section
          *ngIf="viewMode === 'list'"
          class="mobile-section-card mx-4 mt-5">

          <div class="mobile-task-group-header">
            <div class="flex items-center gap-3">
              <span>Pendentes</span>

              <span class="mobile-count-badge">
                {{ tasks.length }}
              </span>
            </div>

            <i class="fas fa-chevron-down text-gray-400"></i>
          </div>

          <!-- Carregamento -->
          <div
            *ngIf="isLoading && tasks.length === 0"
            class="py-14 flex flex-col items-center justify-center text-gray-400">

            <i class="fas fa-spinner fa-spin text-3xl text-pink-500"></i>

            <span class="mt-3 text-sm">
              Carregando tarefas...
            </span>
          </div>

          <!-- Cards das tarefas -->
          <div
            *ngIf="tasks.length > 0"
            class="space-y-3">

            <button
              *ngFor="let task of tasks"
              type="button"
              (click)="onTaskClick(task)"
              class="mobile-task-card">

              <div class="flex items-start gap-3">

                <div class="mobile-check">
                  <i
                    *ngIf="task.status === 'done'"
                    class="fas fa-check">
                  </i>
                </div>

                <div class="flex-1 min-w-0 text-left">

                  <div class="flex items-start justify-between gap-2">

                    <h3 class="mobile-task-title">
                      {{ task.title }}
                    </h3>

                    <i class="fas fa-ellipsis-v text-gray-400 mt-1"></i>
                  </div>

                  <div class="mobile-task-meta">

                    <div class="flex items-center min-w-0">

                      <div class="mobile-avatar">
                        {{ getTaskInitial(task) }}
                      </div>

                      <span class="truncate">
                        {{ getTaskAssigneeName(task) }}
                      </span>
                    </div>

                    <div
                      *ngIf="task.deadline"
                      class="mobile-deadline">

                      <i class="far fa-calendar-alt"></i>

                      {{ task.deadline | date:'dd/MM/yy' }}
                    </div>

                  </div>

                  <div class="mt-3 flex items-center justify-between">

                    <span
                      class="mobile-priority"
                      [ngClass]="getPriorityClass(task.priority)">

                      <i class="fas fa-flag"></i>

                      {{ getPriorityLabel(task.priority) }}
                    </span>

                    <span
                      class="text-xs text-gray-400 truncate max-w-[45%]">

                      {{ task.list?.name || 'Minha lista' }}
                    </span>

                  </div>

                </div>
              </div>
            </button>
          </div>

          <!-- Estado vazio -->
          <div
            *ngIf="!isLoading && tasks.length === 0"
            class="mobile-empty-state">

            <div class="mobile-empty-icon">
              <i class="fas fa-check"></i>
            </div>

            <h3 class="font-semibold text-gray-700">
              Nenhuma tarefa pendente
            </h3>

            <p class="text-sm text-gray-400 text-center mt-1">
              Suas novas tarefas aparecerão aqui.
            </p>
          </div>

          <button
            *ngIf="hasSpaces()"
            type="button"
            (click)="openCreateTaskDialog()"
            class="mobile-add-task">

            <i class="fas fa-plus"></i>

            Adicionar Tarefa
          </button>

        </section>

        <!-- Quadro mobile -->
        <section
          *ngIf="viewMode === 'board'"
          class="mt-5">

          <div class="overflow-x-auto px-4 pb-4">
            <div class="min-w-[900px]">
              <app-kanban-board
                [tasks]="tasks"
                (taskClick)="onTaskClick($event)">
              </app-kanban-board>
            </div>
          </div>
        </section>

        <!-- Calendário mobile -->
        <section
          *ngIf="viewMode === 'calendar'"
          class="px-4 mt-5">

          <div class="mobile-calendar-wrapper">
            <app-task-calendar
              [tasks]="tasks"
              (taskClick)="onTaskClick($event)"
              (dateClick)="onCalendarDateClick($event)"
              (taskDrop)="onTaskDrop($event)">
            </app-task-calendar>
          </div>
        </section>

        <!-- Carregar mais -->
        <div
          *ngIf="hasMore && viewMode !== 'calendar'"
          class="px-4 mt-4">

          <button
            type="button"
            (click)="loadMore()"
            [disabled]="isLoading"
            class="mobile-load-more">

            <i
              *ngIf="isLoading"
              class="fas fa-spinner fa-spin">
            </i>

            {{ isLoading ? 'Carregando...' : 'Carregar mais' }}
          </button>
        </div>

        <!-- Navegação inferior -->
        <nav class="mobile-bottom-navigation">

          <button
            type="button"
            (click)="viewMode = 'list'"
            [class.mobile-bottom-active]="viewMode === 'list'">

            <i class="fas fa-clipboard-list"></i>

            <span>Tarefas</span>
          </button>

          <button
            type="button"
            (click)="viewMode = 'board'"
            [class.mobile-bottom-active]="viewMode === 'board'">

            <i class="fas fa-columns"></i>

            <span>Quadro</span>
          </button>

          <button
            type="button"
            (click)="viewMode = 'calendar'"
            [class.mobile-bottom-active]="viewMode === 'calendar'">

            <i class="far fa-calendar-alt"></i>

            <span>Calendário</span>
          </button>

          <a routerLink="/spaces">

            <i class="far fa-folder-open"></i>

            <span>Espaços</span>
          </a>

        </nav>

      </div>

      <!-- ====================================================== -->
      <!-- DESKTOP - layout atual preservado                      -->
      <!-- ====================================================== -->
      <div class="hidden md:flex h-full flex-col bg-gray-50">

        <!-- Header -->
        <div class="px-8 py-6 bg-white border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-10 gap-4">

          <div>
            <h1 class="text-2xl font-bold text-gray-900 tracking-tight font-display">
              Minhas Tarefas
            </h1>

            <p class="text-gray-500 text-sm mt-1">
              Tarefas para você
            </p>
          </div>

          <div class="flex items-center gap-4">

            <button
              *ngIf="hasSpaces(); else desktopCreateSpace"
              (click)="openCreateTaskDialog()"
              class="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center">

              <i class="fas fa-plus mr-2"></i>

              Nova Tarefa
            </button>

            <ng-template #desktopCreateSpace>
              <a
                routerLink="/spaces"
                class="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center">

                <i class="fas fa-rocket mr-2"></i>

                Criar Espaço
              </a>
            </ng-template>

            <div class="flex bg-gray-100 p-1 rounded-lg">

              <button
                (click)="viewMode = 'list'"
                [class.bg-white]="viewMode === 'list'"
                [class.shadow-sm]="viewMode === 'list'"
                [class.text-pink-600]="viewMode === 'list'"
                class="px-4 py-2 rounded-md text-sm font-medium text-gray-600 transition-all flex items-center">

                <i class="fas fa-list mr-2"></i>

                Lista
              </button>

              <button
                (click)="viewMode = 'board'"
                [class.bg-white]="viewMode === 'board'"
                [class.shadow-sm]="viewMode === 'board'"
                [class.text-pink-600]="viewMode === 'board'"
                class="px-4 py-2 rounded-md text-sm font-medium text-gray-600 transition-all flex items-center">

                <i class="fas fa-columns mr-2"></i>

                Quadro
              </button>

              <button
                (click)="viewMode = 'calendar'"
                [class.bg-white]="viewMode === 'calendar'"
                [class.shadow-sm]="viewMode === 'calendar'"
                [class.text-pink-600]="viewMode === 'calendar'"
                class="px-4 py-2 rounded-md text-sm font-medium text-gray-600 transition-all flex items-center">

                <i class="fas fa-calendar mr-2"></i>

                Calendário
              </button>

            </div>
          </div>
        </div>

        <!-- Conteúdo desktop -->
        <div class="flex-1 overflow-hidden p-8">

          <div
            *ngIf="tasks.length > 0 || viewMode === 'calendar'; else desktopEmptyState"
            class="h-full flex flex-col">

            <ng-container *ngIf="viewMode === 'list'">
              <app-task-table
                [tasks]="tasks"
                (taskClick)="onTaskClick($event)"
                (addTask)="openCreateTaskDialog()">
              </app-task-table>
            </ng-container>

            <ng-container *ngIf="viewMode === 'board'">
              <div class="h-full overflow-x-auto">

                <app-kanban-board
                  [tasks]="tasks"
                  (taskClick)="onTaskClick($event)">
                </app-kanban-board>

              </div>
            </ng-container>

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

          <div
            *ngIf="hasMore && viewMode !== 'calendar'"
            class="p-4 flex justify-center border-t border-gray-100">

            <button
              (click)="loadMore()"
              [disabled]="isLoading"
              class="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-md text-sm font-medium transition-colors border border-gray-200 disabled:opacity-50">

              <i
                *ngIf="isLoading"
                class="fas fa-spinner fa-spin mr-2">
              </i>

              {{ isLoading ? 'Carregando...' : 'Carregar Mais' }}
            </button>
          </div>

          <ng-template #desktopEmptyState>

            <div class="flex flex-col items-center justify-center h-full text-gray-400">

              <ng-container *ngIf="hasSpaces(); else desktopNoWorkspace">

                <i class="fas fa-check-circle text-6xl mb-4 text-gray-300"></i>

                <p class="text-lg font-medium">
                  Você não tem tarefas atribuídas.
                </p>

                <p class="text-sm text-gray-400 mt-1 max-w-md text-center">
                  Crie uma tarefa em uma lista existente ou aguarde uma atribuição da sua equipe.
                </p>

                <button
                  (click)="openCreateTaskDialog()"
                  class="mt-4 text-pink-600 hover:text-pink-700 font-medium text-sm flex items-center">

                  <i class="fas fa-plus mr-2"></i>

                  Criar uma tarefa
                </button>

              </ng-container>

              <ng-template #desktopNoWorkspace>

                <i class="fas fa-rocket text-6xl mb-4 text-gray-300"></i>

                <p class="text-lg font-semibold text-gray-600">
                  Comece criando seu primeiro espaço.
                </p>

                <a
                  routerLink="/spaces"
                  class="mt-5 bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold">

                  Criar primeiro espaço
                </a>

              </ng-template>

            </div>
          </ng-template>
        </div>

      </div>

      <!-- Editar tarefa -->
      <app-create-task-dialog
        *ngIf="selectedTask"
        [task]="selectedTask"
        [listId]="selectedTask.list_id"
        [spaceId]="getSpaceId(selectedTask)"
        [listName]="selectedTask.list?.name || 'Lista'"
        (created)="loadTasks()"
        (close)="closeTaskDialog()">
      </app-create-task-dialog>

      <!-- Criar tarefa -->
      <app-create-task-dialog
        *ngIf="showCreateTaskDialog"
        [initialDate]="initialDialogDate"
        (created)="handleTaskCreated($event)"
        (close)="closeCreateTaskDialog()">
      </app-create-task-dialog>

    </div>
  `,
  styles: [`
    .mobile-top {
      padding: 24px 16px 0;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 14px;
    }

    .mobile-primary-button {
      min-height: 48px;
      padding: 0 16px;
      border-radius: 14px;
      background: linear-gradient(135deg, #db2777, #c026d3);
      color: white;
      font-size: 14px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      white-space: nowrap;
      box-shadow: 0 8px 20px rgba(219, 39, 119, 0.22);
    }

    .mobile-view-switcher {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      padding: 4px;
      background: #eef0f4;
      border-radius: 15px;
    }

    .mobile-view-switcher button {
      min-height: 48px;
      border-radius: 12px;
      color: #667085;
      font-size: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
    }

    .mobile-view-switcher button.mobile-view-active {
      background: white;
      color: #db2777;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
    }

    .mobile-section-card {
      background: white;
      border-radius: 18px;
      padding: 18px;
      box-shadow: 0 4px 18px rgba(15, 23, 42, 0.06);
      border: 1px solid #f1f3f6;
    }

    .mobile-section-label {
      color: #64748b;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 14px;
    }

    .mobile-space-row {
      min-height: 68px;
      display: flex;
      align-items: center;
      gap: 13px;
    }

    .mobile-space-icon {
      width: 42px;
      height: 42px;
      flex: 0 0 42px;
      border-radius: 12px;
      background: #f1f5f9;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .mobile-task-group-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #64748b;
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 15px;
    }

    .mobile-count-badge {
      min-width: 30px;
      height: 30px;
      padding: 0 9px;
      border-radius: 9px;
      background: #f1f3f6;
      color: #64748b;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .mobile-task-card {
      width: 100%;
      padding: 16px;
      border: 1px solid #edf0f4;
      border-radius: 16px;
      background: white;
      box-shadow: 0 3px 12px rgba(15, 23, 42, 0.04);
    }

    .mobile-task-card:active {
      transform: scale(0.99);
      background: #fafafa;
    }

    .mobile-check {
      width: 25px;
      height: 25px;
      flex: 0 0 25px;
      border-radius: 50%;
      border: 2px solid #d7dce4;
      color: white;
      background: #eef1f5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      margin-top: 1px;
    }

    .mobile-task-title {
      color: #111827;
      font-size: 15px;
      line-height: 1.35;
      font-weight: 700;
      padding-right: 4px;
    }

    .mobile-task-meta {
      margin-top: 13px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      color: #667085;
      font-size: 12px;
    }

    .mobile-avatar {
      width: 28px;
      height: 28px;
      flex: 0 0 28px;
      margin-right: 8px;
      border-radius: 50%;
      background: #e6e7ff;
      color: #4f46e5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 800;
    }

    .mobile-deadline {
      color: #16a34a;
      display: flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
    }

    .mobile-priority {
      padding: 5px 8px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 10px;
      font-weight: 700;
    }

    .priority-urgent {
      color: #dc2626;
      background: #fef2f2;
    }

    .priority-high {
      color: #d97706;
      background: #fffbeb;
    }

    .priority-normal {
      color: #2563eb;
      background: #eff6ff;
    }

    .priority-low {
      color: #64748b;
      background: #f1f5f9;
    }

    .mobile-add-task {
      width: 100%;
      min-height: 52px;
      margin-top: 14px;
      border: 1px dashed #d6dae2;
      border-radius: 14px;
      color: #667085;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
    }

    .mobile-add-task i {
      color: #db2777;
    }

    .mobile-empty-state {
      min-height: 230px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .mobile-empty-icon {
      width: 55px;
      height: 55px;
      margin-bottom: 13px;
      border-radius: 50%;
      background: #f1f5f9;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .mobile-load-more {
      width: 100%;
      min-height: 48px;
      border: 1px solid #e5e7eb;
      border-radius: 13px;
      background: white;
      color: #64748b;
      font-size: 13px;
      font-weight: 700;
    }

    .mobile-calendar-wrapper {
      height: calc(100vh - 265px);
      min-height: 520px;
      overflow: hidden;
      background: white;
      border-radius: 18px;
      padding: 8px;
      box-shadow: 0 4px 18px rgba(15, 23, 42, 0.06);
    }

    .mobile-bottom-navigation {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 50;
      min-height: 78px;
      padding: 8px 8px max(8px, env(safe-area-inset-bottom));
      background: #111827;
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      box-shadow: 0 -8px 25px rgba(15, 23, 42, 0.18);
    }

    .mobile-bottom-navigation button,
    .mobile-bottom-navigation a {
      position: relative;
      color: #98a2b3;
      font-size: 10px;
      font-weight: 600;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .mobile-bottom-navigation i {
      font-size: 20px;
    }

    .mobile-bottom-navigation .mobile-bottom-active {
      color: #ec4899;
    }

    .mobile-bottom-navigation .mobile-bottom-active::before {
      content: '';
      position: absolute;
      top: -8px;
      width: 42px;
      height: 3px;
      border-radius: 0 0 4px 4px;
      background: #ec4899;
    }

    @media (max-width: 390px) {
      .mobile-top h1 {
        font-size: 25px;
      }

      .mobile-primary-button {
        padding: 0 12px;
        font-size: 12px;
      }

      .mobile-view-switcher button {
        font-size: 10px;
        gap: 5px;
      }
    }
  `]
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

  constructor(
    private dataService: DataService,
    private router: Router
  ) { }

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

  closeCreateTaskDialog() {
    this.showCreateTaskDialog = false;
    this.initialDialogDate = null;
  }

  handleTaskCreated(event: {
    task: any;
    listId: string;
    spaceId?: string;
    folderId?: string;
  }) {
    this.closeCreateTaskDialog();

    if (!event?.listId) {
      this.loadTasks();
      return;
    }

    if (event.spaceId && event.folderId) {
      this.router.navigate(
        [
          '/spaces',
          event.spaceId,
          'folders',
          event.folderId,
          'lists',
          event.listId
        ],
        {
          queryParams: {
            openTask: event.task?.id || undefined,
            created: '1'
          }
        }
      );
      return;
    }

    this.dataService.getList(event.listId).subscribe({
      next: (list: any) => {
        const folderId =
          event.folderId ||
          list.folder_id ||
          list.folder?.id;

        const spaceId =
          event.spaceId ||
          list.folder?.space_id ||
          list.space_id;

        if (spaceId && folderId) {
          this.router.navigate(
            [
              '/spaces',
              spaceId,
              'folders',
              folderId,
              'lists',
              event.listId
            ],
            {
              queryParams: {
                openTask: event.task?.id || undefined,
                created: '1'
              }
            }
          );
          return;
        }

        this.router.navigate(['/spaces']);
      },
      error: () => {
        this.router.navigate(['/spaces']);
      }
    });
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

  getPrimarySpaceName(): string {
    const availableSpaces = this.spaces();

    if (!availableSpaces || availableSpaces.length === 0) {
      return 'Meus Espaços';
    }

    return availableSpaces[0]?.name || 'Meus Espaços';
  }

  getTaskAssigneeName(task: any): string {
    const firstAssignee = task?.assignees?.[0];

    return (
      firstAssignee?.user?.name ||
      firstAssignee?.name ||
      task?.assignee?.name ||
      'Sem responsável'
    );
  }

  getTaskInitial(task: any): string {
    const name = this.getTaskAssigneeName(task);

    if (!name || name === 'Sem responsável') {
      return '?';
    }

    return name.charAt(0).toUpperCase();
  }

  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      urgent: 'Urgente',
      high: 'Alta',
      normal: 'Normal',
      medium: 'Normal',
      low: 'Baixa'
    };

    return labels[priority] || 'Normal';
  }

  getPriorityClass(priority: string): string {
    const classes: Record<string, string> = {
      urgent: 'priority-urgent',
      high: 'priority-high',
      normal: 'priority-normal',
      medium: 'priority-normal',
      low: 'priority-low'
    };

    return classes[priority] || 'priority-normal';
  }

  getSpaceId(task: any): string {
    return task.list?.folder?.space_id || '';
  }
}
