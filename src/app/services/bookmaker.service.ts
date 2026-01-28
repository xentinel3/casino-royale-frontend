import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BookmakerRecord {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class BookmakerService {
  private readonly baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  listBookmakers(): Observable<BookmakerRecord[]> {
    return this.http.get<BookmakerRecord[]>(`${this.baseUrl}/api/bookmakers`);
  }
}
