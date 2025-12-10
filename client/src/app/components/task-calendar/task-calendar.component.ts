import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-task-calendar',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './task-calendar.component.html',
  styleUrl: './task-calendar.component.css'
})
export class TaskCalendarComponent implements OnInit {
  @Input() tasks: any[] = [];
  @Output() taskClick = new EventEmitter<any>();

  currentMonth: Date = new Date();
  daysInMonth: Date[] = [];
  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.generateCalendar(this.currentMonth);
  }

  prevMonth() {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() - 1));
    this.generateCalendar(this.currentMonth);
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() + 1));
    this.generateCalendar(this.currentMonth);
  }

  drop(event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) {
      return; // Did not change date
    }

    const task = event.item.data;
    const newDate: Date = event.container.data;

    // Prevent dropping on past dates
    if (this.isPastDate(newDate)) {
      return;
    }

    // Fix time zone issues: Create a date at noon to be safe or keep local
    // Assuming 'deadline' is a date string YYYY-MM-DD or ISO
    const updatedDeadline = newDate.toISOString();

    // Optimistic Update
    task.deadline = updatedDeadline;

    // Force update of view (implicitly happened by changing property, but maybe need to trigger detection if dealing with OnPush. Default is fine)

    this.dataService.updateTask(task.id, { deadline: updatedDeadline }).subscribe({
      error: (err) => console.error('Error updating task date', err)
    });
  }

  isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  generateCalendar(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];

    // Fill padding days
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null); // Simple null for padding
    }

    // Fill actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    this.daysInMonth = days as Date[];
  }

  getTasksForDay(date: Date | null): any[] {
    if (!date) return [];
    return this.tasks.filter(t => {
      if (!t.deadline) return false;
      const d = new Date(t.deadline);
      return d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear();
    });
  }
}
