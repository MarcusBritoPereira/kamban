import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-space-invitation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div
      class="max-w-xl mx-auto bg-white rounded-xl shadow p-8 mt-10 text-center"
    >
      <h1 class="text-2xl font-bold text-gray-900 mb-3">Convite de espaço</h1>
      <p class="text-gray-600 mb-6">{{ message }}</p>

      <button
        *ngIf="status === 'accepted'"
        type="button"
        class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        (click)="goToSpaces()"
      >
        Ver meus espaços
      </button>

      <a
        *ngIf="status === 'error'"
        routerLink="/spaces"
        class="text-blue-600 hover:underline"
      >
        Voltar para espaços
      </a>
    </div>
  `,
})
export class SpaceInvitationComponent implements OnInit {
  status: 'loading' | 'accepted' | 'error' = 'loading';
  message = 'Aceitando convite...';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.status = 'error';
      this.message = 'Convite inválido.';
      return;
    }

    this.dataService.acceptSpaceInvitation(token).subscribe({
      next: () => {
        this.status = 'accepted';
        this.message =
          'Convite aceito! Agora você pode ser incluído nas tarefas deste espaço.';
      },
      error: (err) => {
        this.status = 'error';
        this.message =
          err.error?.message || 'Não foi possível aceitar este convite.';
      },
    });
  }

  goToSpaces() {
    this.router.navigate(['/spaces']);
  }
}
