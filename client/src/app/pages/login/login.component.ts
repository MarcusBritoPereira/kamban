import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dataService: DataService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          const user = this.authService.currentUser();
          const role = user?.role?.toLowerCase();
          if (role === 'admin' || role === 'gestor') {
            this.router.navigate(['/spaces']);
          } else {
            this.dataService.getSpaces().subscribe({
              next: (spaces) => this.router.navigate([spaces.length > 0 ? '/my-tasks' : '/spaces']),
              error: () => this.router.navigate(['/my-tasks'])
            });
          }
        },
        error: (err) => {
          this.error = 'Login falhou. Verifique suas credenciais.';
          console.error(err);
        }
      });
    }
  }
}
