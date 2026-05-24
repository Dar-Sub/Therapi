import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PopupService } from '../services/message-service';
import { MessagePopupComponent } from '../shared/message-popup/message-popup.component';

@Component({
  selector: 'app-purchase',
  imports: [CommonModule, RouterModule, MessagePopupComponent],
  templateUrl: './purchase.component.html',
  styleUrl: './purchase.component.scss'
})
export class PurchaseComponent {
  selectedTab: string = 'purchase'; // Default tab

  constructor(private popupService: PopupService) { }

  selectTab(tab: string): void {
    this.selectedTab = tab;
  }

  showPopup(): void {
    this.popupService.openPopup(
      'Purchase Successful!',
      'Your purchase has been completed successfully.',
      'Start Chatting',
      '/images/message-popup.svg'
    );
  }

}
