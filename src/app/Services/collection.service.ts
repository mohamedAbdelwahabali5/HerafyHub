import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private readonly Collection_URL = 'https://fakestoreapi.com/products';

  constructor(private http: HttpClient) {}

  //Handle All collection
  getAll() {
    return this.http.get(this.Collection_URL);
  }
}
