import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private threadIdSource = new BehaviorSubject<string | null>(null);
  private isThreadSource = new BehaviorSubject<string | null>(null);
  threadId$ = this.threadIdSource.asObservable();
  isThread$ = this.isThreadSource.asObservable();

  setThreadId(threadId: string | null): void {
    if (threadId) {
      localStorage.setItem('threadId', threadId);
    } else {
      localStorage.removeItem('threadId');
    }
    this.threadIdSource.next(threadId);
  }

  setIsThread(isThread: any): void {
    this.isThreadSource.next(isThread);
  }
}
