import { UsersService } from "./users.service";
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  total: number;
}
interface CartResponse {
  cartItems: CartItem[];
}

@Injectable({
  providedIn: 'root'
})
export class CartService {


  // private readonly cart_URL = 'http://localhost:5555/cart/';
  // private readonly addToCart_URL = 'http://localhost:5555/cart/add';
  private readonly apiUrl = environment.apiUrl;
  private readonly cart_URL = `${this.apiUrl}/cart/`;
  private readonly addToCart_URL = `${this.apiUrl}/cart/add`;
  private readonly cartKey = 'productsInCart';
  
  // Create a BehaviorSubject to track cart count
  private _cartCount = new BehaviorSubject<number>(0);
  cartCount$ = this._cartCount.asObservable();

  constructor(private http: HttpClient, private userService: UsersService) {
    // Listen for login state changes
    this.userService.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.updateCartCount();
      } else {
        this._cartCount.next(0);
      }
    });
  }

  // Method to update cart count
  updateCartCount() {
    if (this.userService.isLoggedIn()) {
      this.getAllProducts().subscribe({
        next: (response: any) => {
          const count = response.cartItems 
            ? response.cartItems.length 
            : (Array.isArray(response) ? response.length : 0);
          this._cartCount.next(count);
        },
        error: () => {
          this._cartCount.next(0);
        }
      });
    }
  }

  //private readonly cart_URL = 'https://herafy-hub-api-wjex.vercel.app/cart/';
  //private readonly addToCart_URL = 'https://herafy-hub-api-wjex.vercel.app/cart/add';

  addProductToCart(newCart: any): Observable<any> {
    const token = this.userService.getToken();
    console.log("Token being sent:", token); // Debugging
    if (!token) {
      console.error("No authentication token found");
      return throwError(() => new Error("No authentication token available"));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(this.addToCart_URL, newCart, { headers }).pipe(
      tap(() => {
        // Update cart count immediately after adding product
        this.updateCartCount();
      }),
      catchError(this.handleError)
    );
  }


  getAllProducts(): Observable<CartResponse> {
    const token = this.userService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<CartResponse>(this.cart_URL, { headers });
  }

  removeFromCart(productId: string): Observable<any> {
    const token = this.userService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const removeUrl = `${this.cart_URL}remove/${productId}`;
    
    return this.http.delete(removeUrl, { headers }).pipe(
      tap(() => {
        // Update cart count immediately after removing product
        this.updateCartCount();
      }),
      catchError(this.handleError)
    );
  }
  clearCart(): Observable<any> {
    const token = this.userService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const clearUrl = `${this.cart_URL}clear`;
    
    return this.http.delete(clearUrl, { headers }).pipe(
      tap(() => {
        // Reset cart count to 0 after clearing
        this._cartCount.next(0);
      }),
      catchError(this.handleError)
    );
  }


  // local storage Handler
  // Get all cart items
  getCartItems(): any[] {
    const cartData = localStorage.getItem(this.cartKey);
    return cartData ? JSON.parse(cartData) : [];
  }

  // Add item to cart
  addToCart(itemId: string): void {
    const currentCart: string[] = this.getCartItems();

    if (!currentCart.includes(itemId)) {
      currentCart.push(itemId);
    }

    this.saveCart(currentCart);
  }

  // Remove item from cart
  removeItemsFromCart(itemId: number): void {
    const currentCart = this.getCartItems().filter(item => item.id !== itemId);
    this.saveCart(currentCart);
  }

  // Update item quantity
  updateQuantity(itemId: number, newQuantity: number): void {
    const currentCart = this.getCartItems();
    const item = currentCart.find(i => i.id === itemId);

    if (item) {
      item.quantity = newQuantity;
      this.saveCart(currentCart);
    }
  }

  // Clear the cart
  clearCartItems(): void {
    localStorage.removeItem(this.cartKey);
  }

  // Private method to save cart
  private saveCart(cartItems: any[]): void {
    localStorage.setItem(this.cartKey, JSON.stringify(cartItems));
  }
  // Calculate total price
  calculateTotal(): number {
    return this.getCartItems().reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }

}

