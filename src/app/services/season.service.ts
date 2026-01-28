import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SeasonRecord {
  id: string;
  name: string;
  start_date?: string | null;
  end_date?: string | null;
}

@Injectable({ providedIn: 'root' })
export class SeasonService {
  private readonly baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  listSeasons(): Observable<SeasonRecord[]> {
    return this.http.get<SeasonRecord[]>(`${this.baseUrl}/api/seasons`);
  }
}
