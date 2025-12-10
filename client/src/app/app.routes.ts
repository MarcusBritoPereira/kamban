import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: '', redirectTo: 'spaces', pathMatch: 'full' },
            {
                path: 'spaces',
                loadComponent: () => import('./pages/spaces/spaces.component').then(m => m.SpacesComponent),
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./pages/spaces/spaces-dashboard/spaces-dashboard.component').then(m => m.SpacesDashboardComponent)
                    },
                    {
                        path: ':spaceId/folders/:folderId/lists/:listId',
                        loadComponent: () => import('./pages/task-list-view/task-list-view.component').then(m => m.TaskListViewComponent)
                    }
                ]
            },
            {
                path: 'users',
                loadComponent: () => import('./pages/user-management/user-management.component').then(m => m.UserManagementComponent)
            },
            {
                path: 'settings',
                loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent)
            }
        ]
    }
];
