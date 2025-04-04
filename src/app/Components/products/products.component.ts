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
    // Check route state first
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state;
    
    if (state && state['categoryId']) {
      this.categoryId = state['categoryId'];
      this.loadCategory(this.categoryId);
    } else {
      // Fallback to route parameter
      this.route.params.subscribe(params => {
        const categoryId = params['categoryId'];
        if (categoryId) {
          this.categoryId = categoryId;
          this.loadCategory(categoryId);
        }
      });
    }
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
      error: (error) => {
        console.error('Error fetching category:', error);
        // Optionally, handle error (e.g., redirect or show error message)
      }
    });
  }
  private loadProducts(categoryId: string) {
    // This will trigger the ProductsListComponent to update
  }
}
