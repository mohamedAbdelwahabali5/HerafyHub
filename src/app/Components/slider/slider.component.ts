import { Component } from '@angular/core';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css']
})
export class SliderComponent {
  categories = [
    { name: 'FASHION', image: 'images/hero.png' },
    { name: 'ACCESSORIES', image: 'images/cat.png' },
    { name: 'FURNITURE', image: 'images/hero.png' },
    { name: 'ELECTRONICS', image: 'images/login-image.jpg' },
    { name: 'BEAUTY', image: 'images/hero.png' },
    { name: 'SPORTS', image: 'images/hero.png' },
  ];

  currentIndex = 0;

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