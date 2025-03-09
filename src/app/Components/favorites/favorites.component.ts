import { Component } from '@angular/core';
import { FavoritesItemComponent } from '../favorites-item/favorites-item.component';
import { CommonModule } from '@angular/common';
import { FavoritesService } from '../../Services/favorites.service';

@Component({
  selector: 'app-favorites',
  imports: [FavoritesItemComponent,CommonModule],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css',
})
export class FavoritesComponent {
  
  Favorites: any[] = [];
    
    constructor(private FavoriteService: FavoritesService) {}
  
    ngOnInit(): void {
      this.getAllProducts();
    }
  
  
    getAllProducts(): void {
      this.FavoriteService.getAllProducts().subscribe({
        next: (data) => {
          this.Favorites=<any>data;
          console.log('Products fetched:', this.Favorites);
        },
        error: (err) => {
          console.error('Error fetching products:', err);
        }
      });
    }

  
}
