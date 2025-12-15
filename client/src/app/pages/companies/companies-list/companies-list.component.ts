import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CreateCompanyDialogComponent } from '../dialogs/create-company-dialog/create-company-dialog.component';

@Component({
    selector: 'app-companies-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, CreateCompanyDialogComponent],
    template: `
    <div class="h-full flex flex-col bg-gray-50 overflow-hidden">
      <!-- Header -->
      <div class="px-8 py-6 bg-white border-b border-gray-200 sticky top-0 z-10">
         <div class="flex items-center justify-between mb-4">
             <h1 class="text-2xl font-bold text-gray-900 tracking-tight font-display">Empresas</h1>
             <div class="flex gap-2 relative">
                 <button (click)="toggleExportDropdown()" class="px-3 py-1.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center transition-colors"
                     [class.border-pink-500]="showExportDropdown()"
                     [class.text-pink-600]="showExportDropdown()">
                    <i class="fas fa-file-export mr-2"></i> Exportar
                    <i class="fas fa-chevron-down ml-2 text-[10px] transition-transform" [class.rotate-180]="showExportDropdown()"></i>
                 </button>

                 <!-- Export Dropdown -->
                 <div *ngIf="showExportDropdown()" class="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-fadeIn">
                     <div class="py-1">
                         <div class="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                             Formato
                         </div>
                         <button (click)="exportToCSV()" class="w-full px-4 py-2 flex items-center text-sm hover:bg-gray-50 text-gray-700 group transition-colors">
                             <div class="w-8 h-8 rounded bg-green-50 flex items-center justify-center mr-3 text-green-600 group-hover:bg-green-100 transition-colors">
                                 <i class="fas fa-file-csv"></i>
                             </div>
                             <span>CSV</span>
                         </button>
                         <button (click)="exportToJSON()" class="w-full px-4 py-2 flex items-center text-sm hover:bg-gray-50 text-gray-700 group transition-colors">
                            <div class="w-8 h-8 rounded bg-yellow-50 flex items-center justify-center mr-3 text-yellow-600 group-hover:bg-yellow-100 transition-colors">
                                <i class="fas fa-file-code"></i>
                            </div>
                            <span>JSON</span>
                        </button>
                     </div>
                 </div>

                 <button (click)="isCreateDialogOpen = true" class="px-4 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded text-sm font-bold shadow-md transition-all flex items-center">
                    <i class="fas fa-plus mr-2"></i> Nova Empresa
                 </button>
             </div>
         </div>
         
         <!-- Search -->
         <div class="flex flex-col gap-4">
            <div class="relative">
                <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input type="text" [(ngModel)]="searchTerm"
                       placeholder="Pesquisar empresas..." 
                       class="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-500 transition-colors shadow-sm">
            </div>
         </div>

         <!-- Filters -->
         <div class="flex flex-wrap items-center gap-3 mt-4">
            <!-- Status Filter -->
            <div class="relative">
                <button (click)="toggleDropdown('status')"
                        class="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center transition-colors min-w-[100px] justify-between"
                        [class.border-pink-500]="showStatusDropdown() || statusFilter() !== 'all'"
                        [class.text-pink-600]="showStatusDropdown() || statusFilter() !== 'all'">
                    <div class="flex items-center">
                        <span *ngIf="statusFilter() === 'all'">Status</span>
                        <span *ngIf="statusFilter() !== 'all'">Status <span class="mx-1">|</span> {{ statusFilter() === 'active' ? 'Ativo' : 'Inativo' }} <span class="ml-1">({{ getFilterCount('status', statusFilter()) }})</span></span>
                    </div>
                    <i class="fas fa-chevron-down ml-2 text-[10px] transition-transform" [class.rotate-180]="showStatusDropdown()"></i>
                </button>

                <div *ngIf="showStatusDropdown()" class="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-fadeIn">
                    <div class="py-1">
                        <button (click)="setStatusFilter('all')" class="w-full px-4 py-2 flex items-center justify-between text-sm hover:bg-gray-50 group border-b border-gray-100">
                            <div class="flex items-center w-full">
                                <i *ngIf="statusFilter() === 'all'" class="fas fa-check text-pink-600 mr-2 text-xs"></i>
                                <span [class.ml-5]="statusFilter() !== 'all'" [class.text-pink-600]="statusFilter() === 'all'" class="text-gray-700 font-medium flex-1 text-left">Todos</span>
                                <span class="text-xs text-gray-400 font-normal ml-2">{{ getFilterCount('status', 'all') }}</span>
                            </div>
                        </button>
                        
                        <button (click)="setStatusFilter('active')" class="w-full px-4 py-2 flex items-center justify-between text-sm hover:bg-gray-50 group">
                            <div class="flex items-center w-full">
                                <i *ngIf="statusFilter() === 'active'" class="fas fa-check text-pink-600 mr-2 text-xs"></i>
                                <span [class.ml-5]="statusFilter() !== 'active'" [class.text-pink-600]="statusFilter() === 'active'" class="text-gray-700 flex-1 text-left">Ativo</span>
                                <span class="text-xs text-gray-400 font-normal ml-2">{{ getFilterCount('status', 'active') }}</span>
                            </div>
                        </button>

                        <button (click)="setStatusFilter('inactive')" class="w-full px-4 py-2 flex items-center justify-between text-sm hover:bg-gray-50 group">
                            <div class="flex items-center w-full">
                                <i *ngIf="statusFilter() === 'inactive'" class="fas fa-check text-pink-600 mr-2 text-xs"></i>
                                <span [class.ml-5]="statusFilter() !== 'inactive'" [class.text-pink-600]="statusFilter() === 'inactive'" class="text-gray-700 flex-1 text-left">Inativo</span>
                                <span class="text-xs text-gray-400 font-normal ml-2">{{ getFilterCount('status', 'inactive') }}</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Niche Filter -->
            <div class="relative">
                <button (click)="toggleDropdown('niche')"
                        class="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center transition-colors min-w-[120px] justify-between"
                        [class.border-pink-500]="showNicheDropdown() || nicheFilter() !== 'all'"
                        [class.text-pink-600]="showNicheDropdown() || nicheFilter() !== 'all'">
                    <div class="flex items-center">
                        <span *ngIf="nicheFilter() === 'all'">Segmento</span>
                        <span *ngIf="nicheFilter() !== 'all'" class="truncate max-w-[150px]">Segmento <span class="mx-1">|</span> {{ nicheFilter() }} <span class="ml-1">({{ getFilterCount('niche', nicheFilter()) }})</span></span>
                    </div>
                    <i class="fas fa-chevron-down ml-2 text-[10px] transition-transform" [class.rotate-180]="showNicheDropdown()"></i>
                </button>

                <div *ngIf="showNicheDropdown()" class="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-fadeIn max-h-64 overflow-y-auto custom-scrollbar">
                    <div class="py-1">
                        <button (click)="setNicheFilter('all')" class="w-full px-4 py-2 flex items-center justify-between text-sm hover:bg-gray-50 group border-b border-gray-100">
                            <div class="flex items-center w-full">
                                <i *ngIf="nicheFilter() === 'all'" class="fas fa-check text-pink-600 mr-2 text-xs"></i>
                                <span [class.ml-5]="nicheFilter() !== 'all'" [class.text-pink-600]="nicheFilter() === 'all'" class="text-gray-700 font-medium flex-1 text-left">Todos</span>
                                <span class="text-xs text-gray-400 font-normal ml-2">{{ getFilterCount('niche', 'all') }}</span>
                            </div>
                        </button>

                        <button *ngFor="let niche of uniqueNiches()" (click)="setNicheFilter(niche)" class="w-full px-4 py-2 flex items-center justify-between text-sm hover:bg-gray-50 group">
                            <div class="flex items-center w-full">
                                <i *ngIf="nicheFilter() === niche" class="fas fa-check text-pink-600 mr-2 text-xs"></i>
                                <span [class.ml-5]="nicheFilter() !== niche" [class.text-pink-600]="nicheFilter() === niche" class="text-gray-700 truncate text-left flex-1">{{ niche }}</span>
                                <span class="text-xs text-gray-400 font-normal ml-2">{{ getFilterCount('niche', niche) }}</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Professional Filter -->
            <div class="relative">
                <button (click)="toggleDropdown('member')"
                        class="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center transition-colors min-w-[120px] justify-between"
                        [class.border-pink-500]="showMemberDropdown() || memberFilter() !== 'all'"
                        [class.text-pink-600]="showMemberDropdown() || memberFilter() !== 'all'">
                    <div class="flex items-center">
                        <span *ngIf="memberFilter() === 'all'">Profissional</span>
                        <span *ngIf="memberFilter() !== 'all'" class="truncate max-w-[150px]">Profissional <span class="mx-1">|</span> {{ getMemberName(memberFilter()) }} <span class="ml-1">({{ getFilterCount('member', memberFilter()) }})</span></span>
                    </div>
                    <i class="fas fa-chevron-down ml-2 text-[10px] transition-transform" [class.rotate-180]="showMemberDropdown()"></i>
                </button>

                <div *ngIf="showMemberDropdown()" class="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-fadeIn max-h-64 overflow-y-auto custom-scrollbar">
                    <div class="py-1">
                        <button (click)="setMemberFilter('all')" class="w-full px-4 py-2 flex items-center justify-between text-sm hover:bg-gray-50 group border-b border-gray-100">
                            <div class="flex items-center w-full">
                                <i *ngIf="memberFilter() === 'all'" class="fas fa-check text-pink-600 mr-2 text-xs"></i>
                                <span [class.ml-5]="memberFilter() !== 'all'" [class.text-pink-600]="memberFilter() === 'all'" class="text-gray-700 font-medium flex-1 text-left">Todos</span>
                                <span class="text-xs text-gray-400 font-normal ml-2">{{ getFilterCount('member', 'all') }}</span>
                            </div>
                        </button>

                        <button *ngFor="let member of uniqueMembers()" (click)="setMemberFilter(member.id)" class="w-full px-4 py-2 flex items-center justify-between text-sm hover:bg-gray-50 group">
                            <div class="flex items-center w-full">
                                <i *ngIf="memberFilter() === member.id" class="fas fa-check text-pink-600 mr-2 text-xs shrink-0"></i>
                                <span [class.ml-5]="memberFilter() !== member.id" [class.text-pink-600]="memberFilter() === member.id" class="text-gray-700 truncate text-left block flex-1">{{ member.name }}</span>
                                <span class="text-xs text-gray-400 font-normal ml-2">{{ getFilterCount('member', member.id) }}</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Reset Filters -->
            <button *ngIf="hasActiveFilters()" (click)="resetFilters()"
                    class="px-3 py-2 text-sm text-red-500 hover:text-red-700 font-medium hover:bg-red-50 rounded-lg transition-colors"
                    title="Limpar filtros">
                <i class="fas fa-times mr-1"></i> Limpar
            </button>

            <!-- View Toggle (Right Aligned) -->
            <div class="ml-auto bg-white border border-gray-200 rounded-lg p-1 flex items-center">
                <button (click)="setView('grid')" class="p-2 rounded-md transition-all"
                        [class.bg-pink-50]="viewMode() === 'grid'"
                        [class.text-pink-600]="viewMode() === 'grid'"
                        [class.text-gray-400]="viewMode() !== 'grid'">
                    <i class="fas fa-th-large"></i>
                </button>
                <button (click)="setView('list')" class="p-2 rounded-md transition-all"
                        [class.bg-pink-50]="viewMode() === 'list'"
                        [class.text-pink-600]="viewMode() === 'list'"
                        [class.text-gray-400]="viewMode() !== 'list'">
                    <i class="fas fa-list"></i>
                </button>
            </div>
         </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div *ngIf="isLoading()" class="flex justify-center py-20">
             <i class="fas fa-circle-notch fa-spin text-4xl text-pink-500"></i>
          </div>

          <!-- GRID VIEW -->
          <div *ngIf="!isLoading() && viewMode() === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
              <div *ngFor="let company of filteredCompanies()" [routerLink]="['/companies', company.id]"
                   class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-pink-200 transition-all cursor-pointer group flex flex-col relative overflow-hidden">

                   <div class="absolute top-0 left-0 w-1 h-full bg-pink-500 transform -translate-x-full group-hover:translate-x-0 transition-transform"></div>

                   <div class="flex items-center justify-between mb-4">
                       <div class="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                           <i class="fas fa-building text-xl"></i>
                       </div>
                       <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 border border-green-200" *ngIf="company.status === 'active'">Ativo</span>
                       <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200" *ngIf="company.status !== 'active'">Inativo</span>
                   </div>

                   <h3 class="font-bold text-gray-900 text-lg mb-1 group-hover:text-pink-600 transition-colors">{{ company.name }}</h3>
                   <p class="text-xs text-gray-500 mb-4">{{ company.niche || 'Nicho não definido' }}</p>

                   <div class="mt-auto border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-gray-500">
                       <span class="flex items-center"><i class="fas fa-users mr-1.5"></i> {{ company.members?.length || 0 }} membros</span>
                       <span class="flex items-center"><i class="fas fa-clock mr-1.5"></i> {{ company.created_at | date:'dd/MM/yy' }}</span>
                   </div>
              </div>
          </div>

          <!-- LIST VIEW -->
          <div *ngIf="!isLoading() && viewMode() === 'list'" class="bg-white rounded-xl border border-gray-200 overflow-hidden animate-fadeIn">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                            <th class="px-6 py-4 font-semibold">Empresa</th>
                            <th class="px-6 py-4 font-semibold">Status</th>
                            <th class="px-6 py-4 font-semibold">Nicho</th>
                            <th class="px-6 py-4 font-semibold">Membros</th>
                            <th class="px-6 py-4 font-semibold">Contrato</th>
                            <th class="px-6 py-4 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr *ngFor="let company of filteredCompanies()" [routerLink]="['/companies', company.id]" class="hover:bg-gray-50 transition-colors cursor-pointer group">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <i class="fas fa-building text-sm"></i>
                                    </div>
                                    <span class="font-medium text-gray-900 group-hover:text-pink-600 transition-colors">{{ company.name }}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 border border-green-200" *ngIf="company.status === 'active'">Ativo</span>
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200" *ngIf="company.status !== 'active'">Inativo</span>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-500">
                                {{ company.niche || '--' }}
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex -space-x-2">
                                    <div *ngFor="let member of company.members; let i = index"
                                         class="w-6 h-6 rounded-full bg-gray-200 border border-white flex items-center justify-center text-[8px] font-bold text-gray-600 overflow-hidden"
                                         [class.hidden]="i > 3"
                                         [title]="member.user?.name">
                                        {{ member.user?.name?.charAt(0) }}
                                    </div>
                                    <div *ngIf="company.members?.length > 4" class="w-6 h-6 rounded-full bg-gray-100 border border-white flex items-center justify-center text-[8px] text-gray-500">
                                        +{{ company.members.length - 4 }}
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-500">
                                {{ company.contract_due ? (company.contract_due | date: 'dd/MM/yyyy') : '--' }}
                            </td>
                            <td class="px-6 py-4 text-right">
                                <i class="fas fa-chevron-right text-gray-300 group-hover:text-pink-400 transition-colors"></i>
                            </td>
                        </tr>
                    </tbody>
                </table>
          </div>
          
           <div *ngIf="!isLoading() && filteredCompanies().length === 0" class="text-center py-20">
                <p class="text-gray-400 text-lg">Nenhuma empresa encontrada.</p>
           </div>
    </div>
    
    <!-- Create Dialog -->
    <app-create-company-dialog *ngIf="isCreateDialogOpen" 
        (closeDialog)="isCreateDialogOpen = false"
        (saveCompany)="onSaveCompany($event)">
    </app-create-company-dialog>
    `
})
export class CompaniesListComponent implements OnInit {
    companies = signal<any[]>([]);
    isLoading = signal<boolean>(false);
    viewMode = signal<'grid' | 'list'>('grid');
    searchTerm = '';

