import { NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import {
  LogOut,
  LucideAngularModule,
  Moon,
  PanelRightClose,
  PanelRightOpen,
  Spade,
  Sun,
} from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, NgClass, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  sessionUser = '';
  sessionExpires = '';
  sessionError = '';
  isLoadingSession = true;
  spadeIcon = Spade;
  sunIcon = Sun;
  moonIcon = Moon;
  logoutIcon = LogOut;
  sidebarOpenIcon = PanelRightOpen;
  sidebarCloseIcon = PanelRightClose;
  isSidebarOpen = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (response) => {
        this.sessionUser = response.user;
        this.sessionExpires = new Date(response.expires_at * 1000).toLocaleString();
        this.isLoadingSession = false;
      },
      error: () => {
        this.sessionError = 'No se pudo cargar la sesion.';
        this.isLoadingSession = false;
      },
    });
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  isDark(): boolean {
    return this.themeService.isDark();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  handleLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.clearSession();
        this.router.navigateByUrl('/login');
      },
      error: () => {
        this.authService.clearSession();
        this.router.navigateByUrl('/login');
      },
    });
  }
}
