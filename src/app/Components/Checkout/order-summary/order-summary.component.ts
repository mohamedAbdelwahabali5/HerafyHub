import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../Services/cart.service';

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

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.css']
})
export class OrderSummaryComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalPrice: number = 0;
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.cartService.getAllProducts().subscribe({
      next: (response: CartResponse) => {
        if (response?.cartItems && Array.isArray(response.cartItems)) {
          this.cartItems = response.cartItems;
          // console.log(this.cartItems);
          this.applySavedQuantities();
          this.calculateTotalPrice();
        } else {
          throw new Error('Invalid cart items format');
        }
      },
      error: (err) => {
        console.error("Error loading cart:", err);
        this.errorMessage = err.error?.message || 'Failed to load cart. Please try again.';
        this.cartItems = [];
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  calculateTotalPrice(): void {
    this.totalPrice = this.cartItems.reduce(
      (sum, item) => sum + item.total,
      -4
    );
  }
  applySavedQuantities(): void {
    const storedQuantities = localStorage.getItem('cartQuantities');
    if (storedQuantities) {
      try {
        const cartQuantities: { [key: string]: number } = JSON.parse(storedQuantities);
        this.cartItems.forEach(item => {
          if (cartQuantities[item.id]) {
            // console.log(`Applying saved quantity for item ${item.id}: ${cartQuantities[item.id]}`);
            item.quantity = cartQuantities[item.id];
            item.total = item.price * item.quantity;
          }
        });
      } catch (e) {
        console.log('Error parsing cart quantities:', e);
      }
    }
  }
}
