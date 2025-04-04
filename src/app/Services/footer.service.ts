// footer.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { catchError } from 'rxjs/operators';
import { handleError } from '../Utils/handleError';

@Injectable({
  providedIn: 'root',
})
export class FooterService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/category`)
      .pipe(catchError(handleError));
  }

  getProducts(): Observable<any> {
    const params = new HttpParams().set('page', '1').set('limit', '5');
    return this.http
      .get(`${this.apiUrl}/product`, { params })
      .pipe(catchError(handleError));
  }

  getProductsByCategory(categoryId: string): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/product/category/${categoryId}`) // Use path parameter
      .pipe(catchError(handleError));
  }
}
