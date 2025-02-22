import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CollectionService } from '../../Services/collection.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  @Input() product: any;
  constructor() {}

  ngOnInit() {
    // Simple logging to verify product data is received
    // console.log('Product received:', this.product);
  }

  toggleHeart(e: any) {
    let heartIcon = e.currentTarget.querySelector('.heart-icon');
    console.log(heartIcon);

    heartIcon.classList.toggle('filled');
  }
}
