import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-favorites-item',
  imports: [CommonModule],
  templateUrl: './favorites-item.component.html',
  styleUrl: './favorites-item.component.css',
})
export class FavoritesItemComponent {
  @Input() Favorite: any;
}
