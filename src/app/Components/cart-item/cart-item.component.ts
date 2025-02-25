import { Component, Input, OnInit } from '@angular/core';


@Component({
  selector: 'app-cart-item',
  imports: [],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.css'
})
export class CartItemComponent implements OnInit {
  @Input() cart: any;
  totalPrice: number=0;

  ngOnInit(): void {
    if (this.cart) {
      this.totalPrice = this.cart.price * this.cart.quantity; 
    }
  }
}
