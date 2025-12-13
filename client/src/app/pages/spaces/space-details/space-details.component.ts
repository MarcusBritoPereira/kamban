import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService, Folder, Space } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-space-details',
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
                <h1 class="text-2xl font-bold text-gray-900">{{ space()?.name || 'Espaço' }}</h1>
                <p class="text-sm text-gray-500">Folders</p>
             </div>
          </div>
          <button *ngIf="canManage()" class="text-gray-400 hover:text-gray-600">
             <i class="fas fa-ellipsis-h"></i>
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
          <div *ngIf="folders().length === 0" class="col-span-full py-12 text-center border-2 border-dashed border-gray-100 rounded-lg">
              <p class="text-gray-500">Nenhuma pasta encontrada neste espaço.</p>
          </div>
       </div>
    </div>
  `
})
export class SpaceDetailsComponent implements OnInit {
    spaceId: string | null = null;
    space = signal<Space | undefined>(undefined);
    folders = signal<Folder[]>([]);

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

    goBack() {
        this.router.navigate(['/spaces']);
    }
}
