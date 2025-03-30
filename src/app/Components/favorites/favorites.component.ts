import { Component, OnInit } from '@angular/core';
import { FavoriteService } from '../../Services/favorites.service';
import { CommonModule } from '@angular/common';
import { FavoriteItemComponent } from '../favorites-item/favorites-item.component';


 
@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, FavoriteItemComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css',
})
export class FavoriteComponent implements OnInit {
  favorites: any[] = [];
 
  constructor(private favoriteService: FavoriteService) {}
 
  ngOnInit(): void {
    this.getFavorites();
  }
// In favorites.component.ts
getFavorites(): void {
  // Check localStorage first
  const savedFavorites = localStorage.getItem('productsInFavorite');
  if (savedFavorites && JSON.parse(savedFavorites).length === 0) {
    // If localStorage shows no favorites, skip the API call
    this.favorites = [];
    return;
  }
 
  // Otherwise, proceed with the API call
  this.favoriteService.getAllFavorites().subscribe({
    next: (response) => {
      console.log('API Response:', response);
      this.favorites = response.favoriteProducts;
    },
    error: (error) => {
      console.error('Error fetching favorites', error);
      // Fallback to empty array on error
      this.favorites = [];
    },
    complete: () => {
      console.log('Favorites fetched successfully');
    },
  });
}
  removeFromFavorite(productId: string): void {
    console.log('Parent: About to remove product with ID:', productId);
    this.favoriteService.removeFromFavorite(productId).subscribe({
      next: (response) => {
        console.log('Removal response:', response);
        this.updateFavoritesInStorage(productId, false);
        setTimeout(() => {
          this.getFavorites();
        }, 300);
      },
      error: (error) => {
        console.error('Error removing from favorites', error);
      }
    });
  }
  private updateFavoritesInStorage(productId: string, isAdding: boolean): void {
    let favorites: string[] = [];
    const savedState = localStorage.getItem('productsInFavorite');
 
    if (savedState) {
      try {
        favorites = JSON.parse(savedState);
      } catch (e) {
        console.error('Error parsing favorites state:', e);
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
  clearFavorites(): void {
    const confirmClear = window.confirm('Are you sure you want to clear the favorites?');
    if (!confirmClear) return;
    this.favoriteService.clearFavorites().subscribe(
      (response) => {
        console.log(response.message);
        this.favorites = [];
 
        // Clear localStorage favorites - ADD THIS CODE
        localStorage.setItem('productsInFavorite', JSON.stringify([]));
      },
      (error) => {
        console.error('Error clearing favorites', error);
      }
    );
  }
}
 
 