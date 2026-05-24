import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Configuration, LoginResponse } from '../../../build/api';
import { isPlatformBrowser } from '@angular/common';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _loginListener = new BehaviorSubject<boolean>(false);
  loginListener$ = this._loginListener.asObservable();

  _userDetailsListener = new BehaviorSubject<LoginResponse | null>(null);
  userDetailsListener$ = this._userDetailsListener.asObservable();

  isLoggedIn = false;
  private _storageType: 'session' | 'local' = 'session';

  get storageType(): Storage | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return this._storageType === 'session' ? sessionStorage : localStorage;
  }

  set storagePreference(type: 'session' | 'local') {
    this._storageType = type;
  }

  get UserData(): LoginResponse | null {
    if (!this.storageType) return null;
    try {
      const userData = this.storageType.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing userData from storage:', error);
      return null;
    }
  }

  get token(): string | null {
    try {
      const token = this.UserData?.accessToken || null;
      console.log('Retrieved token:', token);
      return token;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  }

  get isTokenExpired(): boolean {
    const token = this.token;
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert seconds to milliseconds
      return Date.now() > expiry;
    } catch (error) {
      console.error('Error parsing token payload:', error);
      return true;
    }
  }

  constructor(private _configuration: Configuration, private _router: Router, @Inject(PLATFORM_ID) private platformId: any, private sessionService: SessionService,) {
    if (!_configuration) {
      throw new Error('Configuration must be provided.');
    }

    this.checkLogin();
  }

  checkLogin(): void {
    const userData = this.UserData;
    if (userData) {
      this.isLoggedIn = true;
      this._loginListener.next(true);
    } else {
      this.isLoggedIn = false;
      this._loginListener.next(false);
    }
  }

  // private parseJwt(token: string): any {
  //   const base64Url = token.split('.')[1];
  //   const base64 = decodeURIComponent(atob(base64Url).split('').map((c) => {
  //     return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  //   }).join(''));
  //   const res = JSON.parse(base64) as UserToken;
  //   return res;
  // }

  logout(): void {
    if (this.storageType) {
      this.storageType.clear();
    }

    this.sessionService.setIsThread(null)
    this.sessionService.setIsThread(false)

    this.sessionService.setThreadId('');
    this.isLoggedIn = false;
    this._loginListener.next(false);
    this._router.navigate(['/']);
  }
}