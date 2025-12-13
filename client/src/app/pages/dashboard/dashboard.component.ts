
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="h-full flex flex-col bg-gray-50 overflow-hidden">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200 px-8 py-6">
        <div class="flex items-center justify-between mb-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Administrativo</h1>
                 <p class="text-gray-500 mt-1">Visão geral do desempenho e produtividade</p>
            </div>
            
            <!-- Tabs -->
            <div class="bg-gray-100 p-1 rounded-lg flex gap-1">
                <button (click)="activeTab = 'overview'" 
                        [class.bg-white]="activeTab === 'overview'"
                        [class.shadow-sm]="activeTab === 'overview'"
                        [class.text-pink-600]="activeTab === 'overview'"
                        class="px-4 py-2 text-sm font-medium rounded-md transition-all text-gray-600 hover:text-gray-900">
                    Visão Geral
                </button>
                <button (click)="activeTab = 'production'" 
                        [class.bg-white]="activeTab === 'production'"
                        [class.shadow-sm]="activeTab === 'production'"
                        [class.text-pink-600]="activeTab === 'production'"
                        class="px-4 py-2 text-sm font-medium rounded-md transition-all text-gray-600 hover:text-gray-900">
                    Produção da Equipe
                </button>
            </div>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
        
        <div *ngIf="isLoading" class="flex justify-center py-20">
          <i class="fas fa-circle-notch fa-spin text-4xl text-pink-500"></i>
        </div>

        <!-- OVERVIEW TAB -->
        <div *ngIf="!isLoading && metrics && activeTab === 'overview'" class="animate-fadeIn max-w-7xl mx-auto">
          
          <!-- Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <!-- Active Companies -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-6">
              <div class="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
                <i class="fas fa-building"></i>
              </div>
              <div>
                <p class="text-sm font-bold text-gray-400 uppercase tracking-wider">Empresas Ativas</p>
                <p class="text-3xl font-extrabold text-gray-900">{{ metrics.active_companies_count }}</p>
              </div>
            </div>

            <!-- Total Revenue -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-6">
              <div class="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-2xl">
                <i class="fas fa-dollar-sign"></i>
              </div>
              <div>
                <p class="text-sm font-bold text-gray-400 uppercase tracking-wider">Faturamento Mensal</p>
                <p class="text-3xl font-extrabold text-gray-900">{{ metrics.total_active_value | currency:'BRL' }}</p>
              </div>
            </div>

             <!-- Active Consultants -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-6">
              <div class="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-2xl">
                <i class="fas fa-users-cog"></i>
              </div>
              <div>
                <p class="text-sm font-bold text-gray-400 uppercase tracking-wider">Consultoras Ativas</p>
                <p class="text-3xl font-extrabold text-gray-900">{{ metrics.consultant_ranking.length }}</p>
              </div>
            </div>
          </div>

          <!-- Ranking Table -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 class="font-bold text-lg text-gray-800">Ranking de Consultoras e Comissões</h2>
              <span class="text-xs font-semibold bg-gray-200 text-gray-600 px-2 py-1 rounded">Base: 15%</span>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="text-xs font-bold text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                    <th class="px-6 py-4">Consultora</th>
                    <th class="px-6 py-4 text-center">Empresas</th>
                    <th class="px-6 py-4 text-right">Valor Gerido</th>
                    <th class="px-6 py-4 text-right">Comissão (15%)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <ng-container *ngFor="let item of metrics.consultant_ranking">
                    <tr class="hover:bg-gray-50 transition-colors cursor-pointer group" (click)="toggleExpand(item.id)">
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                           <div class="mr-2 text-gray-400 text-xs transition-transform duration-200"
                                [class.rotate-90]="expandedConsultantId === item.id">
                                ▶
                           </div>
                           <div class="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                              <img *ngIf="item.avatar_url" [src]="item.avatar_url" class="w-full h-full object-cover">
                              <div *ngIf="!item.avatar_url" class="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">
                                  {{ item.name.substring(0,2).toUpperCase() }}
                              </div>
                           </div>
                           <div>
                              <p class="font-bold text-gray-900 group-hover:text-pink-600 transition-colors">{{ item.name }}</p>
                           </div>
                        </div>
                      </td>
                    <td class="px-6 py-4 text-center">
                      <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm">
                        {{ item.companies_count }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right font-medium text-gray-600">
                      {{ item.total_managed_value | currency:'BRL' }}
                    </td>
                    <td class="px-6 py-4 text-right font-bold text-green-600">
                      {{ item.commission | currency:'BRL' }}
                    </td>
                  </tr>

                  <!-- Expanded Details -->
                  <tr *ngIf="expandedConsultantId === item.id" class="bg-gray-50/50">
                    <td colspan="4" class="px-6 py-4">
                        <div class="ml-16 border rounded-lg overflow-hidden bg-white shadow-sm">
                            <div class="px-4 py-2 bg-gray-100 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                                Portfólio de Empresas
                            </div>
                            <table class="w-full text-sm">
                                <thead class="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th class="px-4 py-2 text-left font-medium">Empresa</th>
                                        <th class="px-4 py-2 text-right font-medium">Valor Mensal</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    <tr *ngFor="let company of item.active_companies">
                                        <td class="px-4 py-2 text-gray-700 font-medium">
                                            <a [routerLink]="['/companies', company.id]" class="hover:text-pink-600 cursor-pointer">
                                                {{ company.name }}
                                            </a>
                                        </td>
                                        <td class="px-4 py-2 text-right text-gray-600">{{ company.value | currency:'BRL' }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </td>
                  </tr>
                  </ng-container>
                  
                  <tr *ngIf="metrics.consultant_ranking.length === 0">
                    <td colspan="4" class="px-6 py-10 text-center text-gray-400">
                      Nenhuma consultora encontrada com empresas ativas.
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- PRODUCTION TAB -->
        <div *ngIf="!isLoading && productionMetrics && activeTab === 'production'" class="animate-fadeIn max-w-7xl mx-auto space-y-8">
            
            <!-- Alert Section -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Overdue Tasks -->
                <div class="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
                    <div class="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center gap-3">
                         <div class="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                            <i class="fas fa-exclamation-triangle"></i>
                         </div>
                         <div>
                             <h3 class="font-bold text-red-800">Tarefas Vencidas</h3>
                             <p class="text-xs text-red-600">Atenção requerida</p>
                         </div>
                         <span class="ml-auto bg-red-200 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                            {{ productionMetrics.overdue.length }}
                         </span>
                    </div>
                    <div class="max-h-64 overflow-y-auto">
                        <div *ngFor="let task of productionMetrics.overdue" class="px-6 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 flex justify-between items-center">
                            <div>
                                <p class="text-sm font-bold text-gray-700">{{ task.title }}</p>
                                <div class="flex items-center gap-2 mt-1">
                                    <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{{ task.list?.folder?.space?.name }}</span>
                                    <span *ngFor="let assignee of task.assignees" class="text-xs text-gray-400 flex items-center gap-1">
                                        <i class="fas fa-user-circle"></i> {{ assignee.user.name }}
                                    </span>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-xs font-bold text-red-600">{{ task.deadline | date:'dd/MM' }}</p>
                                <p class="text-[10px] text-gray-400">Venceu</p>
                            </div>
                        </div>
                         <div *ngIf="productionMetrics.overdue.length === 0" class="px-6 py-8 text-center text-gray-400 text-sm">
                            Nenhuma tarefa vencida! 🎉
                        </div>
                    </div>
                </div>

                <!-- Upcoming Tasks -->
                <div class="bg-white rounded-xl shadow-sm border border-yellow-100 overflow-hidden">
                    <div class="bg-yellow-50 px-6 py-4 border-b border-yellow-100 flex items-center gap-3">
                         <div class="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                            <i class="fas fa-clock"></i>
                         </div>
                         <div>
                             <h3 class="font-bold text-yellow-800">Prestes a Vencer</h3>
                             <p class="text-xs text-yellow-600">Próximos 3 dias</p>
                         </div>
                         <span class="ml-auto bg-yellow-200 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">
                            {{ productionMetrics.upcoming.length }}
                         </span>
                    </div>
                    <div class="max-h-64 overflow-y-auto">
                        <div *ngFor="let task of productionMetrics.upcoming" class="px-6 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 flex justify-between items-center">
                             <div>
                                <p class="text-sm font-bold text-gray-700">{{ task.title }}</p>
                                <div class="flex items-center gap-2 mt-1">
                                    <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{{ task.list?.folder?.space?.name }}</span>
                                    <span *ngFor="let assignee of task.assignees" class="text-xs text-gray-400 flex items-center gap-1">
                                        <i class="fas fa-user-circle"></i> {{ assignee.user.name }}
                                    </span>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-xs font-bold text-yellow-600">{{ task.deadline | date:'dd/MM' }}</p>
                                <p class="text-[10px] text-gray-400">Vence em breve</p>
                            </div>
                        </div>
                        <div *ngIf="productionMetrics.upcoming.length === 0" class="px-6 py-8 text-center text-gray-400 text-sm">
                            Nada urgente para os próximos dias.
                        </div>
                    </div>
                </div>
            </div>

            <!-- Production Table -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-6 py-5 border-b border-gray-200 bg-gray-50">
                    <h2 class="font-bold text-lg text-gray-800">Produção da Equipe (Concluídas)</h2>
                </div>
                <table class="w-full text-left">
                    <thead>
                        <tr class="text-xs font-bold text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                            <th class="px-6 py-4">Profissional</th>
                            <th class="px-6 py-4 text-center">Hoje</th>
                            <th class="px-6 py-4 text-center">Esta Semana</th>
                            <th class="px-6 py-4 text-center">Este Mês</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr *ngFor="let user of productionMetrics.production_by_user" class="hover:bg-gray-50">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                   <div class="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                                      <img *ngIf="user.avatar" [src]="user.avatar" class="w-full h-full object-cover">
                                      <div *ngIf="!user.avatar" class="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">
                                          {{ user.name.substring(0,2).toUpperCase() }}
                                      </div>
                                   </div>
                                   <span class="font-bold text-gray-900">{{ user.name }}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <span class="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-sm">
                                    {{ user.daily }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <span class="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm">
                                    {{ user.weekly }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <span class="px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-bold text-sm">
                                    {{ user.monthly }}
                                </span>
                            </td>
                        </tr>
                        <tr *ngIf="productionMetrics.production_by_user.length === 0">
                             <td colspan="4" class="px-6 py-10 text-center text-gray-400">
                                Nenhuma atividade de produção registrada este mês.
                             </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>

      </div>
    </div>
    `
})
export class DashboardComponent implements OnInit {
  metrics: any = null;
  productionMetrics: any = null;
  isLoading = true;
  activeTab: 'overview' | 'production' = 'overview';
  expandedConsultantId: string | null = null;

  constructor(private dataService: DataService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      if (params['tab'] === 'production') {
        this.activeTab = 'production';
      }
    });

    this.loadOverview();

    // Load production in background or on tab switch, but pre-loading is fine for now
    this.dataService.getProductionMetrics().subscribe({
      next: (data) => this.productionMetrics = data,
      error: (err) => console.error('Error loading production metrics', err)
    });
  }

  loadOverview() {
    this.dataService.getDashboardMetrics().subscribe({
      next: (data) => {
        this.metrics = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard metrics', err);
        this.isLoading = false;
      }
    });
  }

  toggleExpand(consultantId: string) {
    if (this.expandedConsultantId === consultantId) {
      this.expandedConsultantId = null;
    } else {
      this.expandedConsultantId = consultantId;
    }
  }
}

