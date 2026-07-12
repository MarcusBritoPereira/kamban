import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { forkJoin, of } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'app-create-task-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    template: `
    <div class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div [formGroup]="taskForm" class="bg-white w-[98vw] h-[95vh] rounded-xl shadow-2xl flex flex-row overflow-hidden animate-fadeIn font-sans relative">
        
        <!-- CLOSE BUTTON (Top Right) -->
        <button (click)="onClose()" class="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors shadow-sm">
            <i class="fas fa-times text-sm"></i>
        </button>

        <!-- MAIN CONTENT (Left Side) -->
        <div class="flex-1 flex flex-col h-full min-w-0">
            <!-- App Bar / Header -->
            <div class="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
              <div class="flex-1 min-w-0 mr-4">
                 <div class="flex items-center text-xs font-semibold tracking-wide text-gray-500 mb-1 uppercase truncate">
                    <span class="text-pink-600 mr-2">#</span>
                    
                    <!-- Fixed Path if listId exists -->
                    <span *ngIf="listId">{{ taskPath || listName }}</span>
                    
                    <!-- Selection Dropdown if no listId -->
                    <div *ngIf="!listId" class="relative inline-block ml-1">
                         <div (click)="showHierarchyDropdown = !showHierarchyDropdown" 
                              class="cursor-pointer hover:text-gray-800 hover:bg-gray-100 px-2 py-1 rounded transition-colors flex items-center gap-1 border border-transparent hover:border-gray-200">
                             <span>{{ selectedListId ? taskPath || selectedListName : 'Selecionar Lista de Destino' }}</span>
                             <i class="fas fa-chevron-down text-[10px]"></i>
                         </div>

                         <!-- Hierarchy Dropdown -->
                         <div *ngIf="showHierarchyDropdown" class="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 animate-fadeIn flex flex-col gap-3">
                             
                             <!-- 1. Space -->
                             <div class="flex flex-col gap-1">
                                 <label class="text-[10px] uppercase font-bold text-gray-400">Espaço</label>
                                 <select [ngModel]="selectedSpaceId" (ngModelChange)="onSpaceSelect($event)" [ngModelOptions]="{standalone: true}"
                                    class="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-pink-500 cursor-pointer">
                                     <option [ngValue]="null" disabled>Selecione...</option>
                                     <option *ngFor="let s of spaces" [value]="s.id">{{ s.name }}</option>
                                 </select>
                             </div>

                             <!-- 2. Folder -->
                             <div class="flex flex-col gap-1" *ngIf="selectedSpaceId">
                                <label class="text-[10px] uppercase font-bold text-gray-400">Pasta</label>
                                <select [ngModel]="selectedFolderId" (ngModelChange)="onFolderSelect($event)" [ngModelOptions]="{standalone: true}"
                                   class="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-pink-500 cursor-pointer">
                                    <option [ngValue]="null" disabled>Selecione...</option>
                                    <option *ngFor="let f of folders" [value]="f.id">{{ f.name }}</option>
                                </select>
                            </div>

                            <!-- 3. List -->
                            <div class="flex flex-col gap-1" *ngIf="selectedFolderId">
                                <label class="text-[10px] uppercase font-bold text-gray-400">Lista</label>
                                <select [ngModel]="selectedListId" (ngModelChange)="onListSelect($event)" [ngModelOptions]="{standalone: true}"
                                   class="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-pink-500 cursor-pointer">
                                    <option [ngValue]="null" disabled>Selecione...</option>
                                    <option *ngFor="let l of lists" [value]="l.id">{{ l.name }}</option>
                                </select>
                            </div>

                            <div *ngIf="selectedListId" class="text-xs text-green-600 font-bold text-center pt-2 border-t border-gray-100">
                                <i class="fas fa-check mr-1"></i> Lista Selecionada
                            </div>

                         </div>
                         
                         <!-- Backdrop -->
                         <div *ngIf="showHierarchyDropdown" (click)="showHierarchyDropdown = false" class="fixed inset-0 z-40 cursor-default"></div>
                    </div>

                    <span *ngIf="taskForm.get('title')?.value" class="ml-2 text-gray-400 truncate max-w-[200px]">> {{ taskForm.get('title')?.value }}</span>
                 </div>
                 <input type="text" formControlName="title" 
                    class="bg-transparent text-2xl font-bold text-gray-900 w-full focus:outline-none placeholder-gray-300 font-display"
                    [placeholder]="parentTaskId ? 'Título da Subtarefa' : 'Título da Tarefa'">
              </div>
            </div>

            <div class="flex-1 overflow-y-auto custom-scrollbar bg-white p-8 space-y-10">
                    
                    <!-- Meta Data Section -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        <!-- Status, Priority, Tags -->
                        <div class="space-y-6">
                            <div class="flex flex-col space-y-2 relative">
                                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Status</label>
                                
                                <!-- Custom Status Trigger -->
                                <div (click)="showStatusDropdown = !showStatusDropdown" 
                                     class="relative bg-gray-50 rounded-lg p-2.5 border border-gray-200 hover:border-gray-300 cursor-pointer flex items-center justify-between transition-colors min-h-[42px]">
                                     <div class="flex items-center">
                                         <i [class]="getCurrentStatusOption().icon + ' mr-2 text-xs ' + getCurrentStatusOption().color"></i>
                                         <span class="text-sm font-medium text-gray-700 uppercase">{{ getCurrentStatusOption().label }}</span>
                                     </div>
                                     <i class="fas fa-chevron-down text-gray-400 text-xs transition-transform" [class.rotate-180]="showStatusDropdown"></i>
                                </div>

                                <!-- Status Dropdown -->
                                <div *ngIf="showStatusDropdown" class="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-1 animate-fadeIn flex flex-col max-h-[300px]">
                                    <!-- Search Input -->
                                    <div class="p-2 border-b border-gray-100">
                                        <input type="text" [(ngModel)]="statusSearch" [ngModelOptions]="{standalone: true}" placeholder="Pesquisar..." 
                                            class="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-pink-500" 
                                            (click)="$event.stopPropagation()">
                                    </div>
                                    
                                    <!-- Options List -->
                                    <div class="overflow-y-auto custom-scrollbar flex-1 p-1">
                                        <div *ngFor="let s of filteredStatusOptions" (click)="setStatus(s.id)" 
                                             class="flex items-center px-3 py-2 rounded hover:bg-gray-50 cursor-pointer group">
                                            <i [class]="s.icon + ' mr-3 text-xs w-4 text-center ' + s.color"></i>
                                            <span class="text-sm text-gray-700 font-medium">{{ s.label }}</span>
                                            <i *ngIf="taskForm.get('status')?.value === s.id" class="fas fa-check ml-auto text-pink-500 text-xs"></i>
                                        </div>
                                        <div *ngIf="filteredStatusOptions.length === 0" class="text-xs text-center text-gray-400 py-3">
                                            Nenhum status encontrado.
                                        </div>
                                    </div>
                                </div>

                                <!-- Backdrop -->
                                <div *ngIf="showStatusDropdown" (click)="showStatusDropdown = false" class="fixed inset-0 z-40 cursor-default"></div>
                            </div>

                        <div class="flex flex-col space-y-2 relative">
                            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Prioridade</label>
                            
                            <!-- Custom Priority Trigger -->
                             <div (click)="showPriorityDropdown = !showPriorityDropdown" 
                                  class="relative bg-gray-50 rounded-lg p-2.5 border border-gray-200 hover:border-gray-300 cursor-pointer flex items-center justify-between transition-colors min-h-[42px]">
                                  
                                  <div class="flex items-center">
                                      <i class="fas fa-flag mr-2 text-xs" [ngClass]="getPriorityColor(taskForm.get('priority')?.value)"></i>
                                      <span class="text-sm font-medium text-gray-700">{{ getPriorityLabel(taskForm.get('priority')?.value) }}</span>
                                  </div>
                                  <i class="fas fa-chevron-down text-gray-400 text-xs transition-transform" [class.rotate-180]="showPriorityDropdown"></i>
                             </div>

                             <!-- Priority Dropdown -->
                             <div *ngIf="showPriorityDropdown" class="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-1 animate-fadeIn">
                                 <div *ngFor="let p of priorities" (click)="setPriority(p.value)" 
                                      class="flex items-center px-3 py-2 rounded hover:bg-gray-50 cursor-pointer">
                                     <i class="fas fa-flag mr-3 text-xs" [ngClass]="p.colorClass"></i>
                                     <span class="text-sm text-gray-700">{{ p.label }}</span>
                                     <i *ngIf="taskForm.get('priority')?.value === p.value" class="fas fa-check ml-auto text-pink-500 text-xs"></i>
                                 </div>
                             </div>

                             <!-- Backdrop -->
                             <div *ngIf="showPriorityDropdown" (click)="showPriorityDropdown = false" class="fixed inset-0 z-40 cursor-default"></div>
                       </div>

                           <!-- Tags Section -->
                           <div class="flex flex-col space-y-2 relative">
                                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Etiquetas</label>
                                
                                <div (click)="showTagDropdown = !showTagDropdown" 
                                    class="relative bg-transparent border border-dashed border-gray-300 rounded-lg p-2.5 hover:bg-gray-50 cursor-pointer flex items-center flex-wrap gap-2 min-h-[42px] transition-colors">
                                    
                                    <div *ngIf="selectedTags.length === 0" class="text-gray-400 text-xs font-medium flex items-center">
                                        <i class="fas fa-tag mr-2"></i> Adicionar
                                    </div>

                                    <div *ngFor="let tagId of selectedTags" class="flex items-center px-2 py-1 rounded text-xs font-bold text-white shadow-sm mr-1 mb-1" [style.background-color]="getTagColor(tagId)">
                                        {{ getTagName(tagId) }}
                                        <span (click)="$event.stopPropagation(); toggleTag(tagId)" class="ml-1 hover:text-white/70 cursor-pointer">&times;</span>
                                    </div>
                                </div>

                                <!-- Tags Dropdown -->
                                <div *ngIf="showTagDropdown" class="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-3 w-[260px] animate-fadeIn">
                                    <div class="mb-3">
                                        <input type="text" placeholder="Criar nova etiqueta..." #tagInput (keyup.enter)="createTag(tagInput.value); tagInput.value=''"
                                            class="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-pink-500">
                                    </div>

                                    <div class="max-h-40 overflow-y-auto space-y-1 mb-2 custom-scrollbar">
                                        <div *ngFor="let tag of spaceTags" class="flex items-center justify-between group px-1 py-1 rounded hover:bg-gray-50">
                                            <div (click)="toggleTag(tag.id)" class="flex items-center cursor-pointer flex-1">
                                                <div class="w-3 h-3 rounded-full mr-2" [style.background-color]="tag.color"></div>
                                                <span class="text-sm text-gray-700 truncate max-w-[140px]">{{ tag.name }}</span>
                                                <i *ngIf="selectedTags.includes(tag.id)" class="fas fa-check text-pink-500 ml-auto"></i>
                                            </div>
                                            <div class="hidden group-hover:flex items-center ml-2">
                                                <button (click)="$event.stopPropagation(); deleteTag(tag)" class="text-gray-300 hover:text-red-500"><i class="fas fa-trash text-[10px]"></i></button>
                                            </div>
                                        </div>
                                        <div *ngIf="spaceTags.length === 0" class="text-xs text-center text-gray-400 py-2">
                                            Nenhuma etiqueta.
                                        </div>
                                    </div>
                                    
                                    <div class="flex gap-1 justify-center border-t pt-2 flex-wrap">
                                       <div *ngFor="let color of tagColors" (click)="selectedColor = color" 
                                            class="w-4 h-4 rounded-full cursor-pointer hover:scale-110 transition-transform ring-1 ring-offset-1"
                                            [class.ring-gray-300]="selectedColor !== color"
                                            [class.ring-pink-500]="selectedColor === color"
                                            [style.background-color]="color">
                                       </div>
                                    </div>
                                </div>

                                <div *ngIf="showTagDropdown" (click)="showTagDropdown = false" class="fixed inset-0 z-40 cursor-default"></div>
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
                           
                           <div class="flex flex-col space-y-2 relative">
                                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Responsáveis</label>
                                
                                <div (click)="showAssigneeDropdown = !showAssigneeDropdown" 
                                    class="relative bg-transparent border border-dashed border-gray-300 rounded-lg p-2.5 hover:bg-gray-50 cursor-pointer flex items-center flex-wrap gap-2 min-h-[42px] transition-colors">
                                    
                                    <div *ngIf="selectedAssignees.length === 0" class="text-gray-400 text-xs font-medium flex items-center">
                                        <i class="fas fa-plus mr-2"></i> Atribuir
                                    </div>

                                    <div *ngFor="let userId of selectedAssignees" class="flex items-center bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs font-bold mr-1 mb-1">
                                        {{ getMemberName(userId) }}
                                        <span (click)="$event.stopPropagation(); toggleAssignee(userId)" class="ml-1 hover:text-pink-900 cursor-pointer">&times;</span>
                                    </div>
                                </div>

                                <div *ngIf="showAssigneeDropdown" class="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto animate-fadeIn">
                                    <div *ngFor="let member of members" (click)="toggleAssignee(member.id)" 
                                        class="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center text-sm text-gray-700">
                                        <div class="w-4 h-4 border rounded mr-2 flex items-center justify-center transition-colors"
                                            [ngClass]="isSelected(member.id) ? 'bg-pink-500 border-pink-500 text-white' : 'border-gray-300'">
                                            <i *ngIf="isSelected(member.id)" class="fas fa-check text-[10px]"></i>
                                        </div>
                                        <div class="flex items-center">
                                            <div class="w-6 h-6 rounded-full bg-gray-200 mr-2 overflow-hidden flex items-center justify-center text-[10px]">
                                                <img *ngIf="member.avatar_url" [src]="'' + member.avatar_url" class="w-full h-full object-cover">
                                                <span *ngIf="!member.avatar_url">{{ member.name.charAt(0) }}</span>
                                            </div>
                                            {{ member.name }}
                                        </div>
                                    </div>
                                    <div *ngIf="members.length === 0" class="p-3 text-xs text-center text-gray-500">
                                        Sem membros no espaço.
                                    </div>
                                </div>

                                <div *ngIf="showAssigneeDropdown" (click)="showAssigneeDropdown = false" class="fixed inset-0 z-40 cursor-default"></div>
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
                         
                         <div *ngIf="existingAttachments.length > 0" class="grid grid-cols-2 gap-3 mb-3">
                            <div *ngFor="let att of existingAttachments" class="bg-gray-50 border border-gray-200 p-3 rounded-lg flex items-center justify-between group h-fit">
                                <a [href]="'' + att.file_url" target="_blank" class="flex items-center overflow-hidden hover:text-pink-600 transition-colors">
                                    <div class="w-8 h-8 rounded bg-gray-200 text-gray-500 flex items-center justify-center mr-3 text-xs font-bold uppercase shrink-0">
                                        {{ att.file_type.includes('image') ? 'IMG' : 'DOC' }}
                                    </div>
                                    <span class="text-sm text-gray-700 truncate font-medium">{{ att.file_name }}</span>
                                </a>
                                <button class="text-gray-400 hover:text-red-500 transition-colors p-1" (click)="deleteExistingAttachment(att)">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                         </div>

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

                         <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-pink-300 hover:text-pink-500 transition-all cursor-pointer relative">
                            <i class="fas fa-cloud-upload-alt text-3xl mb-3"></i>
                            <span class="text-sm font-medium">Clique ou arraste arquivos aqui</span>
                            <input type="file" (change)="onFileSelected($event)" class="absolute inset-0 opacity-0 cursor-pointer" multiple>
                         </div>
                    </div>

            </div>

            <!-- Footer / Actions -->
            <div class="px-8 py-5 border-t border-gray-100 flex justify-end items-center bg-white gap-3 shrink-0">
                 <div class="flex gap-3">
                    <button (click)="onClose()" class="px-6 py-2.5 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors">
                        Cancelar
                    </button>
                    <button (click)="onSubmit()" 
                        [disabled]="taskForm.invalid || isSubmitting"
                        class="bg-pink-600 text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-pink-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:shadow-none">
                         {{ isSubmitting ? (task ? 'Salvando...' : (parentTaskId ? 'Criando Subtarefa' : 'Criando Tarefa')) : (task ? 'Salvar Alterações' : (parentTaskId ? 'Criar Subtarefa' : 'Criar Tarefa')) }}
                     </button>
                </div>
            </div>
        </div>

        <!-- RIGHT SIDE: ACTIVITY -->
        <div class="w-[30%] bg-gray-50 border-l border-gray-200 flex flex-col h-full shrink-0">
             <!-- Activity Header: Added pr-14 to avoid close button overlap -->
             <div class="pl-4 pr-14 py-4 border-b border-gray-200 flex items-center justify-between bg-white/50 backdrop-blur-sm">
                 <h3 class="text-sm font-bold text-gray-700">Atividade</h3>
                 <span class="text-xs text-gray-400">{{ activities.length }} eventos</span>
             </div>

             <!-- Activity List -->
             <div class="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
                 <div *ngIf="activities.length === 0" class="text-center text-gray-400 text-xs py-8 italic">
                     Nenhuma atividade registrada ainda.
                 </div>

                 <div *ngFor="let log of activities" class="flex gap-3 group">
                     <!-- Avatar -->
                     <div class="w-6 h-6 rounded-full bg-gray-200 shrink-0 overflow-hidden text-[9px] flex items-center justify-center text-gray-500 font-bold">
                         <img *ngIf="log.user?.avatar_url" [src]="'' + log.user.avatar_url" class="w-full h-full object-cover">
                         <span *ngIf="!log.user?.avatar_url">{{ log.user?.name?.charAt(0) || '?' }}</span>
                     </div>
                     
                     <div class="flex-1">
                         <!-- Header -->
                         <div class="flex items-baseline justify-between mb-0.5">
                             <span class="text-xs font-bold text-gray-700 mr-2">{{ log.user?.name }}</span>
                             <span class="text-[10px] text-gray-400 whitespace-nowrap">{{ log.created_at | date:'d/M HH:mm' }}</span>
                         </div>
                         
                         <!-- Content (System Log vs Comment) -->
                         <div *ngIf="log.type === 'comment'" class="bg-white border border-gray-200 rounded-lg rounded-tl-none p-2.5 text-xs text-gray-700 shadow-sm mt-1" [innerHTML]="formatComment(log.content)"></div>
                         <div *ngIf="log.type === 'system'" class="text-[11px] text-gray-500 leading-tight">
                             {{ log.content }}
                         </div>
                     </div>
                 </div>
             </div>

             <!-- Comment Input -->
             <div class="px-4 py-3 bg-white border-t border-gray-200">
                 <!-- Hidden File Input for Comments -->
                 <input type="file" #commentFileInput id="comment-file-input" class="hidden" (change)="onCommentFileSelected($event)">

                 <div class="relative bg-gray-50 rounded-xl border border-gray-200 focus-within:border-pink-500 focus-within:ring-1 focus-within:ring-pink-200 transition-all flex items-center pr-2">
                     <textarea #commentInput 
                         (keyup.enter)="addComment(commentInput.value); commentInput.value = ''"
                         (input)="checkForMention(commentInput)"
                         placeholder="Escreva um comentário..." 
                         class="flex-1 bg-transparent px-3 py-2 text-xs text-gray-700 focus:outline-none resize-none h-[40px] max-h-[80px] custom-scrollbar"></textarea>
                     
                     <!-- Dropdown (Moved here for Left Alignment) -->
                     <div *ngIf="showMentionDropdown" class="absolute bottom-full left-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-[60] overflow-hidden animate-fadeIn">
                        <div class="max-h-48 overflow-y-auto custom-scrollbar">
                            <div *ngFor="let member of members" (click)="selectMention(member, commentInput)" 
                                class="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center text-xs text-gray-700 transition-colors">
                                <!-- Avatar -->
                                <div class="w-5 h-5 rounded-full bg-gray-200 mr-2 overflow-hidden flex items-center justify-center text-[9px] font-bold text-gray-500 shrink-0">
                                    <img *ngIf="member.avatar_url" [src]="'' + member.avatar_url" class="w-full h-full object-cover">
                                    <span *ngIf="!member.avatar_url">{{ member.name.charAt(0) }}</span>
                                </div>
                                <span class="truncate">{{ member.name }}</span>
                            </div>
                            <div *ngIf="members.length === 0" class="p-2 text-xs text-center text-gray-400">
                                Nenhum membro.
                            </div>
                        </div>
                    </div>

                     <!-- Toolbar Actions -->
                     <div class="flex items-center space-x-3 pl-2 border-l border-gray-200 h-6">
                        
                        <!-- Attach -->
                        <button (click)="triggerAttachment()" class="text-gray-500 hover:text-gray-700 transition-colors p-1" title="Anexar arquivo">
                            <i class="fas fa-paperclip text-sm"></i>
                        </button>

                        <!-- Mention (Button Only) -->
                        <div class="relative">
                            <button (click)="insertMention(commentInput)" class="text-gray-500 hover:text-gray-700 transition-colors p-1" title="Marcar membro">
                                <i class="fas fa-at text-sm"></i>
                            </button>
                            <!-- Backdrop (Global) -->
                            <div *ngIf="showMentionDropdown" (click)="showMentionDropdown = false" class="fixed inset-0 z-[55] cursor-default"></div>
                        </div>

                        <!-- More (Placeholder) -->
                        <button class="text-gray-400 hover:text-gray-600 transition-colors p-1">
                            <i class="fas fa-ellipsis-h text-xs"></i>
                        </button>

                        <!-- Notification Count -->
                        <div class="flex items-center text-gray-500 cursor-default" title="Membros notificados">
                            <i class="far fa-bell text-sm mr-1"></i>
                            <span class="text-[10px] font-bold">{{ getNotificationCount() }}</span>
                        </div>

                        <!-- Send -->
                        <button (click)="addComment(commentInput.value); commentInput.value = ''" 
                             class="text-gray-500 hover:text-pink-600 transition-colors p-1">
                            <i class="fas fa-paper-plane text-sm"></i>
                        </button>
                     </div>
                 </div>
                 <div class="text-[9px] text-gray-400 mt-1 pl-1">Pressione Enter para enviar</div>
             </div>
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
export class CreateTaskDialogComponent implements OnInit, OnChanges {

