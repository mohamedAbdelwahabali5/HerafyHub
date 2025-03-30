import { Component } from '@angular/core';
import { CartItemComponent } from '../../cart-item/cart-item.component';
import { OrderSummaryComponent } from '../order-summary/order-summary.component';
import { PaymentFormComponent } from '../payment-form/payment-form.component';
import { CartItemsComponent } from '../cart-items/cart-items.component';

@Component({
  selector: 'app-main-checkout',
  imports: [CartItemsComponent,PaymentFormComponent,OrderSummaryComponent],
  templateUrl: './main-checkout.component.html',
  styleUrl: './main-checkout.component.css'
})
export class MainCheckoutComponent {

}
