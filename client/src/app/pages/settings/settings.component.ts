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
  uploading = signal<boolean>(false);

  constructor(private authService: AuthService, private dataService: DataService) { }

  ngOnInit() {
    const u = this.authService.currentUser();
    if (u) {
      this.user.set(u);
      this.name.set(u.name);
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.message.set('Erro: Arquivo muito grande (max 5MB).');
        return;
      }
      this.uploading.set(true);
      const userId = this.user()?.id;
      if (!userId) return;

      this.dataService.uploadAvatar(userId, file).subscribe({
        next: (updatedUser) => {
          // Assuming backend returns the updated user object with avatar_url
          // If backend returns just success, we might need to construct the URL manually or refetch.
          // UsersService.updateAvatar just calls prisma update, which returns the user.
          this.user.set(updatedUser);
          this.authService.updateUser(updatedUser);
          // Also update AuthService state if possible, or just local.
          // Ideally: this.authService.currentUser.set(updatedUser); 
          // But AuthService might not expose writable signal directly or it might be computed.
          // For now, updating local user signal updates the View.
          this.message.set('Avatar atualizado com sucesso!');
          this.uploading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.message.set('Erro ao enviar imagem.');
          this.uploading.set(false);
        }
      });
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
