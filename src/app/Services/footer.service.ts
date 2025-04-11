import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.prod';
import { catchError, map } from 'rxjs/operators';
import { UsersService } from './users.service';
import { Product, Category, ProductsResponse } from '../Models/product.model';

@Injectable({
  providedIn: 'root',
})
export class FooterService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private userService: UsersService,
    private router: Router
  ) { }



  getCategories(): Observable<Category[]> {
    // console.log("getCategories ia calling");

    return this.http.get<Category[]>(`${this.apiUrl}/category`).pipe(
      map(categories => categories.slice(0, 5)),
      catchError(this.handleError)
    );
  }

  loadTopRatedProducts(): Observable<Product[]> {
    // console.log("loadTopRatedProducts ia calling");
    const isLoggedIn = this.userService.isLoggedIn();
    if (!isLoggedIn) return of([]);

    const token = this.userService.getToken();
    const headers = token ? new HttpHeaders({ "Authorization": `Bearer ${token}` }) : {};

    return this.http.get<ProductsResponse>(`${environment.apiUrl}/product/all`, { headers }).pipe(
      map(res => res.products
        .sort((a, b) => b.rating.rate - a.rating.rate)
        .slice(0, 5)),
      catchError(this.handleError)
    );
  }

  loadTopRatedProductsPerCategory(categoryId: string): Observable<Product[]> {
    // console.log("loadTopRatedProductsPerCategory ia calling");
    const isLoggedIn = this.userService.isLoggedIn();
    if (!isLoggedIn || categoryId == "allProducts") return of([]);

    const token = this.userService.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : {};

    return this.http.get<ProductsResponse>(`${environment.apiUrl}/product/category/${categoryId}`, { headers }).pipe(
      map(res => res.products
        .sort((a, b) => b.rating.rate - a.rating.rate)
        .slice(0, 5)),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }
}
