// src/app/services/order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../Models/order.model';
import { UsersService } from '../Services/users.service';


@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:3000/orders';

  constructor(
    private http: HttpClient,
    private usersService: UsersService
  ) {}

  // Get all orders for the current user
  getUserOrders(): Observable<Order[]> {
    const token = this.usersService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Order[]>(`${this.apiUrl}`, { headers });
  }
  // Cancel an order
  cancelOrder(orderId: string): Observable<Order> {
    const token = this.usersService.getToken();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.patch<Order>(`${this.apiUrl}/${orderId}/cancel`, {}, { headers });
  }
}
