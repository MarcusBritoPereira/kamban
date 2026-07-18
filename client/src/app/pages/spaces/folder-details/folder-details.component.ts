import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService, Folder, TaskList, Space } from '../../../services/data.service';
import { SimpleInputDialogComponent } from '../../../components/dialogs/simple-input-dialog/simple-input-dialog.component';

@Component({
    selector: 'app-folder-details',
    standalone: true,
    imports: [CommonModule, RouterModule, SimpleInputDialogComponent],
    template: `
    <div class="h-full bg-white p-4 sm:p-6 lg:p-8 overflow-y-auto">
       <header class="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
          <div class="flex items-center">
             <div class="mr-4 cursor-pointer text-gray-400 hover:text-gray-600" (click)="goBack()">
                <i class="fas fa-arrow-left text-lg"></i>
             </div>
             <div>
                <h1 class="text-2xl font-bold text-gray-900">{{ folder()?.name || 'Pasta' }}</h1>
                <p class="text-sm text-gray-500">Passo 3 de 3: listas guardam as tarefas do quadro</p>
             </div>
          </div>
          <button (click)="openCreateListDialog()"
             class="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2.5 px-5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center">
             <i class="fas fa-list mr-2"></i> Nova Lista
          </button>
       </header>

       <!-- Lists Grid -->
       <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div *ngFor="let list of lists()" 
               class="bg-white border border-gray-200 rounded-lg p-4 flex items-center hover:shadow-md cursor-pointer transition-shadow group"
               (click)="openList(list)">
             <span class="text-xl text-gray-400 mr-3 group-hover:text-brand-yellow font-bold">#</span>
             <span class="font-medium text-gray-700 group-hover:text-gray-900 truncate">{{ list.name }}</span>
          </div>

          <!-- Empty State -->
          <div *ngIf="lists().length === 0" class="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <i class="fas fa-list text-2xl text-pink-500"></i>
              </div>
              <h3 class="text-lg font-bold text-gray-800 mb-2">Último passo: crie uma lista</h3>
              <p class="text-gray-500 mb-6 max-w-md mx-auto">Comece com nomes simples como Backlog, Fazer, Em andamento ou Concluído. Em seguida, adicione a primeira tarefa.</p>
              <button (click)="openCreateListDialog()"
                class="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2.5 px-5 rounded-lg transition-all shadow-md hover:shadow-lg">
                Criar lista
              </button>
          </div>
       </div>

       <app-simple-input-dialog
          *ngIf="showCreateListDialog"
          title="Nova Lista"
          label="Nome da Lista"
          placeholder="Ex: Backlog, Produção ou Sprint"
          (submit)="createList($event)"
          (close)="showCreateListDialog = false">
       </app-simple-input-dialog>
    </div>
  `
})
export class FolderDetailsComponent implements OnInit {
    spaceId: string | null = null;
    folderId: string | null = null;
    space = signal<Space | undefined>(undefined);
    folder = signal<Folder | undefined>(undefined);
    lists = signal<TaskList[]>([]);
    showCreateListDialog = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private dataService: DataService
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.spaceId = params.get('spaceId');
            this.folderId = params.get('folderId');

            if (this.spaceId && this.folderId) {
                this.loadData(this.spaceId, this.folderId);
            }
        });
    }

    loadData(spaceId: string, folderId: string) {
        this.dataService.getSpaces().subscribe(spaces => {
            const foundSpace = spaces.find(s => s.id === spaceId);
            this.space.set(foundSpace);
        });

        this.dataService.getFolders(spaceId).subscribe(folders => {
            const foundFolder = folders.find(f => f.id === folderId);
            this.folder.set(foundFolder);
        });

        this.dataService.getLists(folderId).subscribe(lists => {
            this.lists.set(lists);
        });
    }

    openList(list: TaskList) {
        this.router.navigate(['/spaces', this.spaceId, 'folders', this.folderId, 'lists', list.id]);
    }

    openCreateListDialog() {
        this.showCreateListDialog = true;
    }

    createList(name: string) {
        if (!this.folderId) return;
        this.dataService.createList(this.folderId, { name }).subscribe({
            next: (list) => {
                this.showCreateListDialog = false;
                this.lists.update(lists => [...lists, list]);
                this.router.navigate(['/spaces', this.spaceId, 'folders', this.folderId, 'lists', list.id]);
            },
            error: (err) => alert('Erro ao criar lista: ' + (err.error?.message || err.message))
        });
    }

    goBack() {
        this.router.navigate(['/spaces', this.spaceId]);
    }
}
