import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { LucideAngularModule, Plus, RefreshCw } from 'lucide-angular';
import { CompetitorRecord, CompetitorService } from '../../services/competitor.service';
import { EventResponse, EventService } from '../../services/event.service';
import { SeasonRecord, SeasonService } from '../../services/season.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, DatePipe, FormsModule, LucideAngularModule],
  templateUrl: './events.component.html'
})
export class EventsComponent implements OnInit {
  plusIcon = Plus;
  refreshIcon = RefreshCw;

  events: EventResponse[] = [];
  eventsStatus = '';
  isLoadingEvents = false;

  editingEventId: string | null = null;
  editEventStatus = '';
  editEventForm = {
    id: '',
    startTime: '',
    homeId: '',
    awayId: '',
    seasonId: '',
    round: ''
  };

  competitors: CompetitorRecord[] = [];
  competitorsStatus = '';

  seasons: SeasonRecord[] = [];
  seasonsStatus = '';

  isCreateEventOpen = false;
  eventStatus = '';
  eventForm = {
    id: '',
    startTime: '',
    homeId: '',
    awayId: '',
    seasonId: '',
    round: ''
  };

  private eventService = inject(EventService);
  private seasonService = inject(SeasonService);
  private competitorService = inject(CompetitorService);

  ngOnInit(): void {
    this.loadSeasons();
    this.loadCompetitors();
    this.loadEvents();
  }

  loadEvents(): void {
    this.eventsStatus = '';
    this.isLoadingEvents = true;
    this.eventService.listEvents().subscribe({
      next: (response) => {
        this.events = response;
        this.isLoadingEvents = false;
      },
      error: () => {
        this.eventsStatus = 'No se pudieron cargar los eventos.';
        this.isLoadingEvents = false;
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

  loadCompetitors(): void {
    this.competitorsStatus = '';
    this.competitorService.listCompetitors().subscribe({
      next: (response: CompetitorRecord[]) => {
        this.competitors = response;
      },
      error: (error: HttpErrorResponse) => {
        this.competitorsStatus = error?.error?.detail || 'No se pudieron cargar los competidores.';
      }
    });
  }

  openCreateEvent(): void {
    this.isCreateEventOpen = true;
    this.eventStatus = '';
  }

  closeCreateEvent(): void {
    this.isCreateEventOpen = false;
  }

  private toIso(value: string): string {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return new Date().toISOString();
    }
    return parsed.toISOString();
  }

  private toLocalInput(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}`;
  }

  private getCompetitorNameById(competitorId: string): string | null {
    const competitor = this.competitors.find((item) => item.id === competitorId);
    return competitor ? competitor.name : null;
  }

  submitEvent(): void {
    this.eventStatus = '';
    const homeName = this.getCompetitorNameById(this.eventForm.homeId);
    const awayName = this.getCompetitorNameById(this.eventForm.awayId);
    if (!homeName || !awayName) {
      this.eventStatus = 'Selecciona HOME y AWAY.';
      return;
    }
    this.eventService
      .createEvent({
        start_time: this.toIso(this.eventForm.startTime),
        competitors: [
          { id: this.eventForm.homeId, name: homeName, role: 'HOME' },
          { id: this.eventForm.awayId, name: awayName, role: 'AWAY' }
        ],
        season_id: this.eventForm.seasonId || undefined,
        round: this.eventForm.round.trim() || undefined
      })
      .subscribe({
        next: (response) => {
          this.eventStatus = `Evento creado: ${response.id}`;
          this.isCreateEventOpen = false;
          this.loadEvents();
        },
        error: (error) => {
          this.eventStatus = error?.error?.detail || 'Error creando evento.';
        }
      });
  }

  startEditEvent(event: EventResponse): void {
    this.editEventStatus = '';
    this.editingEventId = event.id;
    const home = event.competitors.find((item) => item.role === 'HOME') ?? event.competitors[0];
    const away = event.competitors.find((item) => item.role === 'AWAY') ?? event.competitors[1];
    this.editEventForm = {
      id: event.id,
      startTime: this.toLocalInput(event.start_time),
      homeId: home?.id || '',
      awayId: away?.id || '',
      seasonId: event.season_id || '',
      round: event.round || ''
    };
  }

  cancelEditEvent(): void {
    this.editingEventId = null;
    this.editEventStatus = '';
  }

  submitEditEvent(): void {
    if (!this.editingEventId) {
      return;
    }
    const homeName = this.getCompetitorNameById(this.editEventForm.homeId);
    const awayName = this.getCompetitorNameById(this.editEventForm.awayId);
    if (!homeName || !awayName) {
      this.editEventStatus = 'Selecciona HOME y AWAY.';
      return;
    }
    this.eventService
      .updateEvent(this.editingEventId, {
        start_time: this.toIso(this.editEventForm.startTime),
        competitors: [
          { id: this.editEventForm.homeId, name: homeName, role: 'HOME' },
          { id: this.editEventForm.awayId, name: awayName, role: 'AWAY' }
        ],
        season_id: this.editEventForm.seasonId || undefined,
        round: this.editEventForm.round.trim() || undefined
      })
      .subscribe({
        next: () => {
          this.editEventStatus = 'Evento actualizado.';
          this.loadEvents();
          this.editingEventId = null;
        },
        error: (error: HttpErrorResponse) => {
          this.editEventStatus = error?.error?.detail || 'Error actualizando evento.';
        }
      });
  }

  deleteEvent(event: EventResponse): void {
    if (!confirm(`Eliminar evento ${event.id}?`)) {
      return;
    }
    this.eventService.deleteEvent(event.id).subscribe({
      next: () => {
        this.eventsStatus = 'Evento eliminado.';
        if (this.editingEventId === event.id) {
          this.editingEventId = null;
        }
        this.loadEvents();
      },
      error: (error: HttpErrorResponse) => {
        this.eventsStatus = error?.error?.detail || 'Error eliminando evento.';
      }
    });
  }
}
