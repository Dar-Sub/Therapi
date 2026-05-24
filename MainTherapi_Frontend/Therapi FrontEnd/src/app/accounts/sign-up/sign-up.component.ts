import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AccountsModel, AccountsService } from '../../../../build/api';
import { PopupService } from '../../services/message-service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  passwordFieldType: string = 'password';
  registerForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private accountsApiService: AccountsService,
    private router: Router,
    private _fb: FormBuilder,
    private popupService: PopupService
  ) {
    this.registerForm = this._fb.group({
      name: new FormControl(null, [Validators.required, Validators.minLength(3)]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/) // At least 1 uppercase, 1 number
      ]),
    })
  }

  ngOnInit() {

  }

  register() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const accountsModel: AccountsModel = {
        name: this.registerForm.controls['name'].value ?? '',
        email: this.registerForm.controls['email'].value ?? '',
        password: this.registerForm.controls['password'].value ?? ''
      }
      this.accountsApiService.apiAccountsRegisterUserPost(accountsModel).subscribe({
        next: (res) => {
          console.log(res);
          if (res.statusCode === 200) {
            this.showPopup(res.message ?? '', 'Welcome aboard! Start exploring all available features today.', 'Login', '/images/message-popup.svg')
            this.isLoading = false;
          } else {
            this.showPopup(res.message ?? '', 'Oops! Something went wrong.', 'Okay', '/images/failed-popup.svg')
            this.isLoading = false;
          }
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
          this.showPopup(err.statusText ?? '', 'Please try again after sometime', 'Okay', '/images/failed-popup.svg')
          this.isLoading = false;
        },
      })
    } else {
      this.showPopup('Oops!', 'Please Enter Required fields', 'Okay', '/images/failed-popup.svg')
    }
  }

  togglePassword(): void {
    this.passwordFieldType =
      this.passwordFieldType === 'password' ? 'text' : 'password';
  }


  showPopup(title: string, message: string, actionText: string, icon: any): void {
    this.popupService.openPopup(
      title,
      message,
      actionText,
      icon
    );
  }

  BackToLogin() {
    this.router.navigate(['/login']);
  }

  focusNext(nextFieldId: string): void {
    const nextField = document.getElementById(nextFieldId) as HTMLInputElement;
    if (nextField) {
      nextField.focus();
    }
  }
  
}
