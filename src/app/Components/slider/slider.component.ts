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

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit() {
    this.productService.getAllCategories().subscribe({
      next: (data: any) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
      }
    });
  }

  navigateToProducts(categoryId: string) {
    this.router.navigate(['/products'], {
      state: { categoryId: categoryId }
    });
  }
  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.categories.length;
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.categories.length) % this.categories.length;
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
}