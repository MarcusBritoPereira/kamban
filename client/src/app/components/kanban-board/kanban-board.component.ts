import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { DataService, Task } from '../../services/data.service';
import { ScrollingModule } from '@angular/cdk/scrolling';

interface KanbanColumn {
  id: Task['status'];
  title: string;
  colorClass: string;
  items: Task[];
}

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, ScrollingModule],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.css',
  encapsulation: ViewEncapsulation.None // Ensure drag preview styles apply globally
})
export class KanbanBoardComponent implements OnChanges {
  @Input() tasks: Task[] = [];
  @Output() taskClick = new EventEmitter<Task>();
  @Output() addTask = new EventEmitter<string>();

  // Configuration for all columns to ensure uniformity
  columns: KanbanColumn[] = [
    { id: 'todo', title: 'Pendente', colorClass: 'bg-gray-500', items: [] },
    { id: 'planned', title: 'Planejado', colorClass: 'bg-indigo-500', items: [] },
    { id: 'doing', title: 'Em Andamento', colorClass: 'bg-yellow-500', items: [] },
    { id: 'in_review', title: 'Para Revisão', colorClass: 'bg-pink-500', items: [] },
    { id: 'approved', title: 'Aprovado', colorClass: 'bg-teal-600', items: [] },
    { id: 'rejected', title: 'Rejeitado', colorClass: 'bg-red-600', items: [] },
    { id: 'waiting', title: 'Em Espera', colorClass: 'bg-amber-700', items: [] },
    { id: 'done', title: 'Concluído', colorClass: 'bg-green-600', items: [] },
  ];

  constructor(private dataService: DataService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tasks']) {
      this.distributeTasks();
    }
  }

  trackByColumn(index: number, col: KanbanColumn): string {
    return col.id;
  }

  trackByTask(index: number, task: Task): string {
    return task.id || index.toString();
  }

  distributeTasks() {
    if (!this.tasks) return;

    // Clear current items safely
    this.columns.forEach(col => col.items = []);

    // Distribute
    this.tasks.forEach(task => {
      const col = this.columns.find(c => c.id === task.status);
      if (col) {
        col.items.push(task);
      } else {
        // Fallback for unknown status
        const todoCol = this.columns.find(c => c.id === 'todo');
        if (todoCol) todoCol.items.push(task);
      }
    });
  }

  onAddClick(status: string) {
    this.addTask.emit(status);
  }

  drop(event: CdkDragDrop<Task[]>, targetStatus: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const previousContainer = event.previousContainer;
      const currentContainer = event.container;

      // Optimistic Drag Logic
      transferArrayItem(
        previousContainer.data,
        currentContainer.data,
        event.previousIndex,
        event.currentIndex,
      );

      const task = currentContainer.data[event.currentIndex];
      const oldStatus = task.status;
      const newStatus = targetStatus as Task['status'];

      // Local Update
      task.status = newStatus;

      // Backend Update
      if (task.id) {
        this.dataService.updateTask(task.id, { status: newStatus }).subscribe({
          error: (err) => {
            console.error('Drag failed, reverting...', err);
            // Revert UI
            transferArrayItem(
              currentContainer.data,
              previousContainer.data,
              event.currentIndex,
              event.previousIndex
            );
            task.status = oldStatus;
          }
        });
      }
    }
  }
}
