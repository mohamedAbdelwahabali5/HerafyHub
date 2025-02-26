import { CartService } from './../../Services/cart.service';
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
  constructor(private CartService : CartService) {}
toggle:boolean=true;
  ngOnInit() {
    // Simple logging to verify product data is received
    // console.log('Product received:', this.product);
  }
  toggleHeart(e: any) {
    let heartIcon = e.currentTarget.querySelector('.heart-icon');
    console.log(heartIcon);
    if(heartIcon.classList.contains('filled')){
      heartIcon.classList.add('filled');
      this.toggle=true;
      const fav={
        productId:this.product.id,
        productImage:this.product.image,
        productName:this.product.title,
        productDescription:this.product.description,
        productPrice:this.product.currentprice,
      }
      localStorage.setItem('favotite', JSON.stringify(fav));
    }
    else{
      heartIcon.classList.remove('filled');
      this.toggle=false;
    }
  }

  generateRandomID(length: number): string {
    let id = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        id += characters[randomIndex];
    }

    return id;
}
  addToCart(){
    console.log("ho");
    let cartProduct={
      id:this.generateRandomID(10),
      productId:this.product.id,
      productImage:this.product.image,
      productName:this.product.title,
      quantity:1,
      price:this.product.currentprice
    }
    this.CartService.addProductToCart(cartProduct).subscribe({
      next: (response) => {
        console.log('Product added to cart successfully:', response);
      },
      error: (err) => {
        console.error('Error adding product to cart:', err);
      }
    })

  }
}
