import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Reservation, ReservationApiService, Room } from './reservation-api.service';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly api = inject(ReservationApiService);
  private reservationLoadId = 0;

  readonly rooms = signal<Room[]>([]);
  readonly reservations = signal<Reservation[]>([]);
  readonly selectedRoomId = signal<number | null>(null);
  readonly selectedDate = signal(this.toDateInputValue(new Date()));
  readonly isDialogOpen = signal(false);
  readonly isLoadingRooms = signal(true);
  readonly isLoadingReservations = signal(false);
  readonly isSaving = signal(false);
  readonly cancellingId = signal<number | null>(null);
  readonly pageError = signal('');
  readonly formError = signal('');

  readonly reservationForm = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)]
    }),
    bookerName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)]
    }),
    startsAt: new FormControl('09:00', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    endsAt: new FormControl('10:00', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  ngOnInit(): void {
    this.loadRooms();
  }

  get selectedRoomName(): string {
    return this.rooms().find(room => room.roomId === this.selectedRoomId())?.name ?? '';
  }

  onRoomChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedRoomId.set(value ? Number(value) : null);
    this.loadReservations();
  }

  onDateChange(event: Event): void {
    this.selectedDate.set((event.target as HTMLInputElement).value);
    this.loadReservations();
  }

  shiftDate(days: number): void {
    const [year, month, day] = this.selectedDate().split('-').map(Number);
    const date = new Date(year, month - 1, day + days);
    this.selectedDate.set(this.toDateInputValue(date));
    this.loadReservations();
  }

  goToToday(): void {
    this.selectedDate.set(this.toDateInputValue(new Date()));
    this.loadReservations();
  }

  openDialog(): void {
    this.formError.set('');
    this.reservationForm.reset({
      title: '',
      bookerName: '',
      startsAt: '09:00',
      endsAt: '10:00'
    });
    this.isDialogOpen.set(true);
  }

  closeDialog(): void {
    if (!this.isSaving()) {
      this.isDialogOpen.set(false);
    }
  }

  createReservation(): void {
    this.reservationForm.markAllAsTouched();
    this.formError.set('');

    if (this.reservationForm.invalid || this.selectedRoomId() === null) {
      return;
    }

    const { title, bookerName, startsAt, endsAt } = this.reservationForm.getRawValue();
    if (endsAt <= startsAt) {
      this.formError.set('שעת הסיום חייבת להיות מאוחרת משעת ההתחלה.');
      return;
    }

    this.isSaving.set(true);
    this.api.createReservation({
      roomId: this.selectedRoomId()!,
      title: title.trim(),
      bookerName: bookerName.trim(),
      startsAt: `${this.selectedDate()}T${startsAt}:00`,
      endsAt: `${this.selectedDate()}T${endsAt}:00`
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isDialogOpen.set(false);
        this.loadReservations();
      },
      error: error => {
        this.formError.set(this.getErrorMessage(error));
        this.isSaving.set(false);
      }
    });
  }

  cancelReservation(reservation: Reservation): void {
    const confirmed = window.confirm(`לבטל את ההזמנה "${reservation.title}"?`);
    if (!confirmed) {
      return;
    }

    this.cancellingId.set(reservation.reservationId);
    this.pageError.set('');
    this.api.cancelReservation(reservation.reservationId).subscribe({
      next: () => {
        this.cancellingId.set(null);
        this.loadReservations();
      },
      error: error => {
        this.pageError.set(this.getErrorMessage(error));
        this.cancellingId.set(null);
      }
    });
  }

  formatTime(value: string): string {
    return new Intl.DateTimeFormat('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).format(new Date(value));
  }

  formatSelectedDate(): string {
    const [year, month, day] = this.selectedDate().split('-').map(Number);
    return new Intl.DateTimeFormat('he-IL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(year, month - 1, day));
  }

  private loadRooms(): void {
    this.isLoadingRooms.set(true);
    this.pageError.set('');
    this.api.getRooms().subscribe({
      next: rooms => {
        this.rooms.set(rooms);
        this.isLoadingRooms.set(false);
        if (rooms.length > 0) {
          this.selectedRoomId.set(rooms[0].roomId);
          this.loadReservations();
        }
      },
      error: error => {
        this.pageError.set(this.getErrorMessage(error));
        this.isLoadingRooms.set(false);
      }
    });
  }

  private loadReservations(): void {
    const requestId = ++this.reservationLoadId;
    const roomId = this.selectedRoomId();
    if (roomId === null || !this.selectedDate()) {
      this.reservations.set([]);
      this.isLoadingReservations.set(false);
      return;
    }

    this.isLoadingReservations.set(true);
    this.pageError.set('');
    this.api.getReservations(roomId, this.selectedDate()).subscribe({
      next: reservations => {
        if (requestId !== this.reservationLoadId) {
          return;
        }
        this.reservations.set(reservations);
        this.isLoadingReservations.set(false);
      },
      error: error => {
        if (requestId !== this.reservationLoadId) {
          return;
        }
        this.reservations.set([]);
        this.pageError.set(this.getErrorMessage(error));
        this.isLoadingReservations.set(false);
      }
    });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'לא ניתן להתחבר לשרת. ודאו שה־API פועל ונסו שוב.';
      }

      if (error.status === 409) {
        return 'החדר כבר תפוס בשעות שנבחרו. בחרו טווח זמן אחר.';
      }

      if (error.status === 404) {
        return 'החדר או ההזמנה לא נמצאו. רעננו את הנתונים ונסו שוב.';
      }

      const problem = error.error as {
        title?: string;
        detail?: string;
        errors?: Record<string, string[]>;
      } | null;
      const validationErrors = Object.values(problem?.errors ?? {}).flat();
      return validationErrors.join(' ') || problem?.detail || problem?.title ||
        `הבקשה נכשלה (שגיאה ${error.status}).`;
    }

    return 'אירעה שגיאה לא צפויה. נסו שוב.';
  }

  private toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
