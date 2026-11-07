import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Room {
  roomId: number;
  name: string;
}

export interface Reservation {
  reservationId: number;
  roomId: number;
  title: string;
  startsAt: string;
  endsAt: string;
  bookerName: string;
}

export interface CreateReservation {
  roomId: number;
  title: string;
  startsAt: string;
  endsAt: string;
  bookerName: string;
}

@Injectable({ providedIn: 'root' })
export class ReservationApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5128/api';

  getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/rooms`);
  }

  getReservations(roomId: number, date: string): Observable<Reservation[]> {
    const params = new HttpParams()
      .set('roomId', roomId)
      .set('date', date);

    return this.http.get<Reservation[]>(`${this.apiUrl}/reservations`, { params });
  }

  createReservation(request: CreateReservation): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.apiUrl}/reservations`, request);
  }

  cancelReservation(reservationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reservations/${reservationId}`);
  }
}
