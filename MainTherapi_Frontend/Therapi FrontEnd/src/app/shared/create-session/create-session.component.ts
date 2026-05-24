import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AzureAiService } from '../../../../build/api';
import { SessionUpdateService } from '../../services/session-update.service';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ToastService } from '../../services/toast-message.service';

@Component({
  selector: 'app-create-session',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, MatDialogModule],
  templateUrl: './create-session.component.html',
  styleUrl: './create-session.component.scss'
})
export class CreateSessionComponent {
  threadName = new FormControl(null);

  constructor(
    private AiApiService: AzureAiService, 
    private sessionUpdateService: SessionUpdateService,
    private toastService: ToastService,
    private dialogRef: MatDialogRef<CreateSessionComponent>

  ) {}

  createSession() {
    this.AiApiService.apiAzureAiCreateThreadPost(this.threadName.value ?? '').subscribe({
      next: (res) => {
        this.toastService.showToast({
          title: 'Success',
          message: 'Your session has been created successfully!',
          type: 'success',
        });

        console.log(res);
        this.sessionUpdateService.notifySessionCreated();
        this.closePopup()
      },
      error: (err) => {
        this.toastService.showToast({
          title: 'Error',
          message: 'Failed to create session. Please try again.',
          type: 'error',
        });
        console.error('Error creating session:', err);
      }
    })
  }

  closePopup(): void {
    this.dialogRef.close()
  }
}
