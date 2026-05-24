import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AccountsModel, AccountsService, LoginResponse } from '../../../../build/api';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PopupService } from '../../services/message-service';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  passwordFieldType: string = 'password';
  loginForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private _authService: AuthService,
    private accountsApiService: AccountsService,
    private router: Router,
    private _activatedRoute: ActivatedRoute,
    private _fb: FormBuilder,
    private popupService: PopupService
  ) {
    console.log('AuthService:', this._authService);
    console.log('AccountsService:', this.accountsApiService);
    console.log('PopupService:', this.popupService);

    this.loginForm = this._fb.group({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6), Validators.maxLength(20),
      Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/) // At least one letter, one number, and optional special characters
      ]),
    })
  }

  ngOnInit() {
    this._authService.checkLogin();

    const returnUrl = this._activatedRoute.snapshot.queryParams['returnUrl'] || '/';
    console.log(returnUrl);

    this._authService.loginListener$.subscribe((loggedIn) => {
      console.log(loggedIn);

      if (loggedIn) {
        const userData = this._authService.UserData;
        this.router.navigate([returnUrl]);
      }
    });
  }

  login(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const accountsModel: AccountsModel = {
        name: '',
        email: this.loginForm.controls['email'].value ?? '',
        password: this.loginForm.controls['password'].value ?? ''
      }
      this.accountsApiService.apiAccountsLoginPost(accountsModel).subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            const data: LoginResponse = {
              accessToken: res.data?.accessToken,
              expiresIn: res.data?.expiresIn,
              role: res.data?.role,
              tokenType: res.data?.tokenType,
              userName: res.data?.userName
            };
            this._authService.storageType?.setItem('userData', JSON.stringify(data));
            this._authService.checkLogin();
            this.showPopup(res.message ?? '', 'Welcome aboard! Start exploring all available features today.', 'Start chat', '/images/message-popup.svg')
            this.isLoading = false;
          } else {
            this.showPopup(res.message ?? '', 'Oops! Something went wrong.', 'Okay', '/images/failed-popup.svg')
            this.isLoading = false;
          }
          this.isLoading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
          this.showPopup(err.statusText ?? '', 'Please try again later', 'Okay', '/images/failed-popup.svg')
          this.isLoading = false;
        },
      });
    } else {
      this.showPopup('Oops!', 'Something went wrong.', 'Okay', '/images/failed-popup.svg')
      this.showPopup('Validation Error', 'Please correct the errors in the form.', 'Okay', '/images/failed-popup.svg');
    }
  }


  togglePassword(): void {
    this.passwordFieldType =
      this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  navigateToSignUp(): void {
    this.router.navigate(['/sign-up']);
  }

  showPopup(title: string, message: string, actionText: string, icon: any): void {
    this.popupService.openPopup(
      title,
      message,
      actionText,
      icon
    );
  }

  get emailError(): string {
    const emailControl = this.loginForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'Email is required';
    }
    if (emailControl?.hasError('email')) {
      return 'Invalid email format';
    }
    return '';
  }

  get passwordError(): string {
    const passwordControl = this.loginForm.get('password');
    if (passwordControl?.hasError('required')) {
      return 'Password is required';
    }
    if (passwordControl?.hasError('minlength')) {
      return 'Password must be at least 6 characters long';
    }
    if (passwordControl?.hasError('maxlength')) {
      return 'Password must not exceed 20 characters';
    }
    if (passwordControl?.hasError('pattern')) {
      return 'Password must contain at least one letter and one number';
    }
    return '';
  }

  focusNext(nextFieldId: string): void {
    const nextField = document.getElementById(nextFieldId) as HTMLInputElement;
    if (nextField) {
      nextField.focus();
    }
  }
  
}
