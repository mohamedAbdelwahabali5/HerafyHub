import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private readonly Collection_URL = 'https://fakestoreapi.com/products';
  private readonly products_URL = 'http://localhost:4000/products';
  private readonly Categories_URL = 'http://localhost:4400/categories';

  constructor(private http: HttpClient) {}

  //Handle All collection
  getAll() {
    return this.http.get(this.Collection_URL);
  }
  getAllProducts() {
    return this.http.get(this.products_URL);
  }
  getAllCategories() {
    return this.http.get(this.Categories_URL);
  }
}
