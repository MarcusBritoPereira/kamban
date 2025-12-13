import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService, Folder, TaskList, Space } from '../../../services/data.service';

@Component({
    selector: 'app-folder-details',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="h-full bg-white p-8 overflow-y-auto">
       <header class="flex justify-between items-center mb-6">
          <div class="flex items-center">
             <div class="mr-4 cursor-pointer text-gray-400 hover:text-gray-600" (click)="goBack()">
                <i class="fas fa-arrow-left text-lg"></i>
             </div>
             <div>
                <h1 class="text-2xl font-bold text-gray-900">{{ folder()?.name || 'Pasta' }}</h1>
                <p class="text-sm text-gray-500">{{ space()?.name }} / Listas</p>
             </div>
          </div>
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
          <div *ngIf="lists().length === 0" class="col-span-full py-12 text-center border-2 border-dashed border-gray-100 rounded-lg">
              <p class="text-gray-500">Nenhuma lista encontrada nesta pasta.</p>
          </div>
       </div>
    </div>
  `
})
export class FolderDetailsComponent implements OnInit {
    spaceId: string | null = null;
    folderId: string | null = null;
    space = signal<Space | undefined>(undefined);
    folder = signal<Folder | undefined>(undefined);
    lists = signal<TaskList[]>([]);

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

    goBack() {
        this.router.navigate(['/spaces', this.spaceId]);
    }
}
