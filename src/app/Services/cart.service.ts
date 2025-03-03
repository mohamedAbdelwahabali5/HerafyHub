import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private readonly cart_URL = 'http://localhost:3000/cartProducts';
  constructor(private http:HttpClient) {}

    addProductToCart(newCart: any): Observable<any> {
      return this.http.post<any>(this.cart_URL, newCart);
    }

    getAllProducts() {
      return this.http.get(this.cart_URL);
    }
    
   
}
