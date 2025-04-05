import { Component } from '@angular/core';
import { CartItemComponent } from '../cart-item/cart-item.component';
import { CartService } from '../../Services/cart.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [CartItemComponent, CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  loading: boolean = true;
  TotalAmount: number = 0;
  Carts: any[] = [];
  showConfirmDialog: boolean = false;
  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.getAllProducts();
  }

  isArray(obj: any): boolean {
    return Array.isArray(obj);
  }

  getCartLength(): number {
    return Array.isArray(this.Carts) ? this.Carts.length : 0;
  }

  getAllProducts(): void {
    this.loading = true;
    this.cartService.getAllProducts().subscribe({
      next: (data: any) => {
        console.log('Raw data:', data);
        if (data === null || data === undefined) {
          this.Carts = [];
        } else if (Array.isArray(data)) {
          this.Carts = data;
        } else if (typeof data === 'object') {
          if (data.cartItems && Array.isArray(data.cartItems)) {
            this.Carts = data.cartItems;
          } else {
            const arrayProperty = Object.keys(data).find((key) =>
              Array.isArray(data[key])
            );
            if (arrayProperty) {
              this.Carts = data[arrayProperty];
            } else {
              const values = Object.values(data);
              this.Carts = values;
            }
          }
        } else {
          this.Carts = [];
        }
        console.log('Processed Carts:', this.Carts);

        // Apply saved quantities after loading carts
        this.applySavedQuantities();

        this.calculateTotal();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.log('Error fetching products:', err);
        this.Carts = [];
      },
    });
  }
  applySavedQuantities(): void {
    const storedQuantities = localStorage.getItem('cartQuantities');
    if (storedQuantities) {
      try {
        const cartQuantities: { [key: string]: number } = JSON.parse(storedQuantities);
        this.Carts.forEach(item => {
          if (cartQuantities[item.id]) {
            console.log(`Applying saved quantity for item ${item.id}: ${cartQuantities[item.id]}`);
            item.quantity = cartQuantities[item.id];
          }
        });
      } catch (e) {
        console.log('Error parsing cart quantities:', e);
      }
    }
  }

  calculateTotal(): void {
    this.TotalAmount = 0;
    if (!this.Carts || this.Carts.length === 0) return;

    console.log('Calculating total from item totals:', this.Carts);

    this.Carts.forEach((cart) => {
      const price = Number(cart.price);
      const quantity = Number(cart.quantity);

      if (!isNaN(price) && !isNaN(quantity)) {
        const itemTotal = price * quantity;
        console.log(`Item ${cart.id}: ${price} × ${quantity} = ${itemTotal}`);
        this.TotalAmount += itemTotal;
      } else {
        console.log('Invalid price or quantity:', cart);
      }
    });

    console.log('Final total:', this.TotalAmount);
  }

  handleItemRemoved(productId: string): void {
    this.Carts = this.Carts.filter((item) => item.id !== productId);
    this.calculateTotal();
  }

  updateItemQuantity(event: {id: string, quantity: number}): void {
    const index = this.Carts.findIndex(item => item.id === event.id);
    if (index !== -1) {
      this.Carts[index].quantity = event.quantity;
      console.log(`Updated quantity for item ${event.id} to ${event.quantity}`);
      this.calculateTotal();
    }
  }

  getItemTotalPrice(item: any): number {
    const price = Number(item.price);
    const quantity = Number(item.quantity);
    return !isNaN(price) && !isNaN(quantity) ? price * quantity : 0;
  }

  calculateTotalFromItems(): number {
    if (!this.Carts || this.Carts.length === 0) return 0;

    return this.Carts.reduce((total, item) => {
      return total + this.getItemTotalPrice(item);
    }, 0);
  }

  // private loadCartFromLocalStorage(): void {
  //   const storedProductsString = localStorage.getItem('productsInCart');
  //   if (storedProductsString) {
  //     try {
  //       const storedProducts = JSON.parse(storedProductsString);
  //       if (Array.isArray(storedProducts)) {
  //         this.Carts = storedProducts;
  //         this.calculateTotal();
  //         console.log('Loaded cart items from localStorage:', this.Carts);
  //       }
  //     } catch (e) {
  //       console.error('Error loading cart items from localStorage:', e);
  //     }
  //   }
  // }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: (response) => {
        console.log('Cart cleared successfully:', response.message);
        this.Carts = [];
        this.TotalAmount = 0;
        localStorage.removeItem('productsInCart');
        localStorage.removeItem('cartQuantities');
      },
      error: (err) => {
        console.error('Error clearing cart:', err);
      },
    });
  }

  openConfirmDialog(): void {
    this.showConfirmDialog = true;
  }

  closeConfirmDialog(): void {
    this.showConfirmDialog = false;
  }

  confirmClearCart(): void {
    this.clearCart();
    this.closeConfirmDialog();
  }
}
