import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CompetitorRecord {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class CompetitorService {
  private readonly baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  listCompetitors(): Observable<CompetitorRecord[]> {
    return this.http.get<CompetitorRecord[]>(`${this.baseUrl}/api/competitors`);
  }
}
