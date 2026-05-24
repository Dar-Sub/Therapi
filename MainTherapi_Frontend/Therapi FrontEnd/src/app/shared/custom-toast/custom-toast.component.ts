import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ToastMessage, ToastService } from '../../services/toast-message.service';

interface Toast {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
@Component({
  selector: 'app-custom-toast',
  imports: [CommonModule],
  templateUrl: './custom-toast.component.html',
  styleUrl: './custom-toast.component.scss'
})
export class CustomToastComponent {
  toast: ToastMessage | null = null;

  constructor(private toastService: ToastService) {
  }

  ngOnInit(): void {
    this.toastService.toast$.subscribe((toast) => {
      this.toast = toast;
    });
  }

  getToastColor(type: string): string {
    switch (type) {
      case 'success':
        return '#4caf50';
      case 'error':
        return '#f44336';
      case 'info':
        return '#2196f3';
      case 'warning':
        return '#ff9800';
      default:
        return '#333'; // Default color
    }
  }

  // Get the FontAwesome icon dynamically
  getToastIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'fa fa-check-circle';
      case 'error':
        return 'fa fa-times-circle';
      case 'info':
        return 'fa fa-info-circle';
      case 'warning':
        return 'fa fa-exclamation-circle';
      default:
        return 'fa fa-bell';
    }
  }


  // Method to manually dismiss the toast
  dismissToast(): void {
    this.toastService.clearToast();
  }

}
