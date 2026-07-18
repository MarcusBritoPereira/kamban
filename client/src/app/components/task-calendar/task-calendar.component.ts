import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ViewChild,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FullCalendarModule,
  FullCalendarComponent,
} from '@fullcalendar/angular';
import {
  CalendarOptions,
  EventClickArg,
  DateSelectArg,
  EventDropArg,
  EventInput,
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';

@Component({
  selector: 'app-task-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './task-calendar.component.html',
  styleUrls: ['./task-calendar.component.css'],
})
export class TaskCalendarComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() tasks: any[] = [];
  @Output() taskClick = new EventEmitter<any>();
  @Output() dateClick = new EventEmitter<Date>();
  @Output() taskDrop = new EventEmitter<{ task: any; newDate: Date }>();

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: ptBrLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
    },
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    events: [],
    eventClick: this.handleEventClick.bind(this),
    select: this.handleDateSelect.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventContent: this.renderEventContent.bind(this), // Custom render
    buttonText: {
      today: 'Hoje',
      month: 'Mês',
      week: 'Semana',
      day: 'Dia',
      list: 'Lista',
    },
  };

  meMode = false;
  private viewInitialized = false;

  constructor() {}

  ngOnInit(): void {
    this.updateEvents();
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.updateEvents();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tasks']) {
      this.updateEvents();
    }
  }

  toggleMeMode() {
    this.meMode = !this.meMode;
    this.updateEvents();
  }

  updateEvents() {
    // Filter tasks if 'Me Mode' is active (logic depends on input tasks structure)
    // For now, assuming parent component filters 'my-tasks' or handles 'me mode' externally?
    // Actually, let's implement local filtering if user ID is available, otherwise just mapping.
    // Since 'tasks' input usually comes pre-filtered in 'MyTasks', we just map.
    // In 'System/Space' view, we might need filtering. For now, basic mapping.

    const events: EventInput[] = (this.tasks || [])
      .filter((task) => task && (task.deadline || task.start_date))
      .map((task) => {
        // Determine color based on priority or status
        let color = '#3B82F6'; // Default Blue
        if (task.priority === 'high') color = '#EF4444'; // Red
        if (task.priority === 'medium') color = '#F59E0B'; // Orange
        if (task.status === 'done') color = '#10B981'; // Green

        return {
          id: task.id,
          title: task.title,
          start: task.deadline || task.start_date,
          end: task.end_date, // Optional
          allDay: true, // Default to all day for tasks unless specific time
          backgroundColor: color,
          borderColor: color,
          extendedProps: {
            task: task,
          },
        };
      });

    if (this.viewInitialized && this.calendarComponent) {
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.batchRendering(() => {
        calendarApi.removeAllEvents();
        calendarApi.addEventSource(events);
      });
      return;
    }

    this.calendarOptions = {
      ...this.calendarOptions,
      events,
    };
  }

  handleEventClick(clickInfo: EventClickArg) {
    this.taskClick.emit(clickInfo.event.extendedProps['task']);
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); // clear selection
    this.dateClick.emit(selectInfo.start);
  }

  handleEventDrop(dropInfo: EventDropArg) {
    const task = dropInfo.event.extendedProps['task'];
    const newDate = dropInfo.event.start;

    if (newDate) {
      // Optimistic update in UI is handled by FullCalendar
      this.taskDrop.emit({ task, newDate });
    }
  }

  renderEventContent(arg: any) {
    // Custom HTML for event
    // Showing priority dot or status icon
    const task = arg.event.extendedProps['task'];
    let iconClass = '';

    if (task.priority === 'high') iconClass = 'fas fa-flag text-red-100';
    if (task.status === 'done') iconClass = 'fas fa-check text-white';

    return {
      html: `
            <div class="fc-content flex items-center gap-1 overflow-hidden px-1">
                ${iconClass ? `<i class="${iconClass} text-[10px]"></i>` : ''}
                <div class="fc-title truncate text-xs font-medium">${this.escapeHtml(arg.event.title)}</div>
            </div>
        `,
    };
  }

  private escapeHtml(value: string): string {
    const div = document.createElement('div');
    div.textContent = value || '';
    return div.innerHTML;
  }
}
