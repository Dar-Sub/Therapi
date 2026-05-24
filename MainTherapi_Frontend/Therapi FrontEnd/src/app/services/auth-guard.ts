import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private _authService: AuthService, private _router: Router) {
    console.log('AuthGuard: Is Logged In:', this._authService.isLoggedIn);
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    console.log(this._authService.UserData);
    if (this._authService.isLoggedIn) {
      return true
    } else {
      this._router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
  }
}