    ngOnChanges(changes: SimpleChanges) {
        if (changes['spaceId'] && this.spaceId) {
            this.fetchMembers();
            this.fetchTags();
        }
    }
    @Input() listId?: string;
    @Input() spaceId?: string;
    @Input() listName: string = 'Lista';
    @Output() close = new EventEmitter<void>();
    @Output() created = new EventEmitter<{
        task: any;
        listId: string;
        spaceId?: string;
        folderId?: string;
    }>();
    @Input() task: any = null;
    @Input() parentTaskId?: string;
    @Input() initialStatus: string = 'todo';
    @Input() initialDate: Date | null = null;

    taskForm: FormGroup;
    isSubmitting = false;
    existingAttachments: any[] = [];
    files: File[] = [];

    members: any[] = [];
    selectedAssignees: string[] = [];
    showAssigneeDropdown = false;

    // Tags
    spaceTags: any[] = [];
    selectedTags: string[] = [];
    showTagDropdown = false;
    tagColors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#64748b'];
    selectedColor = '#ec4899';

    // Hierarchy Selection (for Global Add Task)
    spaces: any[] = [];
    folders: any[] = [];
    lists: any[] = [];

    selectedSpaceId: string | null = null;
    selectedFolderId: string | null = null;
    selectedListId: string | null = null;
    showHierarchyDropdown = false;

