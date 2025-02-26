import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly Collection_URL = 'https://fakestoreapi.com/products';
  private readonly products_URL = 'http://localhost:3000/products';
  private readonly Categories_URL = 'http://localhost:4400/categories';

  constructor(private http: HttpClient) {}

  //Handle All collection
  getAll() {
    return this.http.get(this.Collection_URL);
  }

  //Handle all Product
  getAllProducts() {
    return this.http.get(this.products_URL);
  }

  //Handle all Categories
  getAllCategories() {
    return this.http.get(this.Categories_URL);
  }


  // get product by id --> single product
  getProductById(id: number) {
    return this.http.get(`${this.products_URL}/${id}`);
  }
}