    // New property for Dialog
    isCreateDialogOpen = false;

    // Filters
    statusFilter = signal<string>('all');
    nicheFilter = signal<string>('all');
    memberFilter = signal<string>('all');

    // Dropdown visibility
    showStatusDropdown = signal<boolean>(false);
    showNicheDropdown = signal<boolean>(false);
    showMemberDropdown = signal<boolean>(false);
    showExportDropdown = signal<boolean>(false);

    constructor(private dataService: DataService) { }

    ngOnInit() {
        this.loadCompanies();
    }

    loadCompanies() {
        this.isLoading.set(true);
        this.dataService.getCompanies().subscribe({
            next: (data) => {
                this.companies.set(data);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error(err);
                this.isLoading.set(false);
            }
        });
    }

    onSaveCompany(companyData: any) {
        this.isLoading.set(true);
        this.dataService.createCompany(companyData).subscribe({
            next: (newCompany) => {
                this.loadCompanies(); // Refresh list
                this.isCreateDialogOpen = false;
            },
            error: (err) => {
                console.error('Error creating company', err);
                this.isLoading.set(false);
                // Here you might want to show a toast/notification
            }
        });
    }

    filteredCompanies() {
        let result = this.companies();

        // Search
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            result = result.filter(c => c.name.toLowerCase().includes(term));
        }

