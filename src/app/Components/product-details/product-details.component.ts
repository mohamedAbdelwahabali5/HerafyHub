import { CartService } from './../../Services/cart.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../Services/collection.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { UsersService } from '../../Services/users.service'
import { FavoriteService } from '../../Services/favorites.service'

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, RouterModule],
  providers: [ProductService],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit {
  product: any;
  stars: number[] = [1, 2, 3, 4, 5]; // Array to iterate over stars
  productsInCart: Set<string> = new Set();
  productsInFavorite: Set<string> = new Set(); // Added for favorites
  quantity: number = 1;
  isLoading: boolean = false;
  
  constructor(
    private route: ActivatedRoute,
    private CartService: CartService,
    private productService: ProductService,
    public userServ: UsersService, // Added UserService
    private favoriteService: FavoriteService // Added FavoriteService
  ) {}

  ngOnInit() {
    this.loadCartStateFromStorage();
    this.loadFavoriteStateFromStorage(); // Added favorite loading
    this.route.params.subscribe(params => {
      const id = params['id']; // Convert string to number using +
      this.productService.getProductById(id).subscribe({
        next: (data: any) => {
          this.product = data;
        },
        error: (error) => {
          console.error('Error fetching product:', error);
        }
      });
    });
  }

  // Method to generate star array based on rating
  getRating(): number {
    return this.product?.rating?.rate || 0; // Access the correct rating property and provide a fallback
  }

  getStarType(index: number): string {
    const rating = this.getRating();
    if (index + 1 <= rating) {
      return 'bi-star-fill';
    } else if (index + 0.5 <= rating) {
      return 'bi-star-half';
    } else {
      return 'bi-star';
    }
  }
  
  isProductInCart(productId: string): boolean {
    return this.productsInCart.has(productId);
  }

  // Favorite functionality
  isProductInFavorites(): boolean {
    if (!this.userServ.isLoggedIn()) {
      return false;
    }
    return this.productsInFavorite.has(this.product._id);
  }

  toggleHeart(event: Event): void {
    event.stopPropagation();
    
    if (this.isProductInFavorites()) {
      // Remove from favorites if already in favorites
      this.favoriteService.removeFromFavorite(this.product._id).subscribe({
        next: () => {
          // Remove from Set
          this.productsInFavorite.delete(this.product._id);
          this.updateFavoritesInStorage(this.product._id, false);
          
          // console.log('Product removed from favorites:', this.product._id);
        },
        error: (error) => {
          console.log('Error removing from favorites:', error);
        },
      });
    } else {
      this.favoriteService.addProductToFavorite(this.product._id).subscribe({
        next: () => {
          this.productsInFavorite.add(this.product._id);
          this.updateFavoritesInStorage(this.product._id, true);
          
          // console.log('Product added to favorites:', this.product._id);
        },
        error: (error) => {
          console.log('Error adding to favorites:', error);
        },
      });
    }
  }

  addToCart(quantity: number = 1) {
    this.isLoading = true;
    const productData = {
      productId: this.product._id,
      quantity: quantity,
    };

    this.CartService.addProductToCart(productData).subscribe({
      next: (response) => {
        this.productsInCart.add(this.product._id);
        this.updateCartInStorage(this.product._id, true);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Product added to cart',
          timer: 1500,
          showConfirmButton: false,
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Detailed Error:', err);
        Swal.fire({
          icon: 'error',
          title: 'Connection Error',
          text: 'Unable to connect to the server. Please check your connection or try again later.',
        });
        this.isLoading = false;
      }
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

  // Added method to load favorites from localStorage
  private loadFavoriteStateFromStorage(): void {
    const savedState = localStorage.getItem('productsInFavorite');
    if (savedState) {
      try {
        const productIds = JSON.parse(savedState);
        this.productsInFavorite = new Set(productIds);
      } catch (e) {
        console.error('Error loading favorites state:', e);
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

  // Added method to update favorites in localStorage
  private updateFavoritesInStorage(productId: string, isAdding: boolean): void {
    let products: string[] = [];
    const savedState = localStorage.getItem('productsInFavorite');

    if (savedState) {
      try {
        products = JSON.parse(savedState);
      } catch (e) {
        console.error('Error parsing favorites state:', e);
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
    localStorage.setItem('productsInFavorite', JSON.stringify(products));
  }
}