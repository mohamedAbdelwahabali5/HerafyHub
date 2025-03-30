import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryInfoComponent } from '../category-info/category-info.component';
import { ProductsListComponent } from '../products-list/products-list.component';
import { ProductService } from '../../Services/collection.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CategoryInfoComponent, ProductsListComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent implements OnInit {
  categoryId: string = '';
  selectedCategory: any = null;

  constructor(
    private router: Router,
    private productService: ProductService,
    private route: ActivatedRoute
  ) {
    // Get state during navigation
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as
      | { categoryId: string }
      | undefined;
    if (state?.categoryId) {
      this.categoryId = state.categoryId;
      this.loadCategory(this.categoryId);
    }
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.categoryId = params['categoryId'];
      // Handle case when page is refreshed or accessed directly
      if (this.categoryId && !this.selectedCategory) {
        this.loadCategory(this.categoryId);
      }
    });
  }

  onCategorySelected(categoryId: string) {
    this.categoryId = categoryId;
    this.loadCategory(categoryId);
  }

  private loadCategory(categoryId: string) {
    this.productService.getCategoryById(categoryId).subscribe({
      next: (category: any) => {
        this.selectedCategory = category;
      },
      error: (error) => console.error('Error fetching category:', error),
    });
  }
  private loadProducts(categoryId: string) {
    // This will trigger the ProductsListComponent to update
  }
}
