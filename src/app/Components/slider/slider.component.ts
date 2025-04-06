import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../Services/collection.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css']
})
export class SliderComponent implements OnInit {
  categories: any[] = [];
  currentIndex = 0;
  loading = true;
  error: string | null = null;

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit() {
    this.fetchCategories();
  }

  fetchCategories() {
    this.loading = true;
    this.error = null;
    this.productService.getAllCategories().subscribe({
      next: (data: any) => {
        this.categories = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
        this.error = 'Failed to load categories';
        this.loading = false;
      }
    });
  }

  navigateToProducts(categoryId: string) {
    if (!this.loading) {
      this.router.navigate(['/products'], { 
        state: { categoryId: categoryId }
      });
    }
  }

  nextSlide() {
    if (this.categories.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.categories.length;
    }
  }

  prevSlide() {
    if (this.categories.length > 0) {
      this.currentIndex = (this.currentIndex - 1 + this.categories.length) % this.categories.length;
    }
  }

  get visibleCategories() {
    if (!this.categories || this.categories.length === 0) {
      return [];
    }

    const result = [];
    const itemsToShow = 3;
    for (let i = 0; i < itemsToShow && i < this.categories.length; i++) {
      const index = (this.currentIndex + i) % this.categories.length;
      result.push(this.categories[index]);
    }
    return result;
  }

  retryFetch() {
    this.fetchCategories();
  }
}