import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HistoryRecord {
  id: string;
  match_date: string;
  season: string;
  home_team: string;
  away_team: string;
  home_goals: number;
  away_goals: number;
  round?: string | null;
  source?: string | null;
}

export interface HistoryImportResponse {
  inserted: number;
  skipped: number;
  errors: string[];
  error_count: number;
}

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private readonly baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  uploadHistory(file: File): Observable<HistoryImportResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<HistoryImportResponse>(`${this.baseUrl}/api/history/import`, formData);
  }

  listHistory(limit: number = 200): Observable<HistoryRecord[]> {
    return this.http.get<HistoryRecord[]>(`${this.baseUrl}/api/history`, {
      params: { limit }
    });
  }
}
