import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  showLogin = false;

  constructor(
    private router: Router,
    public authService: AuthService
  ) {

  }

  ngOnInit() {

  }

  route() {
    if (this.authService.UserData) {
      this.navigateToChat()
    } else {
      this.navigateToLogin()
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToChat(): void {
    this.router.navigate(['/chat']); // Replace '/chat' with the actual path for the chat page
  }
}
