import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  user = signal<any>(null);
  name = signal<string>('');
  message = signal<string>('');

  constructor(private authService: AuthService, private dataService: DataService) { }

  ngOnInit() {
    const u = this.authService.currentUser();
    if (u) {
      this.user.set(u);
      this.name.set(u.name);
    }
  }

  saveProfile() {
    const userId = this.user()?.id;
    if (!userId) return;

    this.dataService.updateUser(userId, { name: this.name() }).subscribe({
      next: (updatedUser) => {
        // Update local auth state ideally, but for now just show success
        this.message.set('Perfil atualizado com sucesso!');
        // HACK: Update auth service state manually if possible or reload
        // Ideally AuthService should have a method to update state
      },
      error: (err) => this.message.set('Erro ao atualizar perfil.')
    });
  }
}
