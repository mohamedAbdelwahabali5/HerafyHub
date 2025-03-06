import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import {Product,ProductApiResponse} from '../Utils/interface'

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // private readonly Collection_URL = 'https://fakestoreapi.com/products';
  private readonly products_URL = 'http://localhost:5555/product';
  private readonly all_Products_URL = 'http://localhost:5555/product/all';
  private readonly searchProduct_URL = 'http://localhost:5555/product/search';
  private readonly Categories_URL = 'http://localhost:5555/category';


  constructor(private http: HttpClient) {}

  //Handle All collection
  getAllProducts() {
    return this.http.get(this.all_Products_URL);
  }
  getProductsCategory(page: number, pageSize: number, categoryId: string = '') {
    let url = `${this.products_URL}/?page=${page}&limit=${pageSize}`;
    if (categoryId) {
      url += `&categoryId=${categoryId}`;
    }
    return this.http.get(url);
  }

  //Handle search
  searchByTitleInCategory(title: string, categoryId: string) {
    console.log('Searching for:', title, 'in category:', categoryId);
    if (categoryId == 'allProducts') {
      return this.http.get(`${this.all_Products_URL}`);
    }else {
      return this.http.get(`${this.searchProduct_URL}?title=${title}&categoryId=${categoryId}`);
    }

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
