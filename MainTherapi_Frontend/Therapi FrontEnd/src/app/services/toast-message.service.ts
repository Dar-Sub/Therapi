import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new BehaviorSubject<ToastMessage | null>(null);
  toast$ = this.toastSubject.asObservable();

  // Show a new toast
  showToast(toast: ToastMessage): void {
    this.toastSubject.next(toast);
    // Automatically clear the toast after 5 seconds
    setTimeout(() => this.clearToast(), 5000);
  }

  // Clear the toast
  clearToast(): void {
    this.toastSubject.next(null);
  }
}
