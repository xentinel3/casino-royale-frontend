import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EloRatingRecord {
  competitor_id: string;
  competitor_name: string;
  rating: number;
  scope: string;
  season?: string | null;
  updated_at: string;
}

export interface EloTrainResponse {
  total_matches: number;
  season_count: number;
  updated_all_time: number;
  updated_season: number;
}

@Injectable({ providedIn: 'root' })
export class EloService {
  private readonly baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  trainElo(season?: string): Observable<EloTrainResponse> {
    return this.http.post<EloTrainResponse>(`${this.baseUrl}/api/elo/train`, null, {
      params: season ? { season } : {}
    });
  }

  listRatings(scope?: string, season?: string, limit: number = 200): Observable<EloRatingRecord[]> {
    const params: Record<string, string | number> = { limit };
    if (scope) {
      params['scope'] = scope;
    }
    if (season) {
      params['season'] = season;
    }
    return this.http.get<EloRatingRecord[]>(`${this.baseUrl}/api/elo/ratings`, { params });
  }
}
