
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { AddMemberDialogComponent } from '../dialogs/add-member-dialog/add-member-dialog.component';
import { EditCompanyDialogComponent } from '../dialogs/edit-company-dialog/edit-company-dialog.component';
import { ConfirmationDialogComponent } from '../../../components/confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'app-company-details',
    standalone: true,
    imports: [CommonModule, RouterModule, AddMemberDialogComponent, EditCompanyDialogComponent, ConfirmationDialogComponent],
    template: `
    <div class="h-full flex flex-col bg-gray-50 overflow-hidden">
       <!-- Header -->
       <div class="bg-white border-b border-gray-200 px-8 py-6">
           <div class="flex items-center gap-2 mb-2 text-sm text-gray-500">
               <a routerLink="/companies" class="hover:text-pink-600 transition-colors">Empresas</a>
               <i class="fas fa-chevron-right text-xs"></i>
               <span>Detalhes</span>
           </div>
           
           <div class="flex items-start justify-between">
               <div class="flex items-center gap-4">
                   <div class="w-16 h-16 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl shadow-sm">
                       <i class="fas fa-building"></i>
                   </div>
                   <div>
                       <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ company?.name }}</h1>
                       <div class="flex items-center gap-3 mt-1">
                           <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-green-100 text-green-700 border border-green-200" *ngIf="company?.status === 'active'">
                               Ativo
                           </span>
                           <span class="text-sm text-gray-500 border-l border-gray-300 pl-3">
                                Contrato vence em: <span class="font-medium text-gray-700">{{ company?.contract_due ? (company?.contract_due | date:'dd/MM/yyyy') : 'N/A' }}</span>
                           </span>
                       </div>
                   </div>
               </div>
               <div class="flex items-center gap-3">
                   <button (click)="openEditDialog()" class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                       Editar Empresa
                   </button>
                   <button (click)="confirmDelete()" class="px-4 py-2 border border-red-200 bg-red-50 rounded-lg text-sm font-medium text-red-600 hover:bg-red-100 transition-colors">
                       <i class="fas fa-trash-alt mr-2"></i> Excluir
                   </button>
                </div>
           </div>

           <!-- Tabs -->
           <div class="flex items-center gap-1 mt-8 border-b border-gray-200">
               <button (click)="activeTab = 'general'" 
                   class="px-6 py-3 text-sm font-medium border-b-2 transition-colors relative top-[1px]"
                   [class.border-pink-500]="activeTab === 'general'"
                   [class.text-pink-600]="activeTab === 'general'"
                   [class.border-transparent]="activeTab !== 'general'"
                   [class.text-gray-500]="activeTab !== 'general'">
                   <i class="fas fa-info-circle mr-2"></i> Dados Gerais
               </button>
               <button (click)="activeTab = 'team'" 
                   class="px-6 py-3 text-sm font-medium border-b-2 transition-colors relative top-[1px]"
                   [class.border-pink-500]="activeTab === 'team'"
                   [class.text-pink-600]="activeTab === 'team'"
                   [class.border-transparent]="activeTab !== 'team'"
                   [class.text-gray-500]="activeTab !== 'team'">
                   <i class="fas fa-users mr-2"></i> Equipe
               </button>
           </div>
       </div>

       <!-- Content -->
       <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
           
           <!-- Loading -->
           <div *ngIf="isLoading" class="flex justify-center py-20">
               <i class="fas fa-circle-notch fa-spin text-4xl text-pink-500"></i>
           </div>

           <ng-container *ngIf="!isLoading && company">
               
               <!-- TEAM TAB -->
               <div *ngIf="activeTab === 'team'" class="animate-fadeIn">
                   
                   <div class="flex justify-end mb-6">
                       <button (click)="openAddMemberDialog()" class="px-4 py-2 bg-pink-50 text-pink-600 hover:bg-pink-100 rounded-lg text-sm font-medium border border-pink-100 transition-colors">
                           <i class="fas fa-user-plus mr-2"></i> Adicionar Profissional
                       </button>
                   </div>

                   <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       <div *ngFor="let member of company.members" [routerLink]="['/team', member.user.id]" class="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer group relative">
                            <button (click)="initiateRemoveMember($event, member)" class="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 z-10" title="Remover da empresa">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                            
                            <div class="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                                <img *ngIf="member.user.avatar_url" [src]="member.user.avatar_url" class="w-full h-full object-cover">
                                <div *ngIf="!member.user.avatar_url" class="w-full h-full flex items-center justify-center text-gray-500 font-bold text-lg bg-indigo-50 text-indigo-600">
                                    {{ getInitials(member.user.name) }}
                                </div>
                            </div>
                            <div>
                                <h3 class="font-bold text-gray-900">{{ member.user.name }}</h3>
                                <p class="text-xs text-gray-500 mb-2">{{ member.user.email }}</p>
                                <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                    {{ member.role }}
                                </span>
                            </div>
                       </div>
                   </div>
                   
                   <div *ngIf="company.members.length === 0" class="text-center py-10 text-gray-400">
                       Nenhum profissional atribuído a esta empresa.
                   </div>
               </div>

               <!-- GENERAL INFO TAB -->
               <div *ngIf="activeTab === 'general'" class="animate-fadeIn max-w-4xl">
                   <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                       <div class="px-6 py-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700">
                           Informações do Contrato
                       </div>
                       <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                           <div>
                               <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</label>
                               <p class="text-gray-900 font-medium capitalize">{{ company.status }}</p>
                           </div>
                           <div>
                               <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nicho</label>
                               <p class="text-gray-900 font-medium">{{ company.niche || '--' }}</p>
                           </div>
                           <div>
                               <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Data de Início</label>
                               <p class="text-gray-900 font-medium">{{ company.start_date ? (company.start_date | date:'dd/MM/yyyy') : '--' }}</p>
                           </div>
                           <div>
                               <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Vencimento do Contrato</label>
                               <p class="text-gray-900 font-medium">{{ company.contract_due ? (company.contract_due | date:'dd/MM/yyyy') : '--' }}</p>
                           </div>
                           <div>
                               <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Valor do Contrato</label>
                               <p class="text-gray-900 font-medium">{{ company.contract_value ? (company.contract_value | currency:'BRL') : '--' }}</p>
                           </div>
                           <div>
                               <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cota de Conteúdos</label>
                               <p class="text-gray-900 font-medium">{{ company.content_quota ? company.content_quota + ' / mês' : '--' }}</p>
                           </div>
                            <div>
                               <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tipo de Parceria</label>
                               <p class="text-gray-900 font-medium">{{ company.partnership_type || '--' }}</p>
                           </div>
                            <div>
                               <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Investimento</label>
                               <p class="text-gray-900 font-medium">{{ company.investment ? (company.investment | currency:'BRL') : '--' }}</p>
                           </div>
                       </div>
                   </div>
               </div>
               

           </ng-container>
       </div>
       
       <!-- Edit Member Dialog -->
       <app-edit-company-dialog *ngIf="isEditDialogOpen"
            [company]="company"
            (closeDialog)="isEditDialogOpen = false"
            (saveCompany)="onEditCompany($event)">
       </app-edit-company-dialog>

       <!-- Add Member Dialog -->
       <app-add-member-dialog *ngIf="isAddMemberDialogOpen"
            [existingMemberIds]="getExistingMemberIds()"
            (closeDialog)="isAddMemberDialogOpen = false"
            (addMember)="onAddMember($event)">
       </app-add-member-dialog>

       <!-- Confirmation Dialog -->
       <app-confirmation-dialog *ngIf="isConfirmDialogOpen"
            [title]="confirmDialogTitle"
            [message]="confirmDialogMessage"
            (confirm)="onConfirmAction()"
            (cancel)="isConfirmDialogOpen = false">
       </app-confirmation-dialog>
    </div>
  `
})
export class CompanyDetailsComponent implements OnInit {
    company: any = null;
    isLoading = false;
    activeTab: 'team' | 'general' = 'general';

