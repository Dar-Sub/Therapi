import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AzureAiService } from '../../../../build/api';
import { SessionService } from '../../services/session.service';
import { SessionUpdateService } from '../../services/session-update.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import {MatTooltipModule} from '@angular/material/tooltip';

import { CreateSessionComponent } from '../../shared/create-session/create-session.component';

@Component({
  selector: 'app-side-nav',
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule, MatToolbarModule, MatSidenavModule, MatTooltipModule, CreateSessionComponent],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss'
})
export class SideNavComponent {
  private threadIdSource = new BehaviorSubject<string | null>(null);
  isMobile: boolean = false;

  currentThreadId$ = this.threadIdSource.asObservable();
  activeSessionId: string | null = null;
  sessions: any[] = [];
  isThread = false;

  @Input() isSidenavOpen: boolean = false; // Accept initial sidenav state
  @Output() closeSidenavEvent = new EventEmitter<void>(); // Emit event to notify parent

  closeSidenav(): void {
    console.log('Sidenav closed');
    this.closeSidenavEvent.emit(); // Notify parent to close sidenav
  }

  closeSidenavItem(threadId: string): void {
    console.log('closeSidenavItem called with threadId:', threadId); // Debug log

    if (this.isMobile) {
      console.log('Closing sidenav on mobile for item click'); // Log for mobile
      this.sendThreadIdToChat(threadId);

      // Delay closing sidenav
      setTimeout(() => {
        this.closeSidenavEvent.emit();
      }, 200);
    } else {
      console.log('Not closing sidenav on normal view for item click'); // Log for desktop
      this.sendThreadIdToChat(threadId);
    }
  }






  constructor(
    private apiService: AzureAiService,
    private sessionService: SessionService,
    private sessionUpdateService: SessionUpdateService,
    private breakpointObserver: BreakpointObserver,
    private el: ElementRef,
    private dialog: MatDialog,
  ) { }



  ngOnInit() {
    this.getData()

    this.sessionUpdateService.sessionUpdated$.subscribe((newSessionId: any) => {
      this.getDataAndActivateLast();
    });
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe((result) => {
      this.isMobile = result.matches; // Update `isMobile` based on screen size
      console.log('Is mobile (side-nav.component):', this.isMobile); // Debug log
    });
  }



  // getData() {
  //   fetch('https://demo.promena.in/api/AzureAi/GetThreads')
  //     .then(response => {
  //       if (!response.ok) {
  //         throw new Error(`HTTP error! Status: ${response.status}`);
  //       }
  //       return response.json();
  //     })
  //     .then(data => {
  //       console.log('API Response:', data);
  //       this.sessions = data;
  //     })
  //     .catch(err => {
  //       console.error('API Error:', err);
  //     });
  // }

  getData() {
    this.apiService.apiAzureAiGetThreadsGet().subscribe({
      next: (res) => {
        this.sessions = res;
      }
    })
  }

  getDataAndActivateLast() {
    this.apiService.apiAzureAiGetThreadsGet().subscribe({
      next: (res) => {
        console.log('API Response:', res);
        this.sessions = res;

        // Automatically activate the last session in the list
        if (this.sessions && this.sessions.length > 0) {
          const firstSession = this.sessions[0]; // Select the first session
          this.activeSessionId = firstSession.threadId; // Set the active session ID
          console.log(firstSession.threadId);
          console.log(this.activeSessionId);

          this.sendThreadIdToChat(firstSession.threadId); // Send thread ID to chat

          this.onClick(true); // Update the thread state
        }
      },
      error: (err) => {
        console.error('API Error:', err);
      }
    });
  }

  sendThreadIdToChat(threadId: string) {
    console.log(threadId);

    this.onClick(true)
    this.activeSessionId = threadId;
    this.sessionService.setThreadId(threadId);
  }

  onClick(isThread: boolean) {
    this.sessionService.setIsThread(isThread);
  }

  openSession(): void {
    const dialogRef = this.dialog.open(CreateSessionComponent, {
      width: '60%',
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.dialog.closeAll()
      console.log('Dialog closed with result:', result);
    });
  }
}