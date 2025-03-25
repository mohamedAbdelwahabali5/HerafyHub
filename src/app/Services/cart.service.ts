import { UsersService } from "./users.service";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
 
@Injectable({
  providedIn: 'root'
})
export class CartService {
 
  private readonly cart_URL = 'http://localhost:5555/cart/';
  private readonly addToCart_URL = 'http://localhost:5555/cart/add';
  constructor(private http:HttpClient,private userService: UsersService) {}
 
 
  addProductToCart(newCart: any): Observable<any> {
    const token = this.userService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(this.addToCart_URL, newCart, { headers });
  }
 
  getAllProducts() {
    const token = this.userService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(this.cart_URL, { headers });
  }
 
  removeFromCart(productId: string): Observable<any> {
  const token = this.userService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  const removeUrl = `${this.cart_URL}remove/${productId}`;
  return this.http.delete(removeUrl, { headers });
}
clearCart(): Observable<any> {
  const token = this.userService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  const clearUrl =`${this.cart_URL}clear`;
  return this.http.delete(clearUrl, { headers });
}
 
 
}
 
 