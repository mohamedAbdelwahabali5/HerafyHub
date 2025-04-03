import { ShippingAddress } from './../../../Models/order.model';
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../../Services/cart.service';
import { OrderService } from '../../../Services/order.service';
import { UsersService } from '../../../Services/users.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-info',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.css'
})
export class UserInfoComponent implements OnInit {
  @Output() shippingAddressChange = new EventEmitter<ShippingAddress>();
  @Output() shippingAddressEdited = new EventEmitter<boolean>();

  isEditing = false;
  userData: any;
  checkoutForm: FormGroup;
  cartItems: any[] = [];
  totalPrice = 0;
  paymentMethods = ['Credit Card', 'Cash on Delivery'];
  selectedPaymentMethod = 'Credit Card';
  isShippingAddressModified = false;

  constructor(
    private userService: UsersService,
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService
  ) {
    this.checkoutForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[\p{L}]+(?:[\s-][\p{L}]+)*$/u)]],
      address: ['', [Validators.required, Validators.pattern(/^[\p{L}0-9\s,.-]+$/u)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]]
    });
  }


  ngOnInit(): void {
    this.loadUserData();
    this.setupFormValueChanges();
  }

  loadUserData(): void {
    this.userService.getUserProfile().subscribe(
      (data) => {
        this.userData = data;

        // Set initial form values
        this.checkoutForm.patchValue({
          name: this.getFullName(),
          address: data.address,
          phone: data.phone
        });

        // Emit initial shipping address
        this.emitShippingAddress();
      },
      (error) => {
        console.error('Error loading user data:', error);
      }
    );
  }

  setupFormValueChanges(): void {
    this.checkoutForm.valueChanges.subscribe(() => {
      this.isShippingAddressModified = true;
    });
  }

  emitShippingAddress(): void {
    const shippingData: ShippingAddress = {
      name: this.checkoutForm.value.name,
      address: this.checkoutForm.value.address,
      phone: this.checkoutForm.value.phone
    };

    this.shippingAddressChange.emit(shippingData);
    this.shippingAddressEdited.emit(true);
  }

  saveChanges(): void {
    if (this.checkoutForm.valid) {
      // Update user data with form values
      this.userData = {
        ...this.userData,
        firstName: this.checkoutForm.value.name.split(' ')[0],
        lastName: this.checkoutForm.value.name.split(' ').slice(1).join(' '),
        address: this.checkoutForm.value.address,
        phone: this.checkoutForm.value.phone
      };

      this.emitShippingAddress();
      this.isEditing = false;
      this.isShippingAddressModified = false;
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  getFullName(): string {
    if (!this.userData) return '';

    // Use the current form values if modified
    if (this.isShippingAddressModified && this.checkoutForm.valid) {
      return this.checkoutForm.value.name;
    }

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

}
