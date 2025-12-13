
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-confirmation-dialog',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-[60] animate-fadeIn backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 p-6">
        
        <div class="text-center mb-6">
            <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600 text-xl">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">{{ title }}</h3>
            <p class="text-sm text-gray-600">{{ message }}</p>
        </div>

        <div class="flex gap-3">
          <button (click)="onCancel()" 
                  class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button (click)="onConfirm()" 
                  class="flex-1 px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md transition-colors">
            Confirmar
          </button>
        </div>

      </div>
    </div>
  `
})
export class ConfirmationDialogComponent {
    @Input() title: string = 'Confirmar Ação';
    @Input() message: string = 'Tem certeza que deseja continuar?';

    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    onConfirm() {
        this.confirm.emit();
    }

    onCancel() {
        this.cancel.emit();
    }
}
