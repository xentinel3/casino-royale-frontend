import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'casino_theme';
  private readonly darkTheme = 'luxury';
  private readonly lightTheme = 'emerald';
  private currentTheme = this.darkTheme;

  init(): void {
    const saved = localStorage.getItem(this.storageKey);
    if (saved === this.lightTheme || saved === this.darkTheme) {
      this.currentTheme = saved;
    }
    this.applyTheme(this.currentTheme);
  }

  toggle(): void {
    this.currentTheme = this.currentTheme === this.darkTheme ? this.lightTheme : this.darkTheme;
    this.applyTheme(this.currentTheme);
  }

  isDark(): boolean {
    return this.currentTheme === this.darkTheme;
  }

  private applyTheme(theme: string): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.storageKey, theme);
  }
}
