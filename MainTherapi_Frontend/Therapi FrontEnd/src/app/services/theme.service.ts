import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private theme = new BehaviorSubject<'light' | 'dark' | 'dark-variant'>('dark');
  theme$ = this.theme.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    // Set initial theme only in browser
    if (isPlatformBrowser(this.platformId)) {
      this.setTheme('dark');
    }
  }

  setTheme(theme: 'light' | 'dark' | 'dark-variant')
   {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.setAttribute('data-theme', theme);
      this.theme.next(theme);
    }
  }

  toggleTheme() {
    const current = this.theme.getValue();
    this.setTheme(current === 'light' ? 'dark' : 'light');
  }
}
