import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../Services/collection.service';
import { CartService } from '../../Services/cart.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
 
@Component({
  selector: 'app-favorite-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './favorites-item.component.html',
  styleUrl: './favorites-item.component.css',
})
export class FavoriteItemComponent implements OnInit {
  @Input() product: any;
  @Output() remove = new EventEmitter<string>();
  category: any;
  productsInCart: Set<string> = new Set();
  quantity: number = 1;
 
  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}
 
  ngOnInit(): void {
    if (this.product && this.product.categoryId) {
      this.getProductCategory();
    }
    this.loadCartStateFromStorage();
  }
 
  getProductCategory(): void {
    this.productService.getCategoryById(this.product.categoryId).subscribe({
      next: (categoryData) => {
        this.category = categoryData;
        console.log('Category data:', this.category);
      },
      error: (error) => {
        console.error('Error fetching category:', error);
      },
    });
  }
 
  removeFromFavorite(): void {
    console.log('Child: Removing product with ID:', this.product._id);
    this.remove.emit(this.product._id);
    console.log('Child: Event emitted');
  }
 
  isProductInCart(): boolean {
    return this.productsInCart.has(this.product._id);
  }
 
  addToCart(): void {
    console.log('Product object:', this.product);
    console.log('Product ID being sent:', this.product._id);
    console.log('Quantity being sent:', this.quantity);
 
    const productData = {
      productId: this.product._id,
      quantity: 1, // Using 1 as default quantity
    };
 
    this.cartService.addProductToCart(productData).subscribe({
      next: (response) => {
        this.productsInCart.add(this.product._id); // Add to Set
        this.updateCartInStorage(this.product._id, true); // Update localStorage
        console.log('Product added to cart successfully:', response);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Product added to cart',
          timer: 1500,
          showConfirmButton: false,
        });
      },
      error: (err) => {
        console.error('Error adding product to cart:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'Failed to add product to cart',
        });
      },
    });
  }
 
  private loadCartStateFromStorage(): void {
    const savedState = localStorage.getItem('productsInCart');
    if (savedState) {
      try {
        const productIds = JSON.parse(savedState);
        this.productsInCart = new Set(productIds);
      } catch (e) {
        console.error('Error loading cart state:', e);
      }
    }
  }
 
  private updateCartInStorage(productId: string, isAdding: boolean): void {
    let products: string[] = [];
    const savedState = localStorage.getItem('productsInCart');
 
    if (savedState) {
      try {
        products = JSON.parse(savedState);
      } catch (e) {
        console.error('Error parsing cart state:', e);
      }
    }
 
    if (isAdding) {
      if (!products.includes(productId)) {
        products.push(productId);
      }
    } else {
      const index = products.indexOf(productId);
      if (index > -1) {
        products.splice(index, 1);
      }
    }
    localStorage.setItem('productsInCart', JSON.stringify(products));
  }
}
 
 