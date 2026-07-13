import { inject } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/login/forgot-password.component';
import { ResetPasswordComponent } from './pages/login/reset-password.component';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';

const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUser();

  if (!user) {
    auth.logout();
    return router.createUrlTree(['/login']);
  }

  return true;
};

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  {
    path: 'oauth-callback',
    loadComponent: () =>
      import('./pages/oauth-callback/oauth-callback.component').then(
        (m) => m.OauthCallbackComponent,
      ),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: 'spaces/invitations/:token',
        loadComponent: () =>
          import('./pages/space-invitation/space-invitation.component').then(
            (m) => m.SpaceInvitationComponent,
          ),
      },
      {
        path: '',
        pathMatch: 'full',
        canActivate: [
          () => {
            const auth = inject(AuthService);
            const router = inject(Router);
            const user = auth.currentUser();
            const role = user?.role?.toLowerCase();
            if (role === 'admin' || role === 'gestor') {
              return router.createUrlTree(['/spaces']);
            }

            return router.createUrlTree(['/my-tasks']);
          },
        ],
        children: [],
      },
      {
        path: 'spaces',
        loadComponent: () =>
          import('./pages/spaces/spaces.component').then(
            (m) => m.SpacesComponent,
          ),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/spaces/spaces-dashboard/spaces-dashboard.component').then(
                (m) => m.SpacesDashboardComponent,
              ),
          },
          {
            path: ':spaceId',
            loadComponent: () =>
              import('./pages/spaces/space-details/space-details.component').then(
                (m) => m.SpaceDetailsComponent,
              ),
          },
          {
            path: ':spaceId/folders/:folderId',
            loadComponent: () =>
              import('./pages/spaces/folder-details/folder-details.component').then(
                (m) => m.FolderDetailsComponent,
              ),
          },
          {
            path: ':spaceId/folders/:folderId/lists/:listId',
            loadComponent: () =>
              import('./pages/task-list-view/task-list-view.component').then(
                (m) => m.TaskListViewComponent,
              ),
          },
        ],
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/user-management/user-management.component').then(
            (m) => m.UserManagementComponent,
          ),
      },
      {
        path: 'my-tasks',
        loadComponent: () =>
          import('./pages/my-tasks/my-tasks.component').then(
            (m) => m.MyTasksComponent,
          ),
      },
      {
        path: 'team',
        loadComponent: () =>
          import('./pages/team/team.component').then((m) => m.TeamComponent),
      },
      {
        path: 'team/:userId',
        loadComponent: () =>
          import('./pages/team/member-profile/member-profile.component').then(
            (m) => m.MemberProfileComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings.component').then(
            (m) => m.SettingsComponent,
          ),
      },
      {
        path: 'companies',
        loadComponent: () =>
          import('./pages/companies/companies-list/companies-list.component').then(
            (m) => m.CompaniesListComponent,
          ),
      },
      {
        path: 'companies/:id',
        loadComponent: () =>
          import('./pages/companies/company-details/company-details.component').then(
            (m) => m.CompanyDetailsComponent,
          ),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
