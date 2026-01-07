import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginResponse {
  token: string;
  user: string;
  expires_at: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, {
      username,
      password,
    });
  }

  me(): Observable<{ user: string; expires_at: number }> {
    return this.http.get<{ user: string; expires_at: number }>(`${this.baseUrl}/me`);
  }

  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/auth/logout`, {});
  }

  getToken(): string | null {
    return localStorage.getItem('casino_token');
  }

  clearSession(): void {
    localStorage.removeItem('casino_token');
    localStorage.removeItem('casino_user');
  }
}
