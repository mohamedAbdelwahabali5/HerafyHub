import { Component, OnInit } from '@angular/core';
import { FavoriteService } from '../../Services/favorites.service';
import { CommonModule } from '@angular/common';
import { FavoriteItemComponent } from '../favorites-item/favorites-item.component';
import { RouterModule } from '@angular/router';



@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, FavoriteItemComponent, RouterModule],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css',
})
export class FavoriteComponent implements OnInit {
  favorites: any[] = [];
  showConfirmDialog: boolean = false;
  loading: boolean = true;
  constructor(private favoriteService: FavoriteService) {}

  ngOnInit(): void {
    this.getFavorites();
  }
// In favorites.component.ts
getFavorites(): void {
  this.loading = true;
  this.favoriteService.getAllFavorites().subscribe({
    next: (data: any) => {
      console.log('Raw data:', data);
      if (data === null || data === undefined) {
        this.favorites = [];
      } else if (Array.isArray(data)) {
        this.favorites = data;
      } else if (typeof data === 'object') {
        if (data.cartItems && Array.isArray(data.cartItems)) {
          this.favorites = data.cartItems;
        } else {
          const arrayProperty = Object.keys(data).find((key) =>
            Array.isArray(data[key])
          );
          if (arrayProperty) {
            this.favorites = data[arrayProperty];
          } else {
            const values = Object.values(data);
            this.favorites = values;
          }
        }
      } else {
        this.favorites = [];
      }
      console.log('Processed Carts:', this.favorites);
      this.loading = false;
    },
    error: (err) => {
      this.loading = false;
      console.log('Error fetching products:', err);
      this.favorites = [];
    },
  });
}
handleItemRemoved(productId: string): void {
  this.favorites = this.favorites.filter((item) => item._id !== productId);
}

  clearFavorites(): void {
    this.favoriteService.clearFavorites().subscribe(
      (response) => {
        console.log(response.message);
        this.favorites = [];
        localStorage.setItem('productsInFavorite', JSON.stringify([]));
      },
      (error) => {
        console.error('Error clearing favorites', error);
      }
    );
  }

  isArray(obj: any): boolean {
    return Array.isArray(obj);
  }
  openConfirmDialog(): void {
    this.showConfirmDialog = true;
  }

  closeConfirmDialog(): void {
    this.showConfirmDialog = false;
  }

  confirmClearFavorites(): void {
    this.clearFavorites();
    this.closeConfirmDialog();
  }
}

