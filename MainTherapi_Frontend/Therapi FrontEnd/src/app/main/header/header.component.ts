import { Component, ElementRef, HostListener } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ProfileComponent } from '../../shared/profile/profile.component';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PopupService } from '../../services/message-service';
@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  dropdownVisible: boolean = false;
  isProfileDropdownVisible = false;

  toggleProfileDropdown() {
    this.isProfileDropdownVisible = !this.isProfileDropdownVisible;
  }


  constructor(
    public themeService: ThemeService,
    private _dialog: MatDialog,
    private router: Router,
    public authService: AuthService,
    private popupService: PopupService,
    private eRef: ElementRef
    // private _activatedRoute: ActivatedRoute,
  ) {}

  toggleDropdown(): void {
    this.dropdownVisible = !this.dropdownVisible;
  }

  setTheme(theme: 'light' | 'dark' | 'dark-variant'): void {
    this.themeService.setTheme(theme);
    this.dropdownVisible = false; // Close dropdown after selection
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.dropdownVisible = false;
    }
  }

  // goToProfile() {
  //   this._dialog.open(ProfileComponent, {
  //     width: '700px',
  //     height:'550px',
  //   }).afterClosed().subscribe(result => {
  //     if (result) {
  //       this._dialog.closeAll()
  //     }
  //   })
  // }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  showPopup(title: string, message: string, actionText: string, icon: any): void {
    this.popupService.openPopup(
      title,
      message,
      actionText,
      icon
    );
  }

  logOut() {
    this.showPopup('Are you sure you want to log out?', 'Logging out will end your current session and require you to log in again to access your account.', 'Logout', '/images/message-popup.svg')
  }
}
