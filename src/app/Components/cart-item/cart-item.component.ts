import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';


@Component({
  selector: 'app-cart-item',
  imports: [CommonModule],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.css'
})
export class CartItemComponent implements OnInit {
  @Input() cart: any;
  totalPrice: number=0;
  quantity:number=0;
  ngOnInit(): void {
    if (this.cart) {
      this.totalPrice = this.cart.price * this.cart.quantity;
    }
  }
  decrease(){
    if(this.cart.quantity>0)this.cart.quantity--;
  }
  increase(){
    this.cart.quantity++;
  }
}
