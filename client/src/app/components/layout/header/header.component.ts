import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  user = this.authService.currentUser;
  userParams = computed(() => {
    const u = this.user();
    return u ? { name: u.name, email: u.email, avatar_url: u.avatar_url } : null;
  });

  constructor(public authService: AuthService) { }
}
