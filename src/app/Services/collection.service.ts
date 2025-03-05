import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly Collection_URL = 'https://fakestoreapi.com/products';
  private readonly products_URL = 'http://localhost:5555/product';
  private readonly searchProduct_URL = 'http://localhost:5555/product/search';
  private readonly Categories_URL = 'http://localhost:5555/category';


  constructor(private http: HttpClient) {}

  //Handle All collection
  getAll() {
    return this.http.get(this.Collection_URL);
  }

  //Handle Products
  // getAllProducts(page: number, limit: number): Observable<any> {
  //   return this.http.get<any>(`${this.products_URL}?page=${page}&limit=${limit}`);
  // }
  getAllProducts(page: number, limit: number, categoryId?: string): Observable<any> {
    const url = categoryId
      ? `${this.products_URL}?page=${page}&limit=${limit}&categoryId=${categoryId}`
      : `${this.products_URL}?page=${page}&limit=${limit}`;
    return this.http.get<any>(url);
  }
  // getAllProducts(page: number, limit: number, categoryId?: string): Observable<{
  //   products: any[],
  //   totalProducts: number,
  //   totalPages: number,
  //   currentPage: number
  // }> {
  //   let params = new HttpParams()
  //     .set('page', page.toString())
  //     .set('limit', limit.toString());

  //   if (categoryId) {
  //     params = params.set('categoryId', categoryId);
  //   }

  //   return this.http.get<{
  //     products: any[],
  //     totalProducts: number,
  //     totalPages: number,
  //     currentPage: number
  //   }>(`${this.products_URL}/products`, { params });
  // }
  SearchByTitle(title: string) {
    console.log('Searching for:', title);
    console.log('Search URL:', `${this.searchProduct_URL}?title=${title}`);
    return this.http.get(`${this.searchProduct_URL}?title=${title}`).pipe(
      tap(response => console.log('Search response:', response)),
      catchError(error => {
        console.error('Search API error:', error);
        throw error;
      })
    );
  }

  //Handle all Categories
  getAllCategories() {
    return this.http.get(this.Categories_URL);
  }


  // get product by id --> single product
  getProductById(id: string) {
    return this.http.get(`${this.products_URL}/${id}`);
  }
}
