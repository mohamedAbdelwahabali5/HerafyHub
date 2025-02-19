import { Component } from '@angular/core';

@Component({
  selector: 'app-slider',
  imports: [],
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css'],
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
    if (this.currentIndex < this.categories.length - 3) {
      this.currentIndex++;
    }
  }

  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  // Get the visible categories based on the current index
  get visibleCategories() {
    return this.categories.slice(this.currentIndex, this.currentIndex + 3);
  }
}
