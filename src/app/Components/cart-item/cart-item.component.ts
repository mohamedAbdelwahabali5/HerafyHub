import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CartService } from '../../Services/cart.service';
@Component({
  selector: 'app-cart-item',
  imports: [CommonModule],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.css',
  standalone: true
})
export class CartItemComponent{
  @Input() cart: any;
  @Output() itemRemoved = new EventEmitter<string>();
  @Output() quantityChanged = new EventEmitter<{id: string, quantity: number}>();
  constructor(private cartService: CartService) {}
  get totalPrice(): number {
    return this.cart.price * this.cart.quantity;
  }
  decrease(): void {
    if (this.cart.quantity > 1) {
      this.cart.quantity--;
    }
  }
  increase(): void {
    this.cart.quantity++;
  }
 
  removeItem() {
    console.log(this.cart);
    if (this.cart && this.cart.id) {
      this.cartService.removeFromCart(this.cart.id).subscribe({
        next: (response) => {
          console.log('Item removed successfully', response);
          this.removeProductFromLocalStorage(this.cart.id);
          this.itemRemoved.emit(this.cart.id);
        },
        error: (error) => {
          console.error('Error removing item from cart', error);
        }
      });
    }
    this.itemRemoved.emit(this.cart.id);
  }
  removeProductFromLocalStorage(productId: string): void {
    const storedProductsString = localStorage.getItem('productsInCart');
    if (storedProductsString) {
      try {
        const storedProducts = JSON.parse(storedProductsString);
        const updatedProducts = storedProducts.filter((id: string) => id !== productId);
        localStorage.setItem('productsInCart', JSON.stringify(updatedProducts));
        console.log('Product removed from localStorage:', productId);
      } catch (e) {
        console.error('Error parsing localStorage data:', e);
      }
    }
  }



}


