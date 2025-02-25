import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CollectionService } from '../../Services/collection.service';
import { CommonModule } from '@angular/common';
import { CartService } from '../../Services/cart.service';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
  standalone:true
})
export class ProductCardComponent {
  @Input() product: any;
  constructor(private cartService:CartService) {}

  // ngOnInit() {
  //   console.log('Product received:', this.product.title);
  // }
  // ngOnInit() {
  //   // Simple logging to verify product data is received
  //   // console.log('Product received:', this.product);
  // }

  toggleHeart(e: any) {
    let heartIcon = e.currentTarget.querySelector('.heart-icon');
    console.log(heartIcon);

    heartIcon.classList.toggle('filled');
  }
  

  addToCart(): void {
    if (this.product) {
      let cartProduct = {
        productId: this.product.id,
        productImage: this.product.image,
        productName: this.product.title,
        quantity: 1,
        price: this.product.currentprice
      };
  
      this.cartService.addProductToCart(cartProduct).subscribe({
        next: (response) => {
          console.log(`${this.product.title} added to cart!`, response);
        },
        error: (err) => {
          console.error('Error adding product to cart:', err);
        }
      });
    } else {
      console.log('Product data is not available', this.product);
    }
  }
  
  
}