    // Custom Status Dropdown Logic
    showStatusDropdown = false;
    statusSearch = '';

    statusOptions = [
        { id: 'todo', label: 'PENDENTE', icon: 'far fa-circle', color: 'text-gray-400' },
        { id: 'planned', label: 'PLANEJADO', icon: 'far fa-circle', color: 'text-indigo-500' },
        { id: 'doing', label: 'EM ANDAMENTO', icon: 'far fa-circle', color: 'text-yellow-500' },
        { id: 'in_review', label: 'PARA REVISÃO', icon: 'far fa-circle', color: 'text-pink-500' },
        { id: 'approved', label: 'APROVADO', icon: 'fas fa-check-circle', color: 'text-teal-600' },
        { id: 'rejected', label: 'REJEITADO', icon: 'fas fa-times-circle', color: 'text-red-600' },
        { id: 'waiting', label: 'EM ESPERA', icon: 'fas fa-clock', color: 'text-amber-700' },
        { id: 'done', label: 'CONCLUÍDO', icon: 'fas fa-check-circle', color: 'text-green-600' }
    ];

    get filteredStatusOptions() {
        if (!this.statusSearch) return this.statusOptions;
        return this.statusOptions.filter(s =>
            s.label.toLowerCase().includes(this.statusSearch.toLowerCase())
        );
    }

