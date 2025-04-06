// src/app/services/order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsersService } from './users.service';
import { environment } from '../../environments/environment.prod';
import { Order, ShippingAddress, OrderResponse } from '../Models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = environment.apiUrl;
  private readonly apiUrlOrder = `${this.apiUrl}/order`;

  constructor(
    private http: HttpClient,
    private usersService: UsersService
  ) { }

  // Get all orders for the current user
  getUserOrders(): Observable<OrderResponse> {
    const token = this.usersService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<OrderResponse>(`${this.apiUrlOrder}/user`, { headers });
  }

  // Create a new order
  createOrder(orderData: {
    shippingAddress: ShippingAddress;
    paymentMethod: 'Credit Card' | 'Cash on Delivery';
    products: { productId: string; quantity: number }[];
  }): Observable<Order> {
    const token = this.usersService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<Order>(`${this.apiUrlOrder}`, orderData, { headers });
  }

  // Cancel an existing order
  cancelOrder(orderId: string): Observable<Order> {
    const token = this.usersService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<Order>(`${this.apiUrlOrder}/${orderId}`, { headers });
  }

  // Get all orders (admin functionality)
  getAllOrders(): Observable<Order[]> {
    const token = this.usersService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Order[]>(`${this.apiUrlOrder}`, { headers });
  }
}
