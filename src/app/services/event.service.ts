import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EventResponse {
  id: string;
  start_time: string;
  competitors: Array<{ id?: string; name: string; role?: string }>;
  season_id?: string | null;
  season_name?: string | null;
  round?: string | null;
  latest_snapshot?: {
    id: string;
    market_type: string;
    bookmaker: string;
    captured_at: string;
    odds: Record<string, number>;
  } | null;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  createEvent(payload: {
    id?: string;
    start_time: string;
    competitors: Array<{ id?: string; name: string; role?: string }>;
    season_id?: string;
    round?: string | null;
    price_snapshot?: {
      market_type?: string;
      bookmaker: string;
      captured_at?: string;
      odds: Record<string, number>;
    };
  }): Observable<EventResponse> {
    return this.http.post<EventResponse>(`${this.baseUrl}/api/events`, payload);
  }

  listEvents(): Observable<EventResponse[]> {
    return this.http.get<EventResponse[]>(`${this.baseUrl}/api/events`);
  }

  getEvent(eventId: string): Observable<EventResponse> {
    return this.http.get<EventResponse>(`${this.baseUrl}/api/events/${eventId}`);
  }

  updateEvent(
    eventId: string,
    payload: {
      start_time?: string;
      competitors?: Array<{ id?: string; name: string; role?: string }>;
      season_id?: string | null;
      round?: string | null;
    }
  ): Observable<EventResponse> {
    return this.http.put<EventResponse>(`${this.baseUrl}/api/events/${eventId}`, payload);
  }

  deleteEvent(eventId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/events/${eventId}`);
  }
}