    getCurrentStatusOption() {
        if (!this.taskForm) return this.statusOptions[0];
        const currentId = this.taskForm.get('status')?.value || 'todo';
        return this.statusOptions.find(s => s.id === currentId) || this.statusOptions[0];
    }

    setStatus(id: string) {
        this.taskForm.patchValue({ status: id });
        this.showStatusDropdown = false;
    }

    // Priority
    showPriorityDropdown = false;
    priorities = [
        { value: 'urgent', label: 'Urgente', colorClass: 'text-red-600' },
        { value: 'high', label: 'Alta', colorClass: 'text-yellow-500' }, // Changing High to Yellow/Orange (using yellow-500 for orange-ish) - user said High=Yellow/Orange
        { value: 'normal', label: 'Normal', colorClass: 'text-blue-500' }, // User said Normal=Blue
        { value: 'low', label: 'Baixa', colorClass: 'text-gray-400' } // User said Low=Gray
    ];

    // Activity
    activities: any[] = [];

    constructor(
        private fb: FormBuilder,
        private dataService: DataService,
        private sanitizer: DomSanitizer
    ) {
        this.taskForm = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            status: ['todo', Validators.required],
            priority: ['normal'],
            deadline: [null],
            // tags: [[]], // Managed via selectedTags
            // assignees: [[]] // Managed via selectedAssignees
        });
    }

    // Breadcrumb Path
    taskPath: string = '';

    ngOnInit() {
        // Carrega somente os usuários pertencentes ao espaço atual.
        // Evita expor usuários de outras empresas/espaços.
        if (this.spaceId) {
            this.fetchMembers();
        }

        // If we have a spaceId (even if no listId yet, or derived), fetch tags
        if (this.spaceId) {
            this.fetchTags();
        } else {
            // If no spaceId provided, we might need to fetch spaces to allow selection
            this.fetchSpaces();
        }

        // Fetch List Details for Path
        if (this.listId) {
            this.dataService.getList(this.listId).subscribe({
                next: (list: any) => {
                    if (list && list.folder && list.folder.space) {
                        this.taskPath = `${list.folder.space.name} > ${list.folder.name} > ${list.name}`;
                    } else {
                        this.taskPath = this.listName;
                    }
                },
                error: () => this.taskPath = this.listName
            });
        }

        if (this.task) {
            this.taskForm.patchValue({
                title: this.task.title,
                description: this.task.description,
                status: this.task.status,
                priority: this.task.priority,
                deadline: this.task.deadline ? new Date(this.task.deadline).toISOString().split('T')[0] : null
            });

            this.fetchActivities(); // Fetch logs

            if (this.task.assignees) {
                this.selectedAssignees = this.task.assignees.map((a: any) => a.user.id);
            }
            if (this.task.tags) {
                // Task tags come as [{tag: {id, name, color}}] or [{id, name, color}] depending on backend include?
                // Step 41 task.service uses `include: { tags: true }` but task_tags.
                // Wait, Task model has `tags TaskTag[]`.
                // TaskTag has `tag Tag`.
                // If I include `tags: { include: { tag: true } }`, then I get structure.
                // I should verify how tasks are fetched.
                // Assuming format from standard fetch.
                // If it's `task_tags`, then map.
                // I'll check if it's direct tags (custom flatten) or relation.
                // Assuming relation: tag.tag.id
                if (this.task.tags && this.task.tags.length > 0 && this.task.tags[0].tag) {
                    this.selectedTags = this.task.tags.map((t: any) => t.tag.id);
                } else if (this.task.tags && this.task.tags.length > 0 && this.task.tags[0].id) {
                    // Maybe it was flattened?
                    this.selectedTags = this.task.tags.map((t: any) => t.id);
                }
            }
            if (this.task.attachments) {
                this.existingAttachments = this.task.attachments;
            }
        } else {
            let deadline = null;
            if (this.initialDate) {
                const d = new Date(this.initialDate);
                const year = d.getFullYear();
                const month = (d.getMonth() + 1).toString().padStart(2, '0');
                const day = d.getDate().toString().padStart(2, '0');
                deadline = `${year}-${month}-${day}`;
            }

            this.taskForm.patchValue({
                status: this.initialStatus,
                deadline: deadline
            });
        }
    }

    deleteExistingAttachment(attachment: any) {
        if (confirm('Tem certeza que deseja remover este anexo?')) {
            this.dataService.deleteAttachment(attachment.id).subscribe({
                next: () => {
                    this.existingAttachments = this.existingAttachments.filter(a => a.id !== attachment.id);
                },
                error: (err) => alert('Erro ao remover anexo')
            });
        }
    }

    // Hierarchy Methods
    fetchSpaces() {
        this.dataService.getSpaces().subscribe({
            next: (spaces) => this.spaces = spaces,
            error: (err) => console.error('Error fetching spaces', err)
        });
    }

    onSpaceSelect(spaceId: string) {
        this.selectedSpaceId = spaceId;
        this.selectedFolderId = null;
        this.selectedListId = null;
        this.folders = [];
        this.lists = [];
        this.spaceId = spaceId; // Update local spaceId context
        this.fetchTags(); // Fetch tags for this space
        this.fetchMembers(); // Fetch only members from the selected space

        // Fetch folders for space
        this.dataService.getFolders(spaceId).subscribe({
            next: (folders: any[]) => {
                this.folders = folders || [];
            },
            error: (err) => {
                console.error('Error fetching folders:', err);
                this.folders = [];
            }
        });
    }

    onFolderSelect(folderId: string) {
        this.selectedFolderId = folderId;
        this.selectedListId = null;
        this.lists = [];

        const folder = this.folders.find(f => f.id === folderId);
        if (folder) {
            this.lists = folder.lists || [];
        }
    }

    onListSelect(listId: string) {
        this.selectedListId = listId;
        const list = this.lists.find(l => l.id === listId);
        if (list) {
            this.listName = list.name;
        }
    }

    get selectedSpaceName() {
        return this.spaces.find(s => s.id === this.selectedSpaceId)?.name || 'Selecione o Espaço';
    }

    get selectedFolderName() {
        return this.folders.find(f => f.id === this.selectedFolderId)?.name || 'Selecione a Pasta';
    }

    get selectedListName() {
        return this.lists.find(l => l.id === this.selectedListId)?.name || 'Selecione a Lista';
    }

    fetchDirectory() {
        // Mantido somente para telas administrativas que precisem
        // consultar o diretório global de usuários.
        this.dataService.getDirectory().subscribe({
            next: (users) => {
                this.members = users;
            },
            error: (err) => console.error('Error fetching directory:', err)
        });
    }

    fetchTags() {
        if (!this.spaceId) return;
        this.dataService.getSpaceTags(this.spaceId).subscribe({
            next: (tags) => this.spaceTags = tags,
            error: (err) => console.error('Error fetching tags:', err)
        });
    }

    fetchMembers() {
        const targetSpaceId = this.spaceId || this.selectedSpaceId;

        if (!targetSpaceId) {
            this.members = [];
            return;
        }

        this.dataService.getSpaceMembers(targetSpaceId).subscribe({
            next: (members: any[]) => {
                // A API pode retornar diretamente usuários ou registros
                // de associação no formato { user: {...} }.
                this.members = (members || [])
                    .map((member: any) => member.user ?? member)
                    .filter((user: any) => user && user.id);
            },
            error: (err) => {
                console.error('Error fetching space members:', err);
                this.members = [];
            }
        });
    }

    toggleAssignee(userId: string) {
        if (this.selectedAssignees.includes(userId)) {
            this.selectedAssignees = this.selectedAssignees.filter(id => id !== userId);
        } else {
            this.selectedAssignees.push(userId);
        }
    }

    isSelected(userId: string): boolean {
        return this.selectedAssignees.includes(userId);
    }

    getMemberName(userId: string): string {
        const member = this.members.find(m => m.id === userId);
        return member ? member.name.split(' ')[0] : 'User';
    }

    // Tag Methods
    toggleTag(tagId: string) {
        if (this.selectedTags.includes(tagId)) {
            this.selectedTags = this.selectedTags.filter(id => id !== tagId);
        } else {
            this.selectedTags.push(tagId);
        }
    }

    getTagName(tagId: string): string {
        const tag = this.spaceTags.find(t => t.id === tagId);
        return tag ? tag.name : '...';
    }

    getTagColor(tagId: string): string {
        const tag = this.spaceTags.find(t => t.id === tagId);
        return tag ? tag.color : '#ccc';
    }

    // Priority Helpers
    setPriority(value: string) {
        this.taskForm.patchValue({ priority: value });
        this.showPriorityDropdown = false;
    }

    getPriorityLabel(value: string): string {
        const p = this.priorities.find(x => x.value === value);
        return p ? p.label : 'Normal';
    }

    getPriorityColor(value: string): string {
        const p = this.priorities.find(x => x.value === value);
        if (!p) {
            // Fallback for 'medium' legacy
            if (value === 'medium') return 'text-blue-500';
            return 'text-blue-500';
        }
        return p.colorClass;
    }

    createTag(name: string) {
        if (!name.trim()) return;

        const targetSpaceId = this.spaceId || this.selectedSpaceId;

        if (!targetSpaceId) {
            alert('Selecione um espaço para criar a etiqueta.');
            return;
        }

        // Optimistic check?
        const existing = this.spaceTags.find(t => t.name.toLowerCase() === name.toLowerCase());
        if (existing) {
            this.toggleTag(existing.id);
            return;
        }

        this.dataService.createTag(targetSpaceId, { name, color: this.selectedColor }).subscribe({
            next: (newTag) => {
                this.spaceTags.push(newTag);
                this.selectedTags.push(newTag.id);
            },
            error: (err) => alert('Erro ao criar etiqueta: ' + err.message)
        });
    }

    deleteTag(tag: any) {
        if (confirm(`Excluir etiqueta "${tag.name}"? Isso a removerá de todas as tarefas.`)) {
            this.dataService.deleteTag(tag.id).subscribe({
                next: () => {
                    this.spaceTags = this.spaceTags.filter(t => t.id !== tag.id);
                    this.selectedTags = this.selectedTags.filter(id => id !== tag.id);
                },
                error: (err) => alert('Erro ao excluir: ' + err.message)
            })
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
        // Validate List Selection if global
        const targetListId = this.listId || this.selectedListId;

        if (!targetListId) {
            alert('Por favor, selecione uma lista de destino.');
            return;
        }

        if (this.taskForm.valid) {
            this.isSubmitting = true;

            const formValue = this.taskForm.value;
            const taskData = {
                title: formValue.title,
                description: formValue.description,
                status: formValue.status,
                deadline: formValue.deadline ? new Date(formValue.deadline).toISOString() : null,
                priority: formValue.priority,
                assigneeIds: this.selectedAssignees,
                tagIds: this.selectedTags // Added tagIds
            };
            if (this.parentTaskId && !this.task) {
                (taskData as any).parent_task_id = this.parentTaskId;
            }

            const request$ = this.task
                ? this.dataService.updateTask(this.task.id, taskData)
                : this.dataService.createTask(targetListId as string, { ...taskData, list_id: targetListId });

            request$.subscribe({
                next: (result: any) => {
                    const taskId = this.task ? this.task.id : result.id;

                    this.uploadFiles(taskId).subscribe({
                        next: () => {
                            this.created.emit({
                                task: result,
                                listId: targetListId as string,
                                spaceId:
                                    this.spaceId ||
                                    this.selectedSpaceId ||
                                    undefined,
                                folderId:
                                    this.selectedFolderId ||
                                    undefined,
                            });
                            this.close.emit();
                        },
                        error: (err: any) => {
                            console.error('Error uploading files:', err);
                            alert('Tarefa salva, mas erro ao enviar anexos.');
                            this.isSubmitting = false;
                            this.created.emit({
                                task: result,
                                listId: targetListId as string,
                                spaceId:
                                    this.spaceId ||
                                    this.selectedSpaceId ||
                                    undefined,
                                folderId:
                                    this.selectedFolderId ||
                                    undefined,
                            });
                            this.close.emit();
                        },
                        complete: () => {
                            this.isSubmitting = false;
                        }
                    });
                },
                error: (err: any) => {
                    console.error('Error saving task:', err);
                    alert('Erro ao salvar tarefa: ' + (err.error?.message || err.message));
                    this.isSubmitting = false;
                }
            });
        }
    }

    // Activity Methods
    fetchActivities() {
        if (!this.task || !this.task.id) return;
        this.dataService.getTaskActivities(this.task.id).subscribe({
            next: (logs) => this.activities = logs,
            error: (err) => console.error('Error fetching activities:', err)
        });
    }

    addComment(content: string) {
        if (!content.trim() || !this.task) return;
        this.dataService.addTaskComment(this.task.id, content).subscribe({
            next: (newLog) => {
                this.activities.push(newLog);
            },
            error: (err) => alert('Erro ao comentar: ' + err.message)
        });
    }

    uploadFiles(taskId: string) {
        if (this.files.length === 0) return of([]);

        const uploads = this.files.map(file => this.dataService.uploadAttachment(taskId, file));
        return forkJoin(uploads);
    }

    // Comment Toolbar Helpers
    triggerAttachment() {
        // Since we don't have a separate attachment flow for comments yet, 
        // we'll trigger the main file input or a new one. 
        // For now, let's auto-focus the main file input or just alert.
        // Or better, create a hidden input in the template and click it.
        const fileInput = document.getElementById('comment-file-input') as HTMLInputElement;
        if (fileInput) fileInput.click();
    }

    onCommentFileSelected(event: any) {
        // Handle comment attachment logic here
        // For MVP, just add to main files or separate? 
        // User asked to "attach a new file". Let's assume it adds to the task attachments for now.
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            // Immediately upload? or add to pending?
            // Let's add to pending files list for the task
            this.files.push(file);
            // Optional: Notify user
            alert(`Arquivo "${file.name}" adicionado à lista de anexos da tarefa.`);
        }
    }

    showMentionDropdown = false;

    checkForMention(inputElement: HTMLTextAreaElement) {
        const cursorPosition = inputElement.selectionStart;
        if (cursorPosition > 0) {
            const charBeforeCursor = inputElement.value.charAt(cursorPosition - 1);
            if (charBeforeCursor === '@') {
                this.showMentionDropdown = true;
            } else {
                // Optional: Hide if user backspaces away from @? 
                // For now, keep it simple. Only OPEN on @ type.
                // Closing handles itself on selection or backdrop click.
            }
        }
    }

    insertMention(inputElement: HTMLTextAreaElement) {
        this.showMentionDropdown = !this.showMentionDropdown;
        if (this.showMentionDropdown) {
            // Focus input is not needed here if we want to click the dropdown
            // But if we want to type to filter, we might need focus. 
            // For now, let's keep focus on input if possible or rely on dropdown click.
            inputElement.focus();
        }
    }

    selectMention(member: any, inputElement: HTMLTextAreaElement) {
        let start = inputElement.selectionStart;
        const end = inputElement.selectionEnd;
        const text = inputElement.value;

        let before = text.substring(0, start);
        const after = text.substring(end, text.length);

        // Remove preceding '@' if it exists (for typing case)
        if (before.endsWith('@')) {
            before = before.slice(0, -1);
            start--; // Adjust cursor position since we removed a char
        }

        // Insert @Name
        const mentionText = `@${member.name} `;
        inputElement.value = before + mentionText + after;

        // Move cursor
        inputElement.selectionStart = inputElement.selectionEnd = start + mentionText.length;

        this.showMentionDropdown = false;
        inputElement.focus();
    }

    getNotificationCount(): number {
        if (!this.task || !this.task.assignees) return 0;
        return this.task.assignees.length;
    }

    formatComment(content: string): SafeHtml {
        if (!content) return '';
        // Basic escaping to prevent XSS from other content
        let safeContent = content
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        // Build regex from member names to support spaces
        const memberNames = this.members
            .map(m => m.name) // Get names
            .filter(name => name) // Ensure not null
            .sort((a, b) => b.length - a.length) // Longest first to match full names
            .map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); // Escape regex chars

        // Pattern: @(Name One|Name Two|SimpleWord)
        // We include a fallback [\w\u00C0-\u00FF]+ for unknown users (single word)
        const patternString = `@(${memberNames.join('|')}|[\\w\\u00C0-\\u00FF]+)`;
        const regex = new RegExp(patternString, 'g');

        safeContent = safeContent.replace(regex, (match, name) => {
            // 'name' capture group might contain the full name including spaces
            return `<a class="text-blue-500 font-medium hover:underline cursor-pointer" onclick="event.stopPropagation()">@${name}</a>`;
        });

        // Also simple newline to br ?
        safeContent = safeContent.replace(/\n/g, '<br>');

        return this.sanitizer.bypassSecurityTrustHtml(safeContent);
    }
}
