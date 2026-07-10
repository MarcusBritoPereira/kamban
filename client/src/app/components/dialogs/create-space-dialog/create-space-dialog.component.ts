import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-create-space-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-space-dialog.component.html',
  styleUrl: './create-space-dialog.component.css'
})
export class CreateSpaceDialogComponent {
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<any>();
  spaceForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private dataService: DataService) {
    this.spaceForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  onSubmit() {
    if (this.spaceForm.valid) {
      this.isSubmitting = true;
      this.dataService.createSpace(this.spaceForm.value).subscribe({
        next: (space) => {
          this.isSubmitting = false;
          this.created.emit(space);
          this.close.emit();
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
          const msg = err.error?.message || err.message || 'Erro desconhecido';
          alert(`Erro ao criar espaço: ${msg} (${err.status})`);
        }
      });
    }
  }

  onCancel() {
    this.close.emit();
  }
}
