import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-company-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h2 class="text-lg font-bold text-gray-800">Editar Empresa</h2>
          <button (click)="close()" class="text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4">
          
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
            <input type="text" [(ngModel)]="data.name" 
                   class="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all text-gray-700 placeholder-gray-400"
                   placeholder="Ex: Acme Corp">
          </div>

          <!-- Niche -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nicho / Segmento</label>
            <input type="text" [(ngModel)]="data.niche" 
                   class="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all text-gray-700 placeholder-gray-400"
                   placeholder="Ex: Tecnologia">
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <div class="relative">
                <select [(ngModel)]="data.status" 
                        class="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all appearance-none text-gray-700">
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="lead">Lead</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                    <i class="fas fa-chevron-down text-xs"></i>
                </div>
            </div>
          </div>
          
           <!-- Additional Fields (Optional) -->
           <!-- Additional Fields -->
           <div class="grid grid-cols-2 gap-4">
               <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Parceria</label>
                    <input type="text" [(ngModel)]="data.partnership_type" class="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-pink-500 outline-none transition-all text-gray-700">
               </div>
               <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Cota de Conteúdos</label>
                    <input type="number" [(ngModel)]="data.content_quota" class="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-pink-500 outline-none transition-all text-gray-700">
               </div>
               <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Valor do Contrato</label>
                    <input type="number" [(ngModel)]="data.contract_value" placeholder="0.00" class="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-pink-500 outline-none transition-all text-gray-700">
               </div>
               <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Investimento</label>
                    <input type="number" [(ngModel)]="data.investment" placeholder="0.00" class="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-pink-500 outline-none transition-all text-gray-700">
               </div>
               <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Data de Início</label>
                    <input type="date" [(ngModel)]="data.start_date" class="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-pink-500 outline-none transition-all text-gray-700">
               </div>
               <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Vencimento</label>
                    <input type="date" [(ngModel)]="data.contract_due" class="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:border-pink-500 outline-none transition-all text-gray-700">
               </div>
           </div>

        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button (click)="close()" 
                  class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            Cancelar
          </button>
          <button (click)="save()" 
                  [disabled]="!isValid()"
                  [class.opacity-50]="!isValid()"
                  class="px-4 py-2 text-sm font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-lg shadow-md transition-all flex items-center">
             <i class="fas fa-save mr-2"></i> Salvar
          </button>
        </div>

      </div>
    </div>
  `
})
export class EditCompanyDialogComponent implements OnInit {
  @Input() company: any;
  @Output() closeDialog = new EventEmitter<void>();
  @Output() saveCompany = new EventEmitter<any>();

  data: any = {
    name: '',
    niche: '',
    status: 'active',
    partnership_type: '',
    content_quota: ''
  };

  ngOnInit() {
    if (this.company) {
      this.data = { ...this.company };
      // Format dates for input[type="date"]
      if (this.data.start_date) {
        this.data.start_date = new Date(this.data.start_date).toISOString().split('T')[0];
      }
      if (this.data.contract_due) {
        this.data.contract_due = new Date(this.data.contract_due).toISOString().split('T')[0];
      }
    }
  }

  close() {
    this.closeDialog.emit();
  }

  save() {
    if (this.isValid()) {
      this.saveCompany.emit(this.data);
    }
  }

  isValid() {
    return !!this.data.name;
  }
}
