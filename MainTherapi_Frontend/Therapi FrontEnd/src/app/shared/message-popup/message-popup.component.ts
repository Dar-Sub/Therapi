import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-message-popup',
  imports: [CommonModule],
  templateUrl: './message-popup.component.html',
  styleUrl: './message-popup.component.scss'
})
export class MessagePopupComponent {
  @Input() visible: boolean = false; // Controls popup visibility
  @Input() title: string = 'Popup Title'; // Popup title
  @Input() message: string = 'This is a message.'; // Popup message
  @Input() actionText: string = 'Confirm'; // Button text
  @Input() icon: string | null = null; // Optional icon path

  @Output() actionHandler = new EventEmitter<void>(); // Action button handler
  @Output() onClose = new EventEmitter<void>(); // Close event handler

  constructor(
    private router: Router,
    private authService: AuthService,
  ) { }

  closePopup(): void {
    this.visible = false;
    this.onClose.emit(); // Notify parent about close action
  }

  onAction(): void {
    if (this.actionText === 'Start chat') {
      this.router.navigate(['/chat']); // Navigate to ChatComponent
      this.closePopup();
    } else if (this.actionText === 'Okay') {
      this.closePopup(); // Close the popup
    } else if (this.actionText === 'Login') {
      this.router.navigate(['/login']);
      this.closePopup();
    } else if (this.actionText === 'Logout') {
      this.authService.logout()
      this.closePopup();
    }
    else {
      this.actionHandler.emit(); // Emit the action for other cases
    }
  }

}
