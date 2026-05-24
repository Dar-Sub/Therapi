import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { PopupService } from '../../services/message-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  userName: string | null | undefined;
  constructor(
    private authService: AuthService,
    private popupService: PopupService,
    private router: Router,
  ) {
    this.userName = this.authService.UserData?.userName
    
  }


  showPopup(title: string, message: string, actionText: string, icon: any): void {
    this.popupService.openPopup(
      title,
      message,
      actionText,
      icon
    );
  }

  logOut() {
    this.showPopup('Are you sure you want to log out?', 'Logging out will end your current session and require you to log in again to access your account.', 'Logout', '/images/message-popup.svg')
  }

  purchaseMore() {
    this.router.navigateByUrl('/purchase')
  }

  starChat() {
    
    this.router.navigateByUrl('/chat')
  }
}
