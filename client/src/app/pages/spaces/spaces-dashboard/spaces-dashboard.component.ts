import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';
import { CreateSpaceDialogComponent } from '../../../components/dialogs/create-space-dialog/create-space-dialog.component';
import { EditSpaceDialogComponent } from '../../../components/dialogs/edit-space-dialog/edit-space-dialog.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-spaces-dashboard',
    standalone: true,
    imports: [CommonModule, CreateSpaceDialogComponent, EditSpaceDialogComponent],
    templateUrl: './spaces-dashboard.component.html',
})
export class SpacesDashboardComponent implements OnInit {
    spaces = this.dataService.spaces;
    currentUser = this.authService.currentUser;

    showCreateDialog = false;
    showEditDialog = false;
    selectedSpaceForEdit: any = null;

    constructor(
        private dataService: DataService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        this.loadSpaces();
    }

    loadSpaces() {
        this.dataService.getSpaces().subscribe();
    }

    openCreateSpaceDialog() {
        this.showCreateDialog = true;
    }

    closeCreateSpaceDialog() {
        this.showCreateDialog = false;
    }

    handleSpaceCreated(space: any) {
        this.showCreateDialog = false;
        this.loadSpaces();
        if (space?.id) {
            this.router.navigate(['/spaces', space.id]);
        }
    }

    selectSpace(space: any) {
        this.dataService.currentSpaceId.set(space.id);
        this.router.navigate(['/spaces', space.id]);
    }

    openEditDialog(space: any) {
        this.selectedSpaceForEdit = space;
        this.showEditDialog = true;
    }

    closeEditDialog() {
        this.showEditDialog = false;
        this.selectedSpaceForEdit = null;
    }
}