        // Status Filter
        if (this.statusFilter() !== 'all') {
            result = result.filter(c => c.status === this.statusFilter());
        }

        // Niche Filter
        if (this.nicheFilter() !== 'all') {
            result = result.filter(c => c.niche === this.nicheFilter());
        }

        // Member Filter
        if (this.memberFilter() !== 'all') {
            result = result.filter(c => c.members?.some((m: any) => m.user.id === this.memberFilter()));
        }

        return result;
    }

    uniqueNiches() {
        const niches = this.companies().map(c => c.niche).filter(n => !!n);
        return [...new Set(niches)].sort();
    }

    uniqueMembers() {
        const membersMap = new Map();
        this.companies().forEach(c => {
            c.members?.forEach((m: any) => {
                if (m.user && !membersMap.has(m.user.id)) {
                    membersMap.set(m.user.id, { id: m.user.id, name: m.user.name });
                }
            });
        });
        return Array.from(membersMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }

    hasActiveFilters() {
        return this.statusFilter() !== 'all' || this.nicheFilter() !== 'all' || this.memberFilter() !== 'all';
    }

    resetFilters() {
        this.statusFilter.set('all');
        this.nicheFilter.set('all');
        this.memberFilter.set('all');
        this.searchTerm = '';
        this.closeAllDropdowns();
    }

    setView(mode: 'grid' | 'list') {
        this.viewMode.set(mode);
    }

    // Dropdown Logic
    toggleDropdown(type: 'status' | 'niche' | 'member') {
        if (type === 'status') {
            this.showStatusDropdown.update(v => !v);
            this.showNicheDropdown.set(false);
            this.showMemberDropdown.set(false);
            this.showExportDropdown.set(false);
        } else if (type === 'niche') {
            this.showNicheDropdown.update(v => !v);
            this.showStatusDropdown.set(false);
            this.showMemberDropdown.set(false);
            this.showExportDropdown.set(false);
        } else if (type === 'member') {
            this.showMemberDropdown.update(v => !v);
            this.showStatusDropdown.set(false);
            this.showNicheDropdown.set(false);
            this.showExportDropdown.set(false);
        }
    }

    toggleExportDropdown() {
        this.showExportDropdown.update(v => !v);
        this.showStatusDropdown.set(false);
        this.showNicheDropdown.set(false);
        this.showMemberDropdown.set(false);
    }

    closeAllDropdowns() {
        this.showStatusDropdown.set(false);
        this.showNicheDropdown.set(false);
        this.showMemberDropdown.set(false);
        this.showExportDropdown.set(false);
    }

    setStatusFilter(value: string) {
        this.statusFilter.set(value);
        this.closeAllDropdowns();
    }

    setNicheFilter(value: string) {
        this.nicheFilter.set(value);
        this.closeAllDropdowns();
    }

    setMemberFilter(value: string) {
        this.memberFilter.set(value);
        this.closeAllDropdowns();
    }

    getMemberName(id: string): string {
        if (id === 'all') return 'Todos';
        const member = this.uniqueMembers().find(m => m.id === id);
        return member ? member.name : 'Unknown';
    }

    getFilterCount(type: 'status' | 'niche' | 'member', value: string): number {
        if (value === 'all') return this.companies().length;

        switch (type) {
            case 'status':
                return this.companies().filter(c => c.status === value).length;
            case 'niche':
                return this.companies().filter(c => c.niche === value).length;
            case 'member':
                return this.companies().filter(c => c.members?.some((m: any) => m.user.id === value)).length;
            default:
                return 0;
        }
    }

    exportToCSV() {
        const data = this.filteredCompanies().map(company => ({
            Nome: company.name,
            Nicho: company.niche || 'N/A',
            Status: company.status === 'active' ? 'Ativo' : 'Inativo',
            Membros: company.members?.map((m: any) => m.user.name).join('; ') || 'Nenhum',
            Contrato: company.contract_due ? new Date(company.contract_due).toLocaleDateString() : 'N/A'
        }));

        if (data.length === 0) return;

        const headers = Object.keys(data[0]).join(',');
        const csvContent = [
            headers,
            ...data.map(row => Object.values(row).map(val => `"${val}"`).join(',')) // Quote values to handle commas in content
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', 'empresas_export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showExportDropdown.set(false);
    }

    exportToJSON() {
        const data = this.filteredCompanies();
        if (data.length === 0) return;

        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', 'empresas_export.json');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showExportDropdown.set(false);
    }
}
