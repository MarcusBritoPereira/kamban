import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';

@Component({
    selector: 'app-edit-space-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './edit-space-dialog.component.html'
})
export class EditSpaceDialogComponent implements OnInit {
    @Input() space: any;
    @Output() close = new EventEmitter<void>();
    @Output() updated = new EventEmitter<void>();

    spaceForm: FormGroup;
    isSubmitting = false;

    constructor(private fb: FormBuilder, private dataService: DataService) {
        this.spaceForm = this.fb.group({
            name: ['', Validators.required],
            description: ['']
        });
    }

    ngOnInit() {
        if (this.space) {
            this.spaceForm.patchValue({
                name: this.space.name,
                description: this.space.description
            });
        }
    }

    onSubmit() {
        if (this.spaceForm.valid && this.space) {
            this.isSubmitting = true;
            this.dataService.updateSpace(this.space.id, this.spaceForm.value).subscribe({
                next: () => {
                    this.isSubmitting = false;
                    this.updated.emit();
                    this.close.emit();
                },
                error: (err) => {
                    console.error(err);
                    this.isSubmitting = false;
                    alert('Erro ao atualizar espaço.');
                }
            });
        }
    }

    onCancel() {
        this.close.emit();
    }
}
