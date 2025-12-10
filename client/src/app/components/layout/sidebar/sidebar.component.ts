import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataService, Space, Folder, TaskList } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';
import { SimpleInputDialogComponent } from '../../dialogs/simple-input-dialog/simple-input-dialog.component';
import { CreateTaskDialogComponent } from '../../dialogs/create-task-dialog/create-task-dialog.component';

interface ExpandedState {
  [key: string]: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, SimpleInputDialogComponent, CreateTaskDialogComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  spaces = this.dataService.spaces;

  // Local state for hierarchy
  folders = signal<{ [key: string]: Folder[] }>({});
  lists = signal<{ [key: string]: TaskList[] }>({});

  expandedSpaces: ExpandedState = {};
  expandedFolders: ExpandedState = {};

  showUserMenu = signal<boolean>(false);
  currentUser = this.authService.currentUser;

  // Rich Task Dialog State
  showTaskDialog = false;
  selectedListForTask: TaskList | null = null;

  // Simple Dialog State
  dialogConfig = {
    visible: false,
    title: '',
    label: '',
    initialValue: '',
    placeholder: '',
    mode: '' as 'renameSpace' | 'createFolder' | 'renameFolder' | 'createList' | 'renameList',
    targetId: '',
    spaceId: '' // needed for referencing space map if needed
  };

  constructor(public dataService: DataService, public authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.dataService.getSpaces().subscribe();
  }

  // Dialog Logic for Simple Inputs
  initiateRenameSpace(space: Space, event: Event) {
    event.stopPropagation();
    this.dialogConfig = {
      visible: true,
      title: 'Renomear Espaço',
      label: 'Nome do Espaço',
      initialValue: space.name,
      placeholder: 'Ex: Marketing',
      mode: 'renameSpace',
      targetId: space.id!,
      spaceId: space.id!
    };
  }

  initiateCreateFolder(spaceId: string, event: Event) {
    event.stopPropagation();
    if (!this.expandedSpaces[spaceId]) this.toggleSpace(spaceId); // Expand
    this.dialogConfig = {
      visible: true,
      title: 'Nova Pasta',
      label: 'Nome da Pasta',
      initialValue: '',
      placeholder: 'Ex: Campanhas 2024',
      mode: 'createFolder',
      targetId: spaceId, // using targetId as spaceId here
      spaceId: spaceId
    };
  }

  initiateRenameFolder(folder: Folder, event: Event) {
    event.stopPropagation();
    this.dialogConfig = {
      visible: true,
      title: 'Renomear Pasta',
      label: 'Nome da Pasta',
      initialValue: folder.name,
      placeholder: 'Ex: Projetos',
      mode: 'renameFolder',
      targetId: folder.id!,
      spaceId: folder.space_id
    };
  }

  initiateCreateList(folder: Folder, event: Event) {
    event.stopPropagation();
    if (!this.expandedFolders[folder.id!]) this.toggleFolder(folder.id!); // Expand
    this.dialogConfig = {
      visible: true,
      title: 'Nova Lista',
      label: 'Nome da Lista',
      initialValue: '',
      placeholder: 'Ex: Tarefas de Dezembro',
      mode: 'createList',
      targetId: folder.id!,
      spaceId: folder.space_id
    };
  }

  initiateRenameList(list: TaskList, spaceId: string, event: Event) {
    event.stopPropagation();
    this.dialogConfig = {
      visible: true,
      title: 'Renomear Lista',
      label: 'Nome da Lista',
      initialValue: list.name,
      placeholder: 'Ex: Geral',
      mode: 'renameList',
      targetId: list.id!,
      spaceId: spaceId, // Need spaceId to find folder to refresh? Actually list update doesn't need re-fetch of folder lists usually unless we want to be safe.
      // We can pass folderId in a separate property if we extend config, but let's see. 
      // Actually we need folderId to refresh the lists signal for that folder.
      // Let's pass folderId as targetId context or add folderId to config.
    };
    // Hack: Storing folderId in spaceId temporarily or incorrectly? 
    // Let's add 'folderId' to dialogConfig to be clean.
    // BUT I can't change the interface easily in this replace block without changing the definition above.
    // I see I defined `dialogConfig` property earlier.
    // Let's use `spaceId` field for folderId if mode is renameList? 
    // Or just re-fetch lists using the known folderId from the list? Wait, list object has folder_id.
  }

