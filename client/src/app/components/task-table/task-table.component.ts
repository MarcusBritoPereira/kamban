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

  getStatusLabel(status: string): string {
    switch (status) {
      case 'todo': return 'Pendente';
      case 'planned': return 'Planejado';
      case 'doing': return 'Em Andamento';
      case 'in_review': return 'Para Revisão';
      case 'approved': return 'Aprovado';
      case 'rejected': return 'Rejeitado';
      case 'waiting': return 'Em Espera';
      case 'done': return 'Concluído';
      default: return 'Pendente';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'todo': return 'bg-gray-500 text-white';
      case 'planned': return 'bg-indigo-500 text-white';
      case 'doing': return 'bg-yellow-500 text-white';
      case 'in_review': return 'bg-pink-500 text-white';
      case 'approved': return 'bg-teal-600 text-white';
      case 'rejected': return 'bg-red-600 text-white';
      case 'waiting': return 'bg-amber-700 text-white';
      case 'done': return 'bg-green-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  }
}
