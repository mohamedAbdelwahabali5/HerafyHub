import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../Services/users.service';
import { FooterService } from '../../Services/footer.service';
import { CommonModule } from '@angular/common';
import { CategoryIdSerService } from '../../Services/category-id-ser.service';
import { Product } from '../../Models/product.model';
import { Category } from '../../Models/product.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  categories: Category[] = [];
  topRatedProducts: Product[] = [];
  isLoggedIn: boolean = false;
  currentCategoryId: string | null = null;
  errorMessage: string = '';

  constructor(
    private userService: UsersService,
    private footerService: FooterService,
    private categoryService: CategoryIdSerService
  ) { }

  ngOnInit(): void {
    this.checkAuthStatus();
    this.loadCategories();

    this.categoryService.currentCategoryId$.subscribe(categoryId => {
      this.currentCategoryId = categoryId;
      if (categoryId) {
        console.log("categoryId = ", categoryId);
        this.loadTopRatedProductsByCategory(categoryId);
      } else {
        this.loadTopRatedProducts();
      }
    });
  }

  private checkAuthStatus(): void {
    this.isLoggedIn = this.userService.isLoggedIn();
  }

  loadCategories(): void {
    this.footerService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        // console.log("this.categories", this.categories);
      },
      error: (error) => this.errorMessage = 'Failed to load categories'
    });
  }

  loadTopRatedProducts(): void {
    this.footerService.loadTopRatedProducts().subscribe({
      next: (products) => {
        this.topRatedProducts = products;
        // console.log("this.topRatedProducts", this.topRatedProducts);
      },
      error: (error) => this.errorMessage = 'Failed to load top rated products'
    });
  }

  loadTopRatedProductsByCategory(categoryId: string): void {
    this.footerService.loadTopRatedProductsPerCategory(categoryId).subscribe({
      next: (products) => {
        this.topRatedProducts = products;
        // console.log("this.topRatedProducts", this.topRatedProducts);
      },
      error: (error) => this.errorMessage = 'Failed to load category products'
    });
  }

  loadCategoryId(event: any) {
    let clickedItem = event.target.closest('a');
    if (clickedItem) {
      const selectedCategoryTitle = clickedItem.textContent.trim();
      const category = this.categories.find((cat: any) => cat.title === selectedCategoryTitle);
      if (category) {
        this.onCategorySelect(category._id);
      }
    }
  }

  //make category id sharable for all components
  onCategorySelect(id: string) {
    this.categoryService.setCategoryId(id);
  }
}
