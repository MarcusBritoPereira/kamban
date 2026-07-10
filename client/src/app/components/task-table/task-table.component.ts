import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

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
  @Output() addTask = new EventEmitter<void>();
  @Output() addSubtask = new EventEmitter<any>();

  groups: { status: string; label: string; tasks: any[]; isExpanded: boolean; colorClass: string }[] = [];

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.groupTasks();
  }

  ngOnChanges() {
    this.groupTasks();
  }

  groupTasks() {
    if (!this.tasks) return;

    const statusOrder = ['done', 'approved', 'in_review', 'doing', 'planned', 'todo', 'waiting', 'rejected'];
    const groupsMap = new Map<string, any[]>();

    // Initialize map
    statusOrder.forEach(s => groupsMap.set(s, []));

    // Distribute tasks
    this.tasks.forEach(task => {
      const s = task.status || 'todo';
      if (!groupsMap.has(s)) groupsMap.set(s, []);
      groupsMap.get(s)!.push(task);
    });

    // Build groups array
    this.groups = [];
    groupsMap.forEach((tasks, status) => {
      if (tasks.length > 0) {
        this.groups.push({
          status,
          label: this.getStatusLabel(status),
          tasks,
          isExpanded: true,
          colorClass: this.getStatusBadgeColor(status) // Use badge color for header
        });
      }
    });
  }

  toggleGroup(group: any) {
    group.isExpanded = !group.isExpanded;
  }

  onTaskClick(task: any) {
    this.taskClick.emit(task);
  }

  onAddSubtask(task: any, event: Event) {
    event.stopPropagation();
    this.addSubtask.emit(task);
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
    // For the dot/text in row
    switch (status) {
      case 'todo': return 'text-gray-500 bg-gray-100';
      case 'planned': return 'text-indigo-600 bg-indigo-50';
      case 'doing': return 'text-yellow-600 bg-yellow-50';
      case 'in_review': return 'text-pink-600 bg-pink-50';
      case 'approved': return 'text-teal-600 bg-teal-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'waiting': return 'text-amber-700 bg-amber-50';
      case 'done': return 'text-green-600 bg-green-50';
      default: return 'text-gray-500 bg-gray-100';
    }
  }

  getStatusBadgeColor(status: string): string {
    // For the header badge (Solid background)
    switch (status) {
      case 'todo': return 'bg-gray-200 text-gray-700';
      case 'planned': return 'bg-indigo-600 text-white';
      case 'doing': return 'bg-yellow-500 text-white';
      case 'in_review': return 'bg-purple-600 text-white'; // Match screenshot purple
      case 'approved': return 'bg-teal-700 text-white'; // Match screenshot dark green
      case 'rejected': return 'bg-red-600 text-white';
      case 'waiting': return 'bg-amber-600 text-white';
      case 'done': return 'bg-green-600 text-white';
      default: return 'bg-gray-400 text-white';
    }
  }

  deleteTask(task: any, event: Event) {
    event.stopPropagation();
    if (confirm('Tem certeza de que deseja excluir esta tarefa?')) {
      this.dataService.deleteTask(task.id).subscribe({
        error: (err) => alert('Erro ao excluir tarefa: ' + err.message)
      });
    }
  }
}
