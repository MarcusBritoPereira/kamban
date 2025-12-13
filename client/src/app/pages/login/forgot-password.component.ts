import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Recuperar Senha</h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Informe seu email para receber as instruções.
          </p>
        </div>
        
        <form *ngIf="!successMessage" class="mt-8 space-y-6" (ngSubmit)="onSubmit()">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="email-address" class="sr-only">Email</label>
              <input id="email-address" name="email" type="email" autocomplete="email" required
                [(ngModel)]="email"
                class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder="Email address">
            </div>
          </div>

          <div>
            <button type="submit" [disabled]="loading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 transition-colors">
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <i *ngIf="!loading" class="fas fa-paper-plane text-pink-500 group-hover:text-pink-400"></i>
                <i *ngIf="loading" class="fas fa-spinner fa-spin text-pink-500"></i>
              </span>
              {{ loading ? 'Enviando...' : 'Enviar Email' }}
            </button>
          </div>
        </form>

        <div *ngIf="successMessage" class="mt-8 bg-green-50 border border-green-200 text-green-800 rounded-md p-4 text-center">
            <p>{{ successMessage }}</p>
        </div>

        <div class="text-center mt-4">
             <a routerLink="/login" class="font-medium text-pink-600 hover:text-pink-500">Voltar para Login</a>
        </div>

      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
    email = '';
    loading = false;
    successMessage = '';

    constructor(private http: HttpClient) { }

    onSubmit() {
        if (!this.email) return;

        this.loading = true;
        this.http.post<{ message: string }>('http://localhost:3000/v1/auth/forgot-password', { email: this.email })
            .subscribe({
                next: (res) => {
                    this.loading = false;
                    this.successMessage = res.message || 'Instruções enviadas para seu email.';
                },
                error: (err) => {
                    this.loading = false;
                    // Security: Always show same message
                    this.successMessage = 'Se o email existir, as instruções foram enviadas.';
                }
            });
    }
}