  // Rich Task Creation
  initiateCreateTask(list: TaskList, event: Event) {
    event.stopPropagation();
    this.selectedListForTask = list;
    this.showTaskDialog = true;
  }

  handleTaskCreated() {
    // Task created successfully.
    // If we had a tasks list in sidebar, we'd refresh it.
    // For now just close.
    this.closeTaskDialog();
  }

  closeTaskDialog() {
    this.showTaskDialog = false;
    this.selectedListForTask = null;
  }

  handleDialogSubmit(value: string) {
    const { mode, targetId, spaceId } = this.dialogConfig;

    // Close dialog
    this.dialogConfig.visible = false;

    if (mode === 'renameSpace') {
      this.dataService.updateSpace(targetId, { name: value }).subscribe();
    } else if (mode === 'createFolder') {
      this.dataService.createFolder(targetId, { name: value }).subscribe(folder => {
        // Refresh folders for this space
        this.dataService.getFolders(targetId).subscribe(folders => {
          this.folders.update(current => ({ ...current, [targetId]: folders }));
        });
      });
    } else if (mode === 'renameFolder') {
      this.dataService.updateFolder(targetId, { name: value }).subscribe(() => {
        // Refresh folders to show new name (spaceId needs to be known or stored)
        this.dataService.getFolders(spaceId).subscribe(folders => {
          this.folders.update(current => ({ ...current, [spaceId]: folders }));
        });
      });
    } else if (mode === 'createList') {
      this.dataService.createList(targetId, { name: value }).subscribe(() => {
        // Refresh lists
        this.dataService.getLists(targetId).subscribe(lists => {
          this.lists.update(current => ({ ...current, [targetId]: lists }));
        });
      });
    } else if (mode === 'renameList') {
      this.dataService.updateList(targetId, { name: value }).subscribe((updatedList) => {
        // updatedList has folder_id. Refresh that folder's lists.
        this.dataService.getLists(updatedList.folder_id).subscribe(lists => {
          this.lists.update(current => ({ ...current, [updatedList.folder_id]: lists }));
        });
      });
    }
  }

  closeDialog() {
    this.dialogConfig.visible = false;
  }

  openCreateSpace() {
    this.dataService.createSpaceDialogVisible.set(true);
  }

  toggleSpace(spaceId: string) {
    this.expandedSpaces[spaceId] = !this.expandedSpaces[spaceId];
    if (this.expandedSpaces[spaceId] && !this.folders()[spaceId]) {
      this.dataService.getFolders(spaceId).subscribe(folders => {
        this.folders.update(current => ({ ...current, [spaceId]: folders }));
      });
    }
  }

  navigateToSpace(space: Space, event: Event) {
    // When clicking the space name, navigate to the space view
    // Do NOT stop propagation if we want it to also toggle expansion? 
    // User expectation: Clicking name usually selects it. 
    // Let's assume we navigate AND expand (if not expanded).

    // Actually, let's keep it simple: Arrow expands, Name navigates.
    // But expanding when navigating is nice too.
    this.router.navigate(['/spaces', space.id]);
  }

  toggleFolder(folderId: string) {
    this.expandedFolders[folderId] = !this.expandedFolders[folderId];
    if (this.expandedFolders[folderId] && !this.lists()[folderId]) {
      this.dataService.getLists(folderId).subscribe(lists => {
        this.lists.update(current => ({ ...current, [folderId]: lists }));
      });
    }
  }

  isSpaceExpanded(spaceId: string) { return this.expandedSpaces[spaceId]; }
  getFoldersForSpace(spaceId: string) { return this.folders()[spaceId] || []; }

  isFolderExpanded(folderId: string) { return this.expandedFolders[folderId]; }
  getListsForFolder(folderId: string) { return this.lists()[folderId] || []; }

  toggleUserMenu() {
    this.showUserMenu.set(!this.showUserMenu());
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.role === 'admin';
  }

  logout() {
    this.authService.logout();
  }
}
