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
  categoryGroups: any[][] = [];
  currentIndex = 0;
  itemsPerSlide = 3;

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit() {
    this.detectScreenSize();
    this.loadCategories();
    window.addEventListener('resize', () => {
      const oldItemsPerSlide = this.itemsPerSlide;
      this.detectScreenSize();

      if (oldItemsPerSlide !== this.itemsPerSlide) {
        this.organizeCategories();
      }
    });
  }

  detectScreenSize() {
    if (window.innerWidth < 768) {
      this.itemsPerSlide = 1;
    } else if (window.innerWidth < 992) {
      this.itemsPerSlide = 2;
    } else {
      this.itemsPerSlide = 3;
    }
  }

  loadCategories() {
    this.productService.getAllCategories().subscribe({
      next: (data: any) => {
        this.categories = data;
        this.organizeCategories();
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
      }
    });
  }

  organizeCategories() {
    this.categoryGroups = [];
    for (let i = 0; i < this.categories.length; i += this.itemsPerSlide) {
      this.categoryGroups.push(
        this.categories.slice(i, Math.min(i + this.itemsPerSlide, this.categories.length))
      );
    }
    if (this.currentIndex >= this.categoryGroups.length) {
      this.currentIndex = 0;
    }
  }

  navigateToProducts(categoryId: string) {
    this.router.navigate(['/products'], {
      state: { categoryId: categoryId }
    });
  }

  nextSlide() {
    if (this.categoryGroups.length > 1) {
      this.currentIndex = (this.currentIndex + 1) % this.categoryGroups.length;
      this.updateCarousel();
    }
  }

  prevSlide() {
    if (this.categoryGroups.length > 1) {
      this.currentIndex = (this.currentIndex - 1 + this.categoryGroups.length) % this.categoryGroups.length;
      this.updateCarousel();
    }
  }

  updateCarousel() {
    const carousel = document.getElementById('categorySlider');
    if (carousel) {
      const items = carousel.querySelectorAll('.carousel-item');
      items.forEach((item, index) => {
        if (index === this.currentIndex) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
  }
  get visibleCategories() {
    if (this.categoryGroups.length === 0) {
      return [];
    }
    return this.categoryGroups[this.currentIndex] || [];
  }
}
