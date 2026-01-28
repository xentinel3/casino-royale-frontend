import { DatePipe, DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { CoreApiService, RecommendationResponse } from '../../services/core-api.service';
import { EloRatingRecord, EloService, EloTrainResponse } from '../../services/elo.service';
import { HistoryImportResponse, HistoryRecord, HistoryService } from '../../services/history.service';
import { SeasonRecord, SeasonService } from '../../services/season.service';
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
import { EventsComponent } from '../../components/events/events.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, DatePipe, DecimalPipe, FormsModule, LucideAngularModule, EventsComponent],
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
  activeView: 'core' | 'events' | 'history' | 'elo' = 'core';
  snapshotStatus = '';
  predictionStatus = '';
  recommendationStatus = '';
  latestRecommendation: RecommendationResponse | null = null;
  historyRecords: HistoryRecord[] = [];
  historyStatus = '';
  historyUploadStatus = '';
  historyFile: File | null = null;
  isLoadingHistory = false;
  eloRatings: EloRatingRecord[] = [];
  eloStatus = '';
  eloTrainStatus = '';
  eloTrainScope: 'all_time' | 'season' = 'all_time';
  eloTrainSeasonName = '';
  eloViewScope: 'all_time' | 'season' | 'all' = 'all';
  eloViewSeasonName = '';
  isLoadingElo = false;
  seasons: SeasonRecord[] = [];
  seasonsStatus = '';

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

  private historyService = inject(HistoryService);
  private eloService = inject(EloService);
  private seasonService = inject(SeasonService);

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
    this.loadSeasons();
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

  setView(view: 'core' | 'events' | 'history' | 'elo'): void {
    this.activeView = view;
    if (view === 'history') {
      this.loadHistory();
    }
    if (view === 'elo') {
      this.loadEloRatings();
    }
    this.loadSeasons();
  }

  loadHistory(): void {
    this.historyStatus = '';
    this.isLoadingHistory = true;
    this.historyService.listHistory().subscribe({
      next: (response: HistoryRecord[]) => {
        this.historyRecords = response;
        this.isLoadingHistory = false;
      },
      error: () => {
        this.historyStatus = 'No se pudieron cargar los datos historicos.';
        this.isLoadingHistory = false;
      }
    });
  }

  handleHistoryFile(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const file = target?.files?.[0] ?? null;
    this.historyFile = file;
    this.historyUploadStatus = '';
  }

  uploadHistory(): void {
    if (!this.historyFile) {
      this.historyUploadStatus = 'Selecciona un archivo CSV.';
      return;
    }
    this.historyUploadStatus = 'Subiendo...';
    this.historyService.uploadHistory(this.historyFile).subscribe({
      next: (response: HistoryImportResponse) => {
        const msg = `Insertados ${response.inserted}, omitidos ${response.skipped}.`;
        this.historyUploadStatus = response.error_count
          ? `${msg} Errores: ${response.error_count}.`
          : msg;
        this.loadHistory();
      },
      error: (error: HttpErrorResponse) => {
        this.historyUploadStatus = error?.error?.detail || 'Error subiendo historicos.';
      }
    });
  }

  loadSeasons(): void {
    this.seasonsStatus = '';
    this.seasonService.listSeasons().subscribe({
      next: (response: SeasonRecord[]) => {
        this.seasons = response;
      },
      error: (error: HttpErrorResponse) => {
        this.seasonsStatus = error?.error?.detail || 'No se pudieron cargar las temporadas.';
      }
    });
  }

  loadEloRatings(): void {
    this.eloStatus = '';
    this.isLoadingElo = true;
    const season = this.eloViewScope === 'season' ? this.eloViewSeasonName.trim() : undefined;
    const scope = this.eloViewScope === 'all' ? undefined : this.eloViewScope;
    this.eloService.listRatings(scope, season || undefined).subscribe({
      next: (response: EloRatingRecord[]) => {
        this.eloRatings = response;
        this.isLoadingElo = false;
      },
      error: (error: HttpErrorResponse) => {
        this.eloStatus = error?.error?.detail || 'No se pudieron cargar los elos.';
        this.isLoadingElo = false;
      }
    });
  }

  trainElo(): void {
    const season = this.eloTrainScope === 'season' ? this.eloTrainSeasonName.trim() : undefined;
    if (this.eloTrainScope === 'season' && !season) {
      this.eloTrainStatus = 'Ingresa el nombre de la temporada.';
      return;
    }
    this.eloTrainStatus = 'Entrenando...';
    this.eloService.trainElo(season).subscribe({
      next: (response: EloTrainResponse) => {
        this.eloTrainStatus = `Listo. Partidos: ${response.total_matches}, equipos actualizados: ${response.updated_all_time}.`;
        this.loadEloRatings();
      },
      error: (error: HttpErrorResponse) => {
        this.eloTrainStatus = error?.error?.detail || 'Error entrenando Elo.';
      }
    });
  }

  private toIso(value: string): string {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return new Date().toISOString();
    }
    return parsed.toISOString();
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
