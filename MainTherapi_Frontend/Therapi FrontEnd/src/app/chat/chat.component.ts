import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { TruncateWordsPipe } from '../services/truncate.service';
import { ChatService, Message } from '../services/chat.service';
import { AzureAiService } from '../../../build/api';
import { SessionUpdateService } from '../services/session-update.service';
import { SessionService } from '../services/session.service';
import { SideNavComponent } from '../main/side-nav/side-nav.component';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { CreateSessionComponent } from '../shared/create-session/create-session.component';
import { HttpErrorResponse } from '@angular/common/http';
import { PopupService } from '../services/message-service';
import { ToastService } from '../services/toast-message.service';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TruncateWordsPipe, SideNavComponent, RouterOutlet,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatSidenavModule,
    TruncateWordsPipe,
    SideNavComponent,
    CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLDivElement>;
  inputHeight: number = 40;
  timeRemaining!: 'adsasd'
  sessionsLeft!: 'adsasda'

  private sessionUpdateSource = new Subject<void>();
  sessionUpdated$ = this.sessionUpdateSource.asObservable();

  threadName = new FormControl(null, Validators.required);
  messages: Message[] = [];
  currentMessage = '';
  isListening = false;
  isLoading = false;
  isCreateLoading = false;
  isChatLoading = false;
  isThread = false;
  threadId: string | null = null;
  expandedMessages: Set<number> = new Set();
  private previousMessageCount = 0;



  isSidenavOpen: boolean = false; // Default sidenav state
  sidenavMode: 'side' | 'over' = 'side';
  showMenuIcon: boolean = false;

  constructor(
    private chatService: ChatService,
    private AiApiService: AzureAiService,
    private sessionService: SessionService,
    private sessionUpdateService: SessionUpdateService,
    private breakpointObserver: BreakpointObserver,
    private _dialog: MatDialog,
    private popupService: PopupService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef

    // private speechService: SpeechService
  ) { }

  // toggleSidenav(): void {
  //   console.log('Toggling sidenav...');
  //   this.isSidenavOpen = !this.isSidenavOpen; // Toggle the sidenav state
  //   this.showMenuIcon = !this.isSidenavOpen;
  // }

  // closeSidenav(): void {
  //   console.log('Sidenav closed from parent');
  //   this.isSidenavOpen = false; // Close the sidenav
  //   this.showMenuIcon = true;

  // }
  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
    if (this.isSidenavOpen) {
      document.body.style.overflow = 'hidden'; // Disable body scrolling
    } else {
      document.body.style.overflow = 'auto'; // Enable body scrolling
    }
  }

  closeSidenav(): void {
    this.isSidenavOpen = false;
    document.body.style.overflow = 'auto'; // Enable body scrolling

  }



  ngOnInit() {
    // console.log(this.isThread);
    // const savedThreadId = localStorage.getItem('threadId');
    // const savedIsThread = localStorage.getItem('isThread') === 'true';

    // if (savedThreadId) {
    //   this.threadId = savedThreadId;
    //   this.isThread = savedIsThread;
    //   console.log(this.threadId);
    //   console.log(this.isThread);

    //   if (this.isThread) {
    //     this.getMessage(this.threadId); // Fetch messages for the saved thread
    //   }
    // }

    // combineLatest([
    //   this.sessionService.threadId$,
    //   this.sessionService.isThread$
    // ]).subscribe(([threadId, isThread]) => {
    //   if (threadId) {
    //     alert(1)
    //     this.threadId = threadId;
    //     // localStorage.setItem('threadId', threadId); // Save threadId in localStorage
    //     // this.getMessage(threadId); // Fetch messages for the thread
    //   }
    //   this.isThread = Boolean(isThread);
    //   // localStorage.setItem('isThread', String(this.isThread)); // Save isThread in localStorage
    //   console.log('isThread:', this.isThread);
    // });

    // console.log(this.isThread);

    // this.sessionService.threadId$.subscribe((threadId) => {
    //   if (threadId) {
    //     this.threadId = threadId;
    //     this.getMessage(threadId);
    //   }
    // });
    // this.sessionService.isThread$.subscribe((isThread) => {
    //   this.isThread = Boolean(isThread);
    //   console.log(this.isThread);
    // });
    this.sessionService.threadId$.subscribe((threadId) => {
      console.log(threadId);

      if (threadId) {
        this.threadId = threadId;
        this.getMessage(threadId);
      } else {
        this.threadId = null;
        this.messages = [];
      }
    });
    this.sessionService.isThread$.subscribe((isThread) => {
      this.isThread = Boolean(isThread);
      console.log(this.isThread);
    });

    this.chatService.messages$.subscribe(messages => {
      this.messages = messages;
      this.isLoading = false;
      this.scrollToBottom();
    });

    const CUSTOM_BREAKPOINTS = {
      mobile: '(max-width: 767px)', // Custom mobile breakpoint
      tablet: '(min-width: 768px) and (max-width: 1023px)', // Custom tablet breakpoint
      desktop: '(min-width: 1024px)', // Custom desktop breakpoint
    };
    this.breakpointObserver
      .observe([CUSTOM_BREAKPOINTS.mobile, CUSTOM_BREAKPOINTS.tablet, CUSTOM_BREAKPOINTS.desktop])
      .subscribe((state) => {
        console.log('Custom Breakpoint state:', state.breakpoints); // Debugging output

        if (state.breakpoints[CUSTOM_BREAKPOINTS.mobile]) {
          console.log('Mobile view');
          this.sidenavMode = 'over';
          this.isSidenavOpen = false;
        } else if (state.breakpoints[CUSTOM_BREAKPOINTS.tablet]) {
          console.log('Tablet view');
          this.sidenavMode = 'over';
          this.isSidenavOpen = false;
        } else if (state.breakpoints[CUSTOM_BREAKPOINTS.desktop]) {
          console.log('Desktop view');
          this.sidenavMode = 'side';
          this.isSidenavOpen = true;
        } else {
          console.log('Default view');
          this.sidenavMode = 'side';
          this.isSidenavOpen = true;
        }
      });


    // this.getMessage('thread_uLHttQZcyMlvaD4GnO7Zd0vz')

    this.chatService.messages$.subscribe(messages => {
      this.messages = messages;
      this.isLoading = false;
      setTimeout(() => this.scrollToBottom(), 300);
    });
  }

  toggleThread(value: boolean): void {
    this.isThread = value;
    if (!value) {
      this.threadId = null;
      this.messages = [];
      localStorage.removeItem('threadId');
      localStorage.removeItem('isThread');
    }
  }

  toggleContent(index: number): void {
    if (this.expandedMessages.has(index)) {
      this.expandedMessages.delete(index); // Collapse the message
    } else {
      this.expandedMessages.add(index); // Expand the message
    }
  }

  isExpanded(index: number): boolean {
    return this.expandedMessages.has(index);
  }

  // ngAfterViewChecked() {
  //   this.scrollToBottom();
  // }

  // ngAfterViewInit(): void {
  //   if (this.scrollContainer) {
  //     console.log("✅ scrollContainer initialized:", this.scrollContainer);
  //     this.scrollToBottom();
  //   } else {
  //     console.warn("❌ scrollContainer is still undefined in ngAfterViewInit()");
  //   }

  //   if (this.messageInput) {
  //     this.messageInput.nativeElement.focus();
  //   }
  // }
  ngAfterViewInit(): void {
    this.cdr.detectChanges(); // Ensure ViewChild is available
    setTimeout(() => this.scrollToBottom(), 300);
  }

  ngAfterViewChecked() {
    if (this.messages.length !== this.previousMessageCount) {
      this.previousMessageCount = this.messages.length;
      this.scrollToBottom();
    }
  }
  

  private scrollToBottom(): void {
    try {
      if (!this.scrollContainer || !this.scrollContainer.nativeElement) {
        setTimeout(() => this.scrollToBottom(), 300);
        return;
      }

      setTimeout(() => {
        const container = this.scrollContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }, 100);
    } catch (err) {
      console.error("Error scrolling to bottom:", err);
    }
  }

  sendMessages(event?: KeyboardEvent): void {
    if (event) {
      event.preventDefault();
    }

    console.log(this.currentMessage);

    if (this.currentMessage.trim()) {
      const userMessage: Message = {
        sender: 'user',
        content: this.currentMessage,
        timestamp: new Date(),
      };

      this.messages.push(userMessage);
      this.scrollToBottom();

      this.isLoading = true;
      this.AiApiService.apiAzureAiCreateMessagePost(this.threadId ?? 'thread_uLHttQZcyMlvaD4GnO7Zd0vz', userMessage.content)
        .subscribe({
          next: (response: any) => {
            console.log(response);

            if (response.length > 0) {
              const cleanedResponse = response[0].content.replace(/[#*]/g, '');
              this.simulateTypingEffect(cleanedResponse);
            }

            // const assistantMessage: Message = {
            //   sender: response[0].role === 'assistant' ? 'ai' : 'user' as 'ai' | 'user',
            //   content: response[0].content, // Adjust based on the API response structure
            //   timestamp: new Date(),
            // };
            // this.messages.push(assistantMessage);
            // console.log('Updated Messages:', this.messages);

            this.isLoading = false; // Stop loading animation
            this.scrollToBottom();
          },
          error: (err) => {
            console.error('Failed to send message or fetch response:', err);

            this.isLoading = false;

            // Add an error message to the chat
            const errorMessage: Message = {
              sender: 'ai',
              content: 'Sorry, there was an error processing your request. Please try again later.',
              timestamp: new Date(),
            };

            this.messages.push(errorMessage);
            this.scrollToBottom();
          },
        });

      if (this.messageInput && this.messageInput.nativeElement) {
        const inputEl = this.messageInput.nativeElement;

        // Adjust height to original and clear the input
        inputEl.style.height = '50px'; // Reset height to original
        inputEl.style.transition = 'opacity 0.3s'; // Add transition effect
        inputEl.style.opacity = '0'; // Fade out
        inputEl.style.overflow = 'hidden'; // Fade out

        setTimeout(() => {
          inputEl.innerText = ''; // Clear text after the transition
          inputEl.style.opacity = '1'; // Reset opacity for further inputs
        }, 300); // Match the duration of the transition
      }

      this.currentMessage = '';
    }
  }

  simulateTypingEffect(fullText: string): void {
    let index = 0;
    const typingSpeed = 30; // Adjust speed as needed
    fullText = fullText.replace(/[#*]/g, '');

    const botMessage: Message = {
      sender: 'ai',
      content: '', // Empty at first
      timestamp: new Date(),
    };

    this.messages.push(botMessage);
    this.scrollToBottom();

    const interval = setInterval(() => {
      if (index < fullText.length) {
        botMessage.content += fullText[index]; // Type character by character
        index++;
        this.scrollToBottom();
      } else {
        clearInterval(interval);
        this.isLoading = false; // Stop loading after typing completes
      }
    }, typingSpeed);
  }

  autoResize(input: HTMLInputElement): void {
    input.style.height = 'auto'; // Reset height to calculate scrollHeight properly
    input.style.height = `${input.scrollHeight}px`; // Set height based on content
  }

  onInput(event: Event): void {
    const target = event.target as HTMLDivElement; // Explicitly cast target to HTMLDivElement
    this.currentMessage = target?.innerText.trim() || ''; // Safely access innerText
    if (target) {
      target.style.height = '40px'; // Reset height to original
      target.style.height = `${target.scrollHeight}px`; // Expand based on content
    }
  }

  createSession() {
    if (this.threadName.valid) {
      this.isCreateLoading = true
      this.AiApiService.apiAzureAiCreateThreadPost(this.threadName.value ?? '').subscribe({
        next: (res) => {
          console.log(res);
          if (res) {
            // this.showPopup('Session Created Successfully', 'Ready to Explore? Your Session is Set Up!', 'Okay', '/images/message-popup.svg')
            this.toastService.showToast({
              title: 'Session Created Successfully',
              message: 'Ready to Explore? Your Session is Set Up!',
              type: 'success',
            });
            this.isCreateLoading = false
            this.threadName.reset()
            this.sessionUpdateService.notifySessionCreated();
          } else {
            this.toastService.showToast({
              title: 'Session Creation Failed',
              message: 'Oops! Something went wrong. Please try again.',
              type: 'error',
            });
            this.isCreateLoading = false
          }
        },
        error: (err: HttpErrorResponse) => {
          this.toastService.showToast({
            title: err.statusText,
            message: 'Oops! Something went wrong. Please try again.',
            type: 'error',
          });
        }
      })
    }
  }

  // notifySessionCreated() {
  //   this.sessionUpdateSource.next();
  // }

  showPopup(title: string, message: string, actionText: string, icon: any): void {
    this.popupService.openPopup(
      title,
      message,
      actionText,
      icon
    );
  }

  getMessage(threadId: string): void {
    console.log('Fetching messages for thread:', threadId);
    const resolvedThreadId = threadId ? threadId : this.threadId;
    this.isChatLoading = true;

    this.AiApiService.apiAzureAiGetMessagesGet(resolvedThreadId ?? '').subscribe({
      next: (res) => {
        console.log(res);
        this.messages = [];

        if (!res || !Array.isArray(res)) {
          console.warn('Received empty or invalid response:', res);
          this.messages = []; // Clear messages to avoid stale data
          this.isThread = true;
          this.isChatLoading = false; // Stop loading
          return;
        }
        // Map the response to the messages format
        const formattedMessages: Message[] = res.map((item: any) => ({
          sender: item.role === 'assistant' ? 'ai' : 'user' as 'ai' | 'user', // Explicitly cast
          content: item.content.replace(/[#*]/g, ''),
          timestamp: new Date(), // Add timestamp
        })).reverse(); // Reverse the order from last to first

        // Update the messages array
        this.messages.push(...formattedMessages);

        // Set isThread to true and scroll to the bottom
        this.isThread = true;
        this.isChatLoading = false;
        setTimeout(() => this.scrollToBottom(), 300);


      },
      error: (err) => {
        console.error('Failed to fetch messages:', err);
        this.isChatLoading = false;
      },
    });
  }


}
