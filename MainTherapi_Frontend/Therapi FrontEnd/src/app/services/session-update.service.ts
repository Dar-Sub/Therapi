import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SessionUpdateService {
  private sessionUpdateSource = new Subject<void>();
  sessionUpdated$ = this.sessionUpdateSource.asObservable();

  notifySessionCreated() {
    this.sessionUpdateSource.next();
  }
}
