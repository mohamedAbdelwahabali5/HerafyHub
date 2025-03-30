import { ShippingAddress } from './../../../Models/order.model';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../../Services/cart.service';
import { OrderService } from '../../../Services/order.service';
import { UsersService } from '../../../Services/users.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// import { ShippingAddress } from '../Models/order.model';

@Component({
  selector: 'app-user-info',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.css'
})
export class UserInfoComponent {

  @Output() shippingAddressChange = new EventEmitter<ShippingAddress>();

  isEditing = false;
  userData: any;
  checkoutForm: FormGroup;
  cartItems: any[] = [];
  totalPrice = 0;
  paymentMethods = ['Credit Card', 'Cash on Delivery'];
  selectedPaymentMethod = 'Credit Card';

  constructor(
    private userService: UsersService,
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService
  ) {
    this.checkoutForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]]
    });
  }

  ngOnInit(): void {
    this.loadUserData();
    // this.loadCartItems();
  }

  loadUserData(): void {
    this.userService.getUserProfile().subscribe(
      (data) => {
        this.userData = data;
        console.log(this.userData);
        this.checkoutForm.patchValue({
          name: this.getFullName(),
          address: data.address,
          phone: data.phone
        });
      },
      (error) => {
        console.error('Error loading user data:', error);
      }
    );
  }


  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }
  getFullName(): string {
    if (!this.userData) return '';
    return `${this.userData.firstName} ${this.userData.lastName}`.trim();
  }

  // placeOrder(): void {
  //   if (!this.checkoutForm.valid) {
  //     alert('Please complete your shipping information');
  //     return;
  //   }

  //   const orderData = {
  //     items: this.cartItems,
  //     totalPrice: this.totalPrice,
  //     shippingAddress: this.checkoutForm.value,
  //     paymentMethod: this.selectedPaymentMethod,
  //     status: 'Pending',
  //     createdAt: new Date().toISOString()
  //   };
  // }

  saveChanges(): void {
    if (this.checkoutForm.valid) {
      const shippingData: ShippingAddress = {
        name: this.checkoutForm.value.name,
        address: this.checkoutForm.value.address,
        phone: this.checkoutForm.value.phone
      };

      this.shippingAddressChange.emit(shippingData);
      this.isEditing = false;
    }

  }

}
