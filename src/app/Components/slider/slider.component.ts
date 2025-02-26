import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../Services/collection.service';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css']
})
export class SliderComponent implements OnInit {
  categories: any[] = [];
  currentIndex = 0;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getAllCategories().subscribe({
      next: (data: any) => {
        console.log(data);
        
        this.categories = data;
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
      }
    });
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.categories.length;
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.categories.length) % this.categories.length;
  }

  get visibleCategories() {
    const result = [];
    // Always get 3 items, CSS will handle visibility
    const itemsToShow = 3;
    for (let i = 0; i < itemsToShow; i++) {
      const index = (this.currentIndex + i) % this.categories.length;
      result.push(this.categories[index]);
    }
    return result;
  }
}