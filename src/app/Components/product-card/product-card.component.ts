import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import {ProductService } from '../../Services/collection.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, RouterModule],
  providers: [ProductService],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
})
export class ProductCardComponent {
  @Input() product: any;
  constructor(private productService:ProductService) {}

  ngOnInit() {
    // Simple logging to verify product data is received
    // console.log('Product received:', this.product);
  }

  toggleHeart(e: any) {
    let heartIcon = e.currentTarget.querySelector('.heart-icon');
    console.log(heartIcon);

    heartIcon.classList.toggle('filled');
  }
  addToCart(){
    
  }
}
