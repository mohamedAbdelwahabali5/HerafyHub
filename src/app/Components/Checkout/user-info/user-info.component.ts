import { Component } from '@angular/core';
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
export class UserInfoComponent {
  isEditing = false;
  userData: any;
  checkoutForm: FormGroup;
  cartItems: any[] = [];
  totalPrice = 0;
  paymentMethods = ['Credit Card', 'PayPal', 'Cash on Delivery'];
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
    this.loadCartItems();
  }

  loadUserData(): void {
    const userId = 'current-user-id';
    this.userService.getUserProfile().subscribe(
      (data) => {
        this.userData = data;
        console.log(this.userData);
        // this.checkoutForm.patchValue({
        //   name: data.name,
        //   address: data.address,
        //   phone: data.phone
        // });
      },
      (error) => {
        console.error('Error loading user data:', error);
      }
    );
  }

  loadCartItems(): void {
    this.cartItems = this.cartService.getCartItems();
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.totalPrice = this.cartItems.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  saveChanges(): void {
    if (this.checkoutForm.valid) {
      const userId = 'current-user-id';
      const updatedData = this.checkoutForm.value;

      // this.userService.updateUserData(userId, updatedData).subscribe(
      //   () => {
      //     this.userData = { ...this.userData, ...updatedData };
      //     this.isEditing = false;
      //   },
      //   (error) => {
      //     console.error('Error updating user data:', error);
      //   }
      // );

    }
  }

  placeOrder(): void {
    if (!this.checkoutForm.valid) {
      alert('Please complete your shipping information');
      return;
    }

    const orderData = {
      items: this.cartItems,
      totalPrice: this.totalPrice,
      shippingAddress: this.checkoutForm.value,
      paymentMethod: this.selectedPaymentMethod,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    this.orderService.createOrder(orderData).subscribe(
      (response) => {
        alert('Order placed successfully!');
        this.cartService.clearCart();
      },
      (error) => {
        console.error('Error placing order:', error);
        alert('Failed to place order. Please try again.');
      }
    );
  }
}
