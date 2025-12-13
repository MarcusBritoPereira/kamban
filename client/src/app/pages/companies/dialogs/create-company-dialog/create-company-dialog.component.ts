import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-create-company-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 animate-scaleIn">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h2 class="text-lg font-bold text-gray-800">Nova Empresa</h2>
          <button (click)="close()" class="text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
            <input type="text" [(ngModel)]="company.name" 
                   class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                   placeholder="Ex: Tech Solutions Ltda">
          </div>

          <!-- Niche -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Segmento (Nicho)</label>
            <input type="text" [(ngModel)]="company.niche" 
                   class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                   placeholder="Ex: Tecnologia, Varejo, Saúde">
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status Inicial</label>
            <div class="flex gap-4">
              <label class="flex items-center cursor-pointer">
                <input type="radio" [(ngModel)]="company.status" value="active" name="status" class="hidden peer">
                <div class="px-4 py-2 rounded-lg border border-gray-200 peer-checked:bg-green-50 peer-checked:border-green-500 peer-checked:text-green-700 text-gray-600 transition-all flex items-center">
                  <span class="w-2 h-2 rounded-full bg-green-500 mr-2"></span> Ativo
                </div>
              </label>
              <label class="flex items-center cursor-pointer">
                <input type="radio" [(ngModel)]="company.status" value="inactive" name="status" class="hidden peer">
                <div class="px-4 py-2 rounded-lg border border-gray-200 peer-checked:bg-gray-100 peer-checked:border-gray-500 peer-checked:text-gray-700 text-gray-600 transition-all flex items-center">
                  <span class="w-2 h-2 rounded-full bg-gray-400 mr-2"></span> Inativo
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button (click)="close()" class="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors">
            Cancelar
          </button>
          <button (click)="save()" [disabled]="!isValid()" 
                  class="px-6 py-2 bg-pink-600 text-white font-bold rounded-lg shadow-md hover:bg-pink-700 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
            Criar Empresa
          </button>
        </div>
      </div>
    </div>
  `
})
export class CreateCompanyDialogComponent {
    @Output() closeDialog = new EventEmitter<void>();
    @Output() saveCompany = new EventEmitter<any>();

    company = {
        name: '',
        niche: '',
        status: 'active'
    };

    close() {
        this.closeDialog.emit();
    }

    save() {
        if (this.isValid()) {
            this.saveCompany.emit(this.company);
        }
    }

    isValid() {
        return this.company.name.trim().length > 0;
    }
}
