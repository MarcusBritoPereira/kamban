import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.css'
})
export class KanbanBoardComponent implements OnChanges {
  @Input() listId: string = '';
  @Input() tasks: any[] = [];
  @Output() taskClick = new EventEmitter<any>();
  @Output() addTask = new EventEmitter<string>();

  todo: any[] = [];
  doing: any[] = [];
  done: any[] = [];

  constructor(private dataService: DataService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tasks']) {
      this.filterTasks();
    }
  }

  filterTasks() {
    if (!this.tasks) return;
    this.todo = this.tasks.filter(t => t.status === 'todo');
    this.doing = this.tasks.filter(t => t.status === 'doing');
    this.done = this.tasks.filter(t => t.status === 'done');
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      const task = event.container.data[event.currentIndex];
      let newStatus: 'todo' | 'doing' | 'done' = 'todo';

      if (event.container.data === this.todo) {
        newStatus = 'todo';
      } else if (event.container.data === this.doing) {
        newStatus = 'doing';
      } else if (event.container.data === this.done) {
        newStatus = 'done';
      }

      // Optimistic update locally (already done by transferArrayItem)
      task.status = newStatus;

      // Persist to backend
      this.dataService.updateTask(task.id, { status: newStatus }).subscribe({
        error: (err) => {
          console.error('Failed to update task status', err);
          // Revert change if needed, but for now just logging
        }
      });
    }
  }
}
