import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { Diamond, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf, LucideAngularModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  diamondIcon = Diamond;

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  toggleTheme(): void {
    this.themeService.toggle();
  }

  isDark(): boolean {
    return this.themeService.isDark();
  }

  submit(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Completa usuario y contrasena.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        localStorage.setItem('casino_token', response.token);
        localStorage.setItem('casino_user', response.user);
        localStorage.setItem('casino_expires', response.expires_at);
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.errorMessage =
          err?.error?.detail ?? 'No se pudo iniciar sesion. Intenta de nuevo.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
