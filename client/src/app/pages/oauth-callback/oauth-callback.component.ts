import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center">
        <div class="w-10 h-10 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600">{{ message }}</p>
      </div>
    </div>
  `
})
export class OauthCallbackComponent implements OnInit {
  message = 'Finalizando login...';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const payload = this.route.snapshot.queryParamMap.get('payload');

    if (!payload) {
      this.message = 'Não foi possível concluir o login.';
      setTimeout(() => this.router.navigate(['/login']), 1500);
      return;
    }

    try {
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(
        normalized.length + ((4 - normalized.length % 4) % 4),
        '='
      );

      const data = JSON.parse(atob(padded));

      if (!data.access_token || !data.user) {
        throw new Error('Payload inválido');
      }

      this.authService.setSession(data.access_token, data.user);

      if (data.user.role?.toLowerCase() === 'admin') {
        this.router.navigate(['/spaces']);
      } else {
        this.router.navigate(['/my-tasks']);
      }
    } catch (error) {
      console.error('Erro no callback OAuth:', error);
      this.message = 'Falha ao concluir o login.';
      setTimeout(() => this.router.navigate(['/login']), 1500);
    }
  }
}
