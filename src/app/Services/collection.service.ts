import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

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
  getAllProducts() {
    return this.http.get(this.products_URL);
  }

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
