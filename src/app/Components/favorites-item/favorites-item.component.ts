import { FavoriteService } from './../../Services/favorites.service';
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
  @Output() itemRemoved = new EventEmitter<string>();
  category: any;
  productsInCart: Set<string> = new Set();
  quantity: number = 1;
  isLoading: boolean = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private FavoriteService: FavoriteService
  ) { }

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
        // console.log('Category data:', this.category);
      },
      error: (error) => {
        console.error('Error fetching category:', error);
      },
    });
  }
  removeProductFromLocalStorage(productId: string): void {
    const storedProductsString = localStorage.getItem('productsInFavorite');
    if (storedProductsString) {
      try {
        const storedProducts = JSON.parse(storedProductsString);
        const updatedProducts = storedProducts.filter(
          (id: string) => id !== productId
        );
        localStorage.setItem(
          'productsInFavorite',
          JSON.stringify(updatedProducts)
        );
        // console.log('Product removed from localStorage:', productId);
      } catch (e) {
        console.log('Error parsing localStorage data:', e);
      }
    }
  }
  removeItem() {
    // console.log(this.product._id);
    if (this.product && this.product._id) {
      this.FavoriteService.removeFromFavorite(this.product._id).subscribe({
        next: (response) => {
          // console.log('Item removed successfully', response);
          this.removeProductFromLocalStorage(this.product._id);
          this.itemRemoved.emit(this.product._id);
        },
        error: (error) => {
          console.log('Error removing item from cart', error);
          this.itemRemoved.emit(this.product._id);
        },
      });
    } else {
      this.itemRemoved.emit(this.product._id);
    }
  }

  isProductInCart(productId: string): boolean {
    return this.productsInCart.has(productId);
  }
  addToCart(): void {
    if (this.isLoading || this.isProductInCart(this.product._id)) {
      return;
    }
    this.isLoading = true;
    const productData = {
      productId: this.product._id,
      quantity: 1, // Using 1 as default quantity
    };

    this.cartService.addProductToCart(productData).subscribe({
      next: (response) => {
        this.productsInCart.add(this.product._id); // Add to Set
        this.updateCartInStorage(this.product._id, true); // Update localStorage
        // console.log('Product added to cart successfully:', response);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Product added to cart',
          timer: 1500,
          showConfirmButton: false,
        });
        this.isLoading = false;
        this.removeItem();
      },
      error: (err) => {
        console.error('Error adding product to cart:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'Failed to add product to cart',
        });
        this.isLoading = false;
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
