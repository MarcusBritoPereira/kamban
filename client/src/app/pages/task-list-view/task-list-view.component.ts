import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { KanbanBoardComponent } from '../../components/kanban-board/kanban-board.component';
import { TaskTableComponent } from '../../components/task-table/task-table.component';
import { TaskCalendarComponent } from '../../components/task-calendar/task-calendar.component';
import { CreateTaskDialogComponent } from '../../components/dialogs/create-task-dialog/create-task-dialog.component';
import { InviteMemberDialogComponent } from '../../components/dialogs/invite-member-dialog/invite-member-dialog.component';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-task-list-view',
  standalone: true,
  imports: [CommonModule, KanbanBoardComponent, TaskTableComponent, TaskCalendarComponent, CreateTaskDialogComponent, InviteMemberDialogComponent],
  templateUrl: './task-list-view.component.html',
  styleUrl: './task-list-view.component.css'
})
export class TaskListViewComponent implements OnInit {
  currentView: 'list' | 'kanban' | 'calendar' = 'list'; // Default list
  showTaskDialog = false;
  showInviteDialog = false;
  listId: string = '';
  spaceId: string = '';

  tasks: any[] = [];
  currentList: any = null;
  selectedTask: any = null;
  initialDialogStatus: string = 'todo';

  constructor(private route: ActivatedRoute, private dataService: DataService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.listId = params.get('listId') || '';
      this.spaceId = this.route.snapshot.paramMap.get('spaceId') ||
        this.route.parent?.snapshot.paramMap.get('spaceId') ||
        this.route.parent?.parent?.snapshot.paramMap.get('spaceId') || '';

      if (this.listId) {
        this.loadListDetails();
        this.loadTasks();
      }
    });

    // Subscribe to global task updates (e.g. from sidebar creation)
    this.dataService.taskUpdates$.subscribe(() => {
      if (this.listId) {
        this.loadTasks();
      }
    });
  }

  loadListDetails() {
    this.dataService.getList(this.listId).subscribe(list => {
      this.currentList = list;
    });
  }

  loadTasks() {
    this.dataService.getTasks(this.listId).subscribe(tasks => {
      this.tasks = tasks;
    });
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

  setView(view: 'kanban' | 'list' | 'calendar') {
    this.currentView = view;
  }

  openTaskDialog(status?: string) {
    this.initialDialogStatus = status || 'todo';
    this.showTaskDialog = true;
  }

  closeTaskDialog() {
    this.showTaskDialog = false;
    this.selectedTask = null;
    this.initialDialogStatus = 'todo';
    this.loadTasks();
  }

  onTaskSelected(task: any) {
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
