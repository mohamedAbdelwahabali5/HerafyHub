import { Component, OnInit } from '@angular/core';
import { CartItemComponent } from '../../cart-item/cart-item.component';
import { OrderSummaryComponent } from '../order-summary/order-summary.component';
import { PaymentFormComponent } from '../payment-form/payment-form.component';
import { UserInfoComponent } from "../user-info/user-info.component";

import { UsersService } from '../../../Services/users.service';
import { ShippingAddress } from '../../../Models/order.model';

@Component({
  selector: 'app-main-checkout',
  imports: [PaymentFormComponent, OrderSummaryComponent, UserInfoComponent],
  templateUrl: './main-checkout.component.html',
  styleUrl: './main-checkout.component.css'
})
export class MainCheckoutComponent implements OnInit {
  userData: any;
  shippingAddress: ShippingAddress = {
    name: '',
    address: '',
    phone: ''
  };
  isShippingAddressEdited = false;


  constructor(private usersService: UsersService) { }

  ngOnInit() {
    this.usersService.getUserProfile().subscribe(
      (data) => {
        this.userData = data;
        console.log('Loaded User Data:', data);
      },
      (error) => {
        console.error('Error loading user data:', error);
      }
    );
  }

  onShippingAddressChange(address: ShippingAddress) {
    this.shippingAddress = address;
    this.isShippingAddressEdited = true;
    console.log('Shipping Address Changed:', address);
  }
}
