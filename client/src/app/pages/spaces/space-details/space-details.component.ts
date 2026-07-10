import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService, Folder, Space } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';
import { SimpleInputDialogComponent } from '../../../components/dialogs/simple-input-dialog/simple-input-dialog.component';

@Component({
    selector: 'app-space-details',
    standalone: true,
    imports: [CommonModule, RouterModule, SimpleInputDialogComponent],
    template: `
    <div class="h-full bg-white p-8 overflow-y-auto">
       <header class="flex justify-between items-center mb-6">
          <div class="flex items-center">
             <div class="mr-4 cursor-pointer text-gray-400 hover:text-gray-600" (click)="goBack()">
                <i class="fas fa-arrow-left text-lg"></i>
             </div>
             <div>
                <h1 class="text-2xl font-bold text-gray-900">{{ space()?.name || 'Espaço' }}</h1>
                <p class="text-sm text-gray-500">Folders</p>
             </div>
          </div>
          <button *ngIf="canEdit()" (click)="openCreateFolderDialog()"
             class="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2.5 px-5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center">
             <i class="fas fa-folder-plus mr-2"></i> Nova Pasta
          </button>
       </header>

       <!-- Folders Grid -->
       <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div *ngFor="let folder of folders()" 
               class="bg-white border border-gray-200 rounded-lg p-4 flex items-center hover:shadow-md cursor-pointer transition-shadow group"
               (click)="openFolder(folder)">
             <i class="fas fa-folder text-xl text-gray-500 mr-3 group-hover:text-gray-700"></i>
             <span class="font-medium text-gray-700 group-hover:text-gray-900 truncate">{{ folder.name }}</span>
          </div>

          <!-- Empty State -->
          <div *ngIf="folders().length === 0" class="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <i class="fas fa-folder-plus text-2xl text-pink-500"></i>
              </div>
              <h3 class="text-lg font-bold text-gray-800 mb-2">Crie a primeira pasta deste espaço</h3>
              <p class="text-gray-500 mb-6 max-w-md mx-auto">Pastas agrupam listas e mantêm seus projetos organizados antes da criação das tarefas.</p>
              <button *ngIf="canEdit()" (click)="openCreateFolderDialog()"
                class="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2.5 px-5 rounded-lg transition-all shadow-md hover:shadow-lg">
                Criar pasta
              </button>
          </div>
       </div>

       <app-simple-input-dialog
          *ngIf="showCreateFolderDialog"
          title="Nova Pasta"
          label="Nome da Pasta"
          placeholder="Ex: Projeto, Cliente ou Campanha"
          (submit)="createFolder($event)"
          (close)="showCreateFolderDialog = false">
       </app-simple-input-dialog>
    </div>
  `
})
export class SpaceDetailsComponent implements OnInit {
    spaceId: string | null = null;
    space = signal<Space | undefined>(undefined);
    folders = signal<Folder[]>([]);
    showCreateFolderDialog = false;

    currentUser = this.authService.currentUser;

    currentUserRole = computed(() => {
        const space = this.space();
        const user = this.currentUser();
        if (!space || !user) return null;

        if (space.owner_id === user.id) return 'owner';

        const member = space.members?.find((m: any) => m.user_id === user.id);
        return member ? member.role : null;
    });

    canManage = computed(() => {
        const role = this.currentUserRole();
        return role === 'owner' || role === 'admin';
    });

    canEdit = computed(() => {
        const role = this.currentUserRole();
        return role === 'owner' || role === 'admin' || role === 'editor';
    });

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private dataService: DataService,
        public authService: AuthService
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.spaceId = params.get('spaceId');
            if (this.spaceId) {
                this.loadSpaceData(this.spaceId);
            }
        });
    }

    loadSpaceData(id: string) {
        // Ideally we fetch a single space, but we have getSpaces cached or observable
        this.dataService.getSpaces().subscribe(spaces => {
            const found = spaces.find(s => s.id === id);
            this.space.set(found);
        });

        this.dataService.getFolders(id).subscribe(folders => {
            this.folders.set(folders);
        });
    }

    openFolder(folder: Folder) {
        // Navigate to Folder Details (Lists Grid)
        this.router.navigate(['/spaces', this.spaceId, 'folders', folder.id]);
    }

    openCreateFolderDialog() {
        this.showCreateFolderDialog = true;
    }

    createFolder(name: string) {
        if (!this.spaceId) return;
        this.dataService.createFolder(this.spaceId, { name }).subscribe({
            next: (folder) => {
                this.showCreateFolderDialog = false;
                this.folders.update(folders => [...folders, folder]);
                this.router.navigate(['/spaces', this.spaceId, 'folders', folder.id]);
            },
            error: (err) => alert('Erro ao criar pasta: ' + (err.error?.message || err.message))
        });
    }

    goBack() {
        this.router.navigate(['/spaces']);
    }
}
