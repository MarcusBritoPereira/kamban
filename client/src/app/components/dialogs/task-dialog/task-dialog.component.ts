import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-dialog.component.html',
  styleUrl: './task-dialog.component.css'
})
export class TaskDialogComponent implements OnChanges {
  @Input() task: any = null; // If null, create mode. If set, edit mode.
  @Input() listId: string = '';
  @Output() close = new EventEmitter<void>();

  taskForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private dataService: DataService) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      deadline: [''],
      status: ['todo', Validators.required] // Default status
    });
  }

  ngOnChanges() {
    if (this.task) {
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description,
        deadline: this.task.deadline ? new Date(this.task.deadline).toISOString().substring(0, 10) : '',
        status: this.task.status
      });
    }
  }

  onSubmit() {
    if (this.taskForm.valid) {
      this.isSubmitting = true;
      const formValue = this.taskForm.value;

      // Clean up data
      const data = {
        ...formValue,
        deadline: formValue.deadline ? formValue.deadline : null
      };

      if (this.task) {
        this.dataService.updateTask(this.task.id, data).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.close.emit();
          },
          error: (err) => {
            console.error(err);
            this.isSubmitting = false;
            alert('Erro ao atualizar tarefa');
          }
        });
      } else {
        this.dataService.createTask(this.listId, data).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.close.emit();
          },
          error: (err) => {
            console.error(err);
            this.isSubmitting = false;
            alert('Erro ao criar tarefa');
          }
        });
      }
    } else {
      console.log('TaskDialog: Form invalid');
      Object.keys(this.taskForm.controls).forEach(key => {
        const controlErrors = this.taskForm.get(key)?.errors;
        if (controlErrors != null) {
          console.log('Key control: ' + key + ', keyError: ' + JSON.stringify(controlErrors));
        }
      });
    }
  }

  onCancel() {
    this.close.emit();
  }
}
