// src/app/services/order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../Models/order.model';
import { UsersService } from '../Services/users.service';
import { environment } from '../../environments/environment.prod';


// export interface Order {
//   id?: string;
//   userId: string;
//   items: OrderItem[];
//   shippingInfo: ShippingInfo;
//   paymentMethod: string;
//   totalAmount: number;
//   status: 'pending' | 'processing' | 'cancelled';
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// export interface OrderItem {
//   productId: string;
//   name: string;
//   quantity: number;
//   price: number;
//   image?: string;
// }

// export interface ShippingInfo {
//   name: string;
//   address: string;
//   phone: string;
// }


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
  getUserOrders(): Observable<Order[]> {
    const token = this.usersService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Order[]>(`${this.apiUrlOrder}`, { headers });
  }
  // Cancel an order
  cancelOrder(orderId: string): Observable<Order> {
    const token = this.usersService.getToken();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.patch<Order>(`${this.apiUrlOrder}/${orderId}/cancel`, {}, { headers });
  }
  createOrder(orderData: Order): Observable<any> {
    const token = this.usersService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(this.apiUrl, orderData, { headers });
  }


}
