import { Component, Input } from '@angular/core';
import { UsersService } from '../../../Services/users.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from './../../../Services/cart.service';
import { ProductService } from '../../../Services/collection.service';
import { FavoriteService } from '../../../Services/favorites.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-collection-card',
  imports: [RouterModule, CommonModule],
  templateUrl: './collection-card.component.html',
  styleUrl: './collection-card.component.css'
})
export class CollectionCardComponent {
  @Input() product: any;
  productsInCart: Set<string> = new Set();
  productsInFavorite: Set<string> = new Set();
  quantity: number = 1;
  toggle: boolean = true;
  isLoading: boolean = false;

  constructor(
    private CartService: CartService,
    private favoriteService: FavoriteService,
    public userServ: UsersService
  ) {}
    isProductInFavorites(): boolean {
      if (!this.userServ.isLoggedIn()) {
        return false;
      }
      return this.productsInFavorite.has(this.product._id);
    }
    ngOnInit() {
      this.loadCartStateFromStorage();
      this.loadFavoriteStateFromStorage();
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

            console.log('Product removed from favorites:', this.product._id);
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

            console.log('Product added to favorites:', this.product._id);
          },
          error: (error) => {
            console.log('Error adding to favorites:', error);
          },
        });
      }
    }

    isProductInCart(productId: string): boolean {
      if (!this.userServ.isLoggedIn()) {
        return false;
      }
      return this.productsInCart.has(productId);
    }

    addToCart(quantity: number = 1) {
       if (this.isLoading || this.isProductInCart(this.product._id) || !this.userServ.isLoggedIn()) {
        return;
      }

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
          console.log('Detailed Error:', err);
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
          console.log('Error loading cart state:', e);
        }
      }
    }

    private loadFavoriteStateFromStorage(): void {
      const savedState = localStorage.getItem('productsInFavorite');
      if (savedState) {
        try {
          const productIds = JSON.parse(savedState);
          this.productsInFavorite = new Set(productIds);
        } catch (e) {
          console.log('Error loading favorite state:', e);
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
          console.log('Error parsing cart state:', e);
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

    private updateFavoritesInStorage(productId: string, isAdding: boolean): void {
      let favorites: string[] = [];
      const savedState = localStorage.getItem('productsInFavorite');

      if (savedState) {
        try {
          favorites = JSON.parse(savedState);
        } catch (e) {
          console.log('Error parsing favorites state:', e);
        }
      }
      if (isAdding) {
        if (!favorites.includes(productId)) {
          favorites.push(productId);
        }
      } else {
        const index = favorites.indexOf(productId);
        if (index > -1) {
          favorites.splice(index, 1);
        }
      }
      localStorage.setItem('productsInFavorite', JSON.stringify(favorites));
      console.log('Current favorites in localStorage:', favorites);
    }

}
