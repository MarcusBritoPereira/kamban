import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService, TaskList } from '../../../services/data.service';

@Component({
    selector: 'app-create-task-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div [formGroup]="taskForm" class="bg-white w-full max-w-3xl rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn font-sans">
        
        <!-- App Bar / Header -->
        <div class="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div class="flex-1">
             <div class="flex items-center text-xs font-semibold tracking-wide text-gray-500 mb-1 uppercase">
                <span class="text-pink-600 mr-2">#</span>
                <span>{{ listName }}</span>
             </div>
             <input type="text" formControlName="title" 
                class="bg-transparent text-2xl font-bold text-gray-900 w-full focus:outline-none placeholder-gray-300 font-display"
                placeholder="Título da Tarefa">
          </div>
          <button (click)="onClose()" class="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-all">
            <span class="text-xl leading-none">&times;</span>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar bg-white">
            <div class="p-8 space-y-10">
                
                <!-- Meta Data Section (Chips/Rows) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    <!-- Status & Priority -->
                    <div class="space-y-6">
                        <div class="flex flex-col space-y-2">
                             <label class="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Status</label>
                             <div class="relative bg-gray-50 rounded-t-lg border-b-2 border-gray-200 hover:border-gray-300 transition-colors">
                                <select formControlName="status" class="w-full bg-transparent p-3 text-sm text-gray-800 font-medium cursor-pointer focus:outline-none">
                                    <option value="todo">Pendente</option>
                                    <option value="doing">Em Andamento</option>
                                    <option value="done">Concluído</option>
                                </select>
                             </div>
                        </div>

                        <div class="flex flex-col space-y-2">
                            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Prioridade</label>
                            <div class="relative bg-gray-50 rounded-t-lg border-b-2 border-gray-200 hover:border-gray-300 transition-colors">
                               <select formControlName="priority" class="w-full bg-transparent p-3 text-sm text-gray-800 font-medium cursor-pointer focus:outline-none">
                                   <option value="low">Baixa</option>
                                   <option value="medium">Média</option>
                                   <option value="high">Alta</option>
                                   <option value="urgent">Urgente</option>
                               </select>
                            </div>
                       </div>
                    </div>

                    <!-- Dates & Assignees -->
                    <div class="space-y-6">
                        <div class="flex flex-col space-y-2">
                            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Prazo</label>
                            <div class="relative bg-gray-50 rounded-t-lg border-b-2 border-gray-200 hover:border-gray-300 transition-colors flex items-center px-3">
                                <i class="far fa-calendar text-gray-400 mr-3"></i>
                                <input type="date" formControlName="deadline" class="w-full bg-transparent py-3 text-sm text-gray-800 focus:outline-none">
                            </div>
                       </div>
                       
                       <div class="flex flex-col space-y-2">
                            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Responsáveis</label>
                            <div class="relative bg-transparent border border-dashed border-gray-300 rounded-lg p-2.5 hover:bg-gray-50 cursor-pointer flex items-center justify-center text-gray-400 hover:text-pink-600 transition-colors">
                                <i class="fas fa-plus mr-2 text-xs"></i> <span class="text-xs font-medium">Atribuir</span>
                            </div>
                       </div>
                    </div>
                </div>

                <!-- Description Section -->
                <div class="space-y-3">
                    <label class="text-lg font-semibold text-gray-800 flex items-center">
                        <i class="fas fa-align-left mr-2 text-pink-600 text-sm"></i> Descrição
                    </label>
                    <div class="bg-gray-50 rounded-lg border border-gray-200 focus-within:border-pink-500 focus-within:ring-1 focus-within:ring-pink-200 transition-all">
                        <textarea formControlName="description"
                        class="w-full bg-transparent p-4 text-gray-700 text-base leading-relaxed resize-none focus:outline-none min-h-[140px]"
                        placeholder="Adicione detalhes, listas ou contexto para esta tarefa..."></textarea>
                    </div>
                </div>

                <!-- Attachments Section -->
                <div class="space-y-3">
                     <label class="text-lg font-semibold text-gray-800 flex items-center">
                        <i class="fas fa-paperclip mr-2 text-pink-600 text-sm"></i> Anexos
                     </label>
                     
                     <!-- File List -->
                     <div *ngIf="files.length > 0" class="grid grid-cols-2 gap-3 mb-3">
                        <div *ngFor="let file of files" class="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center justify-between group h-fit">
                            <div class="flex items-center overflow-hidden">
                                <div class="w-8 h-8 rounded bg-blue-100 text-blue-500 flex items-center justify-center mr-3 text-xs font-bold uppercase shrink-0">
                                    {{ file.name.split('.').pop() || 'file' }}
                                </div>
                                <span class="text-sm text-gray-700 truncate font-medium">{{ file.name }}</span>
                            </div>
                            <button class="text-gray-400 hover:text-red-500 transition-colors p-1" (click)="removeFile(file)">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                     </div>

                     <!-- Dropzone -->
                     <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-pink-300 hover:text-pink-500 transition-all cursor-pointer relative">
                        <i class="fas fa-cloud-upload-alt text-3xl mb-3"></i>
                        <span class="text-sm font-medium">Clique ou arraste arquivos aqui</span>
                        <input type="file" (change)="onFileSelected($event)" class="absolute inset-0 opacity-0 cursor-pointer" multiple>
                     </div>
                </div>

            </div>
        </div>
        
        <!-- Footer / Actions -->
        <div class="px-8 py-5 border-t border-gray-100 flex justify-end items-center bg-white gap-3">
             <button (click)="onClose()" class="px-6 py-2.5 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors">
                 Cancelar
             </button>
             <button (click)="onSubmit()" 
                 [disabled]="taskForm.invalid || isSubmitting"
                 class="bg-pink-600 text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-pink-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:shadow-none">
                  {{ isSubmitting ? (task ? 'Salvando...' : 'Criando Tarefa') : (task ? 'Salvar Alterações' : 'Criar Tarefa') }}
              </button>
        </div>

      </div>
    </div>`,
    styles: [`
    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
    }
    .kbd {
        background: rgba(255,255,255,0.1);
        padding: 2px 4px;
        border-radius: 4px;
        font-family: monospace;
    }
  `]
})
export class CreateTaskDialogComponent implements OnInit {
    @Input() listId!: string;
    @Input() listName: string = 'Lista';
    @Output() close = new EventEmitter<void>();
    @Output() created = new EventEmitter<void>();
    @Input() task: any = null;
    @Input() initialStatus: string = 'todo';

    taskForm: FormGroup;
    isSubmitting = false;
    files: File[] = [];

    constructor(private fb: FormBuilder, private dataService: DataService) {
        this.taskForm = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            status: ['todo', Validators.required],
            priority: ['medium'],
            deadline: [null],
            tags: [[]],
            assignees: [[]]
        });
    }

    ngOnInit() {
        if (this.task) {
            this.taskForm.patchValue({
                title: this.task.title,
                description: this.task.description,
                status: this.task.status,
                priority: this.task.priority,
                deadline: this.task.deadline ? new Date(this.task.deadline).toISOString().split('T')[0] : null
            });
            // TODO: Populate tags, assignees if available
        } else {
            this.taskForm.patchValue({
                status: this.initialStatus
            });
        }
    }

    onClose() {
        this.close.emit();
    }

    onFileSelected(event: any) {
        if (event.target.files) {
            for (let i = 0; i < event.target.files.length; i++) {
                this.files.push(event.target.files[i]);
            }
        }
    }

    removeFile(file: File) {
        this.files = this.files.filter(f => f !== file);
    }

    onSubmit() {
        if (this.taskForm.valid) {
            this.isSubmitting = true;

            const formValue = this.taskForm.value;
            // Clean payload
            const taskData = {
                title: formValue.title,
                description: formValue.description,
                status: formValue.status,
                deadline: formValue.deadline ? new Date(formValue.deadline).toISOString() : null,
                priority: formValue.priority
            };

            if (this.task) {
                this.dataService.updateTask(this.task.id, taskData).subscribe({
                    next: (updatedTask) => {
                        // Attachments logic would go here
                        this.created.emit(); // Emit created to refresh
                        this.close.emit();
                    },
                    error: (err) => {
                        console.error(err);
                        alert('Erro ao atualizar tarefa: ' + (err.error?.message || err.message));
                        this.isSubmitting = false;
                    }
                });
            } else {
                this.dataService.createTask(this.listId, taskData).subscribe({
                    next: (task) => {
                        if (this.files.length > 0) {
                            // Upload logic
                        }
                        this.created.emit();
                        this.close.emit();
                    },
                    error: (err) => {
                        console.error(err);
                        alert('Erro ao criar tarefa: ' + (err.error?.message || err.message || 'Erro desconhecido'));
                        this.isSubmitting = false;
                    }
                });
            }
        }
    }
}
