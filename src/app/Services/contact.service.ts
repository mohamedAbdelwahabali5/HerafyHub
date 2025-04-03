import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { handleError } from '../Utils/handleError';
import { catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class ContactService {
  constructor(private http: HttpClient) {}
  private readonly apiUrl = environment.apiUrl;
  private readonly apiUrlAuth = `${this.apiUrl}/auth`;
  sendContactMessage(contactData: any): Observable<any> {
    console.log('Sending to:', `${this.apiUrl}/contact`);
    return this.http.post<any>(`${this.apiUrl}/contact`, contactData).pipe(
      catchError((error) => {
        console.error('Contact error:', error);
        let errorMessage = 'Failed to send message. Please try again later.';

        if (error.status === 404) {
          errorMessage = 'Contact endpoint not found';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
