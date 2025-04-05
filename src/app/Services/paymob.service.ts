import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PaymobService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Get Auth Token
  getAuthToken(): Observable<any> {
    return this.http.post(`${this.apiUrl}/paymob/get-token`, {});
  }

  // Create a new Order
  createOrder(authToken: string, amountCents: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/paymob/create-order`, {
      auth_token: authToken,
      amount_cents: amountCents,
    });
  }

  // Get Payment Key
  getPaymentKey(authToken: string, orderId: number, amountCents: number, billingData: any): Observable<any> {
    const payload = { authToken, orderId, amountCents, billingData };

    console.log("Sending request to backend (Payment Key):", JSON.stringify(payload, null, 2));

    return this.http.post(`${this.apiUrl}/paymob/get-payment-key`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  checkPaymentStatus(orderId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/paymob/check-status/${orderId}`);
  }
}
