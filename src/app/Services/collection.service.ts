import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Product, ProductApiResponse } from '../Utils/interface';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class ProductService {

  private readonly apiUrl = environment.apiUrl;
  private readonly product_URL = `${this.apiUrl}/product`;
  private readonly all_Products_URL = `${this.apiUrl}/product/all`;
  private readonly searchProduct_URL = `${this.apiUrl}/search`;
  private readonly Categories_URL = `${this.apiUrl}/category`;

  constructor(private http: HttpClient) {}

  //Handle All collection
  getAllProducts() {
    return this.http.get(this.all_Products_URL);
  }

  getProductsCategory(page: number, pageSize: number, categoryId: string = '') {
    let url = `${this.product_URL}/?page=${page}&limit=${pageSize}`;
    if (categoryId) {
      url += `&categoryId=${categoryId}`;
    }
    return this.http.get(url);
  }

  //Handle search
  searchByTitleInCategory(title: string, categoryId: string) {
    console.log('Searching for:', title, 'in category:', categoryId);
    if (categoryId == 'allProducts') {
      return this.http.get(this.all_Products_URL);
    } else {
      return this.http.get(
        `${this.searchProduct_URL}?title=${title}&categoryId=${categoryId}`
      );
    }
  }

  //Handle all Categories
  getAllCategories() {
    return this.http.get(this.Categories_URL);
  }

  // Get category by ID
  getCategoryById(categoryId: string) {
    return this.http.get(`${this.Categories_URL}/${categoryId}`);
  }

  // get product by id --> single product
  getProductById(id: string) {
    return this.http.get(`${this.product_URL}/${id}`);
  }

  // product.service.ts
  getProductsByCategory(categoryId: string) {
    return this.http.get(`${this.apiUrl}/products?category=${categoryId}`);
  }
}
