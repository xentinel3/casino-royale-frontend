import { DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CoreApiService, RecommendationResponse } from '../../services/core-api.service';
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
  imports: [NgIf, NgFor, NgClass, DecimalPipe, FormsModule, LucideAngularModule],
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
  eventStatus = '';
  snapshotStatus = '';
  predictionStatus = '';
  recommendationStatus = '';
  latestRecommendation: RecommendationResponse | null = null;

  eventForm = {
    id: '',
    startTime: '',
    homeName: '',
    awayName: '',
    season: '',
    round: ''
  };
  snapshotForm = {
    id: '',
    eventId: '',
    bookmaker: 'dummy',
    capturedAt: '',
    homeOdds: 2.4,
    drawOdds: 3.2,
    awayOdds: 3.1
  };
  predictionForm = {
    id: '',
    eventId: '',
    createdAt: '',
    modelVersion: 'dummy',
    homeProb: 0.52,
    drawProb: 0.25,
    awayProb: 0.23,
    ratingDiff: 0.4
  };
  runForm = {
    eventId: '',
    snapshotId: '',
    predictionId: '',
    bankroll: 1000
  };

  constructor(
    private authService: AuthService,
    private coreApi: CoreApiService,
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

  private toIso(value: string): string {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return new Date().toISOString();
    }
    return parsed.toISOString();
  }

  submitEvent(): void {
    this.eventStatus = '';
    const metadata: Record<string, string> = {};
    if (this.eventForm.season.trim()) {
      metadata['season'] = this.eventForm.season.trim();
    }
    if (this.eventForm.round.trim()) {
      metadata['round'] = this.eventForm.round.trim();
    }

    this.coreApi
      .createEvent({
        id: this.eventForm.id.trim() || undefined,
        start_time: this.toIso(this.eventForm.startTime),
        competitors: [
          { name: this.eventForm.homeName, role: 'HOME' },
          { name: this.eventForm.awayName, role: 'AWAY' }
        ],
        metadata
      })
      .subscribe({
        next: (response) => {
          this.eventStatus = `Evento creado: ${response.id}`;
          this.snapshotForm.eventId = response.id;
          this.predictionForm.eventId = response.id;
          this.runForm.eventId = response.id;
        },
        error: (error) => {
          this.eventStatus = error?.error?.detail || 'Error creando evento.';
        }
      });
  }

  submitSnapshot(): void {
    this.snapshotStatus = '';
    this.coreApi
      .createPriceSnapshot({
        id: this.snapshotForm.id.trim() || undefined,
        event_id: this.snapshotForm.eventId.trim(),
        market_type: 'WINNER_3WAY',
        bookmaker: this.snapshotForm.bookmaker.trim(),
        captured_at: this.toIso(this.snapshotForm.capturedAt),
        odds: {
          HOME: Number(this.snapshotForm.homeOdds),
          DRAW: Number(this.snapshotForm.drawOdds),
          AWAY: Number(this.snapshotForm.awayOdds)
        }
      })
      .subscribe({
        next: (response) => {
          this.snapshotStatus = `Snapshot creado: ${response.id}`;
          this.runForm.snapshotId = response.id;
        },
        error: (error) => {
          this.snapshotStatus = error?.error?.detail || 'Error creando snapshot.';
        }
      });
  }

  submitPrediction(): void {
    this.predictionStatus = '';
    this.coreApi
      .createModelPrediction({
        id: this.predictionForm.id.trim() || undefined,
        event_id: this.predictionForm.eventId.trim(),
        market_type: 'WINNER_3WAY',
        created_at: this.toIso(this.predictionForm.createdAt),
        probs: {
          HOME: Number(this.predictionForm.homeProb),
          DRAW: Number(this.predictionForm.drawProb),
          AWAY: Number(this.predictionForm.awayProb)
        },
        model_version: this.predictionForm.modelVersion.trim(),
        features: {
          rating_diff: Number(this.predictionForm.ratingDiff)
        }
      })
      .subscribe({
        next: (response) => {
          this.predictionStatus = `Prediccion creada: ${response.id}`;
          this.runForm.predictionId = response.id;
        },
        error: (error) => {
          this.predictionStatus = error?.error?.detail || 'Error creando prediccion.';
        }
      });
  }

  submitRecommendation(): void {
    this.recommendationStatus = '';
    this.latestRecommendation = null;
    this.coreApi
      .runRecommendation({
        event_id: this.runForm.eventId.trim(),
        snapshot_id: this.runForm.snapshotId.trim(),
        prediction_id: this.runForm.predictionId.trim(),
        bankroll: Number(this.runForm.bankroll)
      })
      .subscribe({
        next: (response) => {
          this.latestRecommendation = response;
          this.recommendationStatus = 'Recomendacion generada.';
        },
        error: (error) => {
          this.recommendationStatus = error?.error?.detail || 'Error generando recomendacion.';
        }
      });
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
