import { Component } from '@angular/core';
import { CategoryInfoComponent } from "../category-info/category-info.component";
import { ProductsListComponent } from "../products-list/products-list.component";

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CategoryInfoComponent, ProductsListComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  categoryId: string = ''; // Changed from selectedCategoryId to categoryId

  onCategorySelected(categoryId: string) {
    this.categoryId = categoryId;
    console.log('Category ID in ProductsComponent:', this.categoryId);

  }
}
