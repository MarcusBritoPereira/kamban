import { Component, OnInit, ChangeDetectorRef, HostListener, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { KanbanBoardComponent } from '../../components/kanban-board/kanban-board.component';
import { TaskTableComponent } from '../../components/task-table/task-table.component';
import { TaskCalendarComponent } from '../../components/task-calendar/task-calendar.component';
import { CreateTaskDialogComponent } from '../../components/dialogs/create-task-dialog/create-task-dialog.component';
import { InviteMemberDialogComponent } from '../../components/dialogs/invite-member-dialog/invite-member-dialog.component';
import { DataService } from '../../services/data.service';
// ... imports

@Component({
  selector: 'app-task-list-view',
  standalone: true,
  imports: [CommonModule, KanbanBoardComponent, TaskTableComponent, TaskCalendarComponent, CreateTaskDialogComponent, InviteMemberDialogComponent],
  templateUrl: './task-list-view.component.html'
})
export class TaskListViewComponent implements OnInit {
  // ... properties

  listId: string = '';
  spaceId: string = '';
  tasks: any[] = [];
  currentList: any = null;
  activeView: 'list' | 'kanban' | 'calendar' = 'list';
  showTaskDialog = false;
  selectedTask: any = null;
  parentTaskForDialog: any = null;
  initialDialogStatus = 'todo';
  initialDialogDate: Date | null = null;
  showInviteDialog = false;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    // ... params subscription

    this.dataService.taskUpdates$.subscribe(() => {
      // ...
    });

    // ...

    // Subscribe to route params to get listId and spaceId
    this.route.params.subscribe(params => {
      this.listId = params['listId'];
      this.spaceId = params['spaceId'];

      if (this.listId) {
        this.loadListDetails();
        this.loadTasks();
      }
    });

    // Handle deep linking to task
    this.route.queryParams.subscribe(params => {
      const openTaskId = params['openTask'];
      if (openTaskId) {
        this.dataService.getTask(openTaskId).subscribe({
          next: (task) => {
            if (task) {
              this.onTaskSelected(task);
              // Clean up query param? Maybe not necessary, but good UX to avoid reopening on refresh
            }
          },
          error: (err) => console.error('Error opening linked task:', err)
        });
      }
    });
  }

  loadListDetails() {
    this.dataService.getList(this.listId).subscribe(list => {
      this.currentList = list;
      // Backup: Ensure spaceId is set if missing from route, assuming list has folder->space_id
      if (!this.spaceId && list.folder?.space_id) {
        this.spaceId = list.folder.space_id;
        console.log('TaskListView: spaceId set from list details:', this.spaceId);
      }
    });
  }

  // Pagination State
  page = 1;
  limit = 50;
  total = 0;
  isLoading = false;
  hasMore = false;

  loadTasks(reset: boolean = true) {
    if (reset) {
      this.page = 1;
      this.tasks = [];
    }

    this.isLoading = true;
    this.dataService.getListTasks(this.listId, this.page, this.limit).subscribe({
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
        console.error('Error loading tasks:', err);
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

  searchTerm: string = '';
  sortOrder: 'date' | 'name' = 'date';

  get filteredTasks() {
    let result = this.tasks.filter(t =>
      t.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    if (this.sortOrder === 'date') {
      result.sort((a, b) => {
        const dateA = a.deadline ? new Date(a.deadline).getTime() : 0;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : 0;
        return dateA - dateB; // Async/deadline sort
      });
    } else {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    return result;
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
  }

  toggleSort() {
    this.sortOrder = this.sortOrder === 'date' ? 'name' : 'date';
  }

  setView(view: 'list' | 'kanban' | 'calendar') {
    this.activeView = view;
    const currentLimit = this.activeView === 'calendar' ? 1000 : this.limit;
    if (view === 'calendar') {
      this.loadTasks(true);
    }
  }

  onCalendarDateClick(date: Date) {
    this.openTaskDialog(undefined, date);
  }

  onTaskDrop(event: { task: any, newDate: Date }) {
    const index = this.tasks.findIndex(t => t.id === event.task.id);
    if (index !== -1) {
      const updatedTask = { ...this.tasks[index], deadline: event.newDate };
      this.tasks[index] = updatedTask;
      this.tasks = [...this.tasks];
    }

    this.dataService.updateTask(event.task.id, { deadline: event.newDate }).subscribe({
      error: (err) => console.error('Error rescheduling task', err)
    });
  }

  openTaskDialog(status?: string, date?: Date) {
    this.initialDialogStatus = status || 'todo';
    this.initialDialogDate = date || null;
    this.parentTaskForDialog = null;
    this.showTaskDialog = true;
  }

  openSubtaskDialog(parentTask: any) {
    this.selectedTask = null;
    this.parentTaskForDialog = parentTask;
    this.initialDialogStatus = parentTask.status || 'todo';
    this.initialDialogDate = null;
    this.showTaskDialog = true;
  }

  closeTaskDialog() {
    this.showTaskDialog = false;
    this.selectedTask = null;
    this.parentTaskForDialog = null;
    this.initialDialogStatus = 'todo';
    this.initialDialogDate = null;
    this.loadTasks();
  }

  handleTaskCreated(event: {
    task: any;
    listId: string;
    spaceId?: string;
    folderId?: string;
  }) {
    this.showTaskDialog = false;
    this.selectedTask = null;
    this.parentTaskForDialog = null;
    this.initialDialogStatus = 'todo';
    this.initialDialogDate = null;

    this.loadTasks();

    if (event?.task?.id) {
      setTimeout(() => {
        this.dataService.getTask(event.task.id).subscribe({
          next: (task) => {
            if (task) {
              this.onTaskSelected(task);
            }
          },
          error: (err) => {
            console.error(
              'Erro ao abrir a tarefa recém-criada:',
              err
            );
          }
        });
      }, 300);
    }
  }

  onTaskSelected(task: any) {
    this.parentTaskForDialog = null;
    this.selectedTask = task;
    this.showTaskDialog = true;
  }

  openInviteDialog() {
    this.showInviteDialog = true;
  }

  closeInviteDialog() {
    this.showInviteDialog = false;
  }

  canInvite(): boolean {
    return this.dataService.canInvite(this.spaceId);
  }
}
