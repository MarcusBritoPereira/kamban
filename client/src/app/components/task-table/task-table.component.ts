import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-table.component.html',
  styleUrl: './task-table.component.css'
})
export class TaskTableComponent implements OnInit {
  @Input() tasks: any[] = [];
  @Output() taskClick = new EventEmitter<any>();

  constructor() { }

  ngOnInit() { }

  onTaskClick(task: any) {
    this.taskClick.emit(task);
  }

  isOverdue(deadline: string): boolean {
    if (!deadline) return false;
    return new Date(deadline) < new Date() && new Date(deadline).toDateString() !== new Date().toDateString();
  }
}
