import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RecommendationResponse {
  recommendation: {
    id: string;
    event_id: string;
    market_type: string;
    outcome_selected?: string | null;
    recommended: boolean;
    recommended_market_variant: string;
    stake_amount: number;
    stake_fraction: number;
    created_at: string;
  };
  explanation: {
    human_summary: { decision: string; risk: string; reason: string };
    technical: {
      p_modelo: number;
      p_mercado: number;
      edge: number;
      ev: number;
      odds: number;
      kelly_raw: number;
      kelly_fraction_used: number;
      stake_fraction_capped: number;
    };
    factors: Array<{ key: string; label: string; weight: number; detail: string }>;
  };
}

@Injectable({ providedIn: 'root' })
export class CoreApiService {
  private readonly baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  createPriceSnapshot(payload: {
    id?: string;
    event_id: string;
    market_type: string;
    bookmaker: string;
    captured_at: string;
    odds: Record<string, number>;
  }): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(`${this.baseUrl}/api/price-snapshots`, payload);
  }

  createModelPrediction(payload: {
    id?: string;
    event_id: string;
    market_type: string;
    created_at: string;
    probs: Record<string, number>;
    model_version: string;
    features?: Record<string, number>;
  }): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(`${this.baseUrl}/api/model-predictions`, payload);
  }

  runRecommendation(payload: {
    event_id: string;
    snapshot_id: string;
    prediction_id: string;
    bankroll: number;
  }): Observable<RecommendationResponse> {
    return this.http.post<RecommendationResponse>(
      `${this.baseUrl}/api/recommendations/run`,
      payload
    );
  }

  getRecommendation(id: string): Observable<RecommendationResponse> {
    return this.http.get<RecommendationResponse>(`${this.baseUrl}/api/recommendations/${id}`);
  }
}
