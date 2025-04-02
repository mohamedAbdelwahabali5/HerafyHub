import { Component } from '@angular/core';
import { CartItemComponent } from '../../cart-item/cart-item.component';
import { OrderSummaryComponent } from '../order-summary/order-summary.component';
import { PaymentFormComponent } from '../payment-form/payment-form.component';
import { UserInfoComponent } from "../user-info/user-info.component";

@Component({
  selector: 'app-main-checkout',
  imports: [PaymentFormComponent, OrderSummaryComponent, UserInfoComponent],
  templateUrl: './main-checkout.component.html',
  styleUrl: './main-checkout.component.css'
})
export class MainCheckoutComponent {

}