    // Confirmation Logic
    isConfirmDialogOpen = false;
    confirmDialogTitle = '';
    confirmDialogMessage = '';
    pendingAction: (() => void) | null = null;

    constructor(
        private route: ActivatedRoute,
        private dataService: DataService
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) this.loadCompany(id);
        });
    }

    loadCompany(id: string) {
        this.isLoading = true;
        this.dataService.getCompany(id).subscribe({
            next: (data) => {
                this.company = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error(err);
                this.isLoading = false;
            }
        });
    }

    getInitials(name: string): string {
        return name ? name.substring(0, 2).toUpperCase() : '??';
    }

    // Add Member Logic
    isAddMemberDialogOpen = false;

    openAddMemberDialog() {
        console.log('Opening Add Member Dialog');
        this.isAddMemberDialogOpen = true;
    }

    getExistingMemberIds(): string[] {
        return this.company?.members?.map((m: any) => m.user.id) || [];
    }

    onAddMember(data: { userId: string, role: string }) {
        console.log('Adding member:', data);
        if (!this.company?.id) return;

        this.isLoading = true;
        this.dataService.addCompanyMember(this.company.id, data.userId, data.role).subscribe({
            next: () => {
                console.log('Member added successfully');
                this.loadCompany(this.company.id); // Refresh
                this.isAddMemberDialogOpen = false;
            },
            error: (err) => {
                console.error('Error adding member', err);
                this.isLoading = false;
                // Ideally show a toast
            }
        });
    }

    initiateRemoveMember(event: Event, member: any) {
        event.stopPropagation(); // Prevent navigation to profile
        event.preventDefault(); // Extra safety

        this.confirmDialogTitle = 'Remover Profissional';
        this.confirmDialogMessage = `Tem certeza que deseja remover ${member.user.name} desta empresa?`;
        this.pendingAction = () => {
            this.isLoading = true;
            this.dataService.removeCompanyMember(this.company.id, member.user.id).subscribe({
                next: () => {
                    this.loadCompany(this.company.id);
                },
                error: (err) => {
                    console.error('Error removing member', err);
                    this.isLoading = false;
                }
            });
        };
        this.isConfirmDialogOpen = true;
    }

    onConfirmAction() {
        if (this.pendingAction) {
            this.pendingAction();
            this.pendingAction = null;
        }
        this.isConfirmDialogOpen = false;
    }

    // Edit Company Logic
    isEditDialogOpen = false;

    openEditDialog() {
        console.log('Opening Edit Dialog');
        this.isEditDialogOpen = true;
    }

    onEditCompany(data: any) {
        console.log('Editing company:', data);
        if (!this.company?.id) return;

        this.isLoading = true;
        this.dataService.updateCompany(this.company.id, data).subscribe({
            next: (updatedCompany) => {
                console.log('Company updated');
                this.company = { ...this.company, ...updatedCompany }; // Optimistic update or full refresh
                this.loadCompany(this.company.id);
                this.isEditDialogOpen = false;
            },
            error: (err) => {
                console.error('Error updating company', err);
                this.isLoading = false;
            }
        });
    }

    confirmDelete() {
        if (!this.company) return;

        this.confirmDialogTitle = 'Excluir Empresa';
        this.confirmDialogMessage = `Tem certeza que deseja excluir a empresa "${this.company.name}"? Esta ação não pode ser desfeita.`;
        this.pendingAction = () => {
            this.isLoading = true;
            this.dataService.deleteCompany(this.company.id).subscribe({
                next: () => {
                    // Redirect to list
                    window.location.href = '/companies';
                },
                error: (err) => {
                    console.error('Error deleting company', err);
                    this.isLoading = false;
                    alert('Erro ao excluir empresa. Tente novamente.');
                }
            });
        };
        this.isConfirmDialogOpen = true;
    }
}
