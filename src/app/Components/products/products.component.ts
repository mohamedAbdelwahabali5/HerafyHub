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
  categoryId: string = 'allProducts'; // Default to all products
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
    // Check route params as a fallback
    this.route.paramMap.subscribe((params) => {
      const routeCategoryId = params.get('categoryId');
      if (routeCategoryId) {
        this.categoryId = routeCategoryId;
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
      error: (error) => {
        console.error('Error fetching category:', error);
        // Fallback to all products if category fetch fails
        this.categoryId = 'allProducts';
        this.selectedCategory = null;
      },
    });
  }
}
