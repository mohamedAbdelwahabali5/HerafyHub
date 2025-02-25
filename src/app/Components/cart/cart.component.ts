import { Component } from '@angular/core';
import { CartItemComponent } from '../cart-item/cart-item.component';
import { CartService } from '../../Services/cart.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-cart',
  imports: [CartItemComponent,CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  Carts: any[] = []; 
  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.getAllProducts();
  }
 

  getAllProducts(): void {
    this.cartService.getAllProducts().subscribe({
      next: (data) => {
        this.Carts=<any>data;
        console.log('Products fetched:', this.Carts); 
      },
      error: (err) => {
        console.error('Error fetching products:', err);
      }
    });
  }

 

}
