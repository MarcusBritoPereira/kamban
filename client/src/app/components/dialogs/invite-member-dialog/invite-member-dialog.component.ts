import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-invite-member-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div class="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h3 class="text-xl font-bold mb-4">Convidar Membro</h3>
        
        <form [formGroup]="inviteForm" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
              Email do Usuário
            </label>
            <input 
              type="email" 
              id="email" 
              formControlName="email"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="exemplo@email.com">
          </div>

          <div class="flex items-center justify-between mt-6">
            <button 
              type="button" 
              (click)="onCancel()"
              class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Cancelar
            </button>
            <button 
              type="submit" 
              [disabled]="!inviteForm.valid || isSubmitting"
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50">
              {{ isSubmitting ? 'Enviando...' : 'Convidar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: ``
})
export class InviteMemberDialogComponent {
  @Input() spaceId: string = '';
  @Output() close = new EventEmitter<void>();

  inviteForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private dataService: DataService) {
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.inviteForm.valid && this.spaceId) {
      this.isSubmitting = true;
      const { email } = this.inviteForm.value;

      this.dataService.addMember(this.spaceId, email).subscribe({
        next: () => {
          this.isSubmitting = false;
          alert('Usuário convidado com sucesso!');
          this.close.emit();
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
          alert('Erro ao convidar usuário (verifique se o email existe).');
        }
      });
    }
  }

  onCancel() {
    this.close.emit();
  }
}
