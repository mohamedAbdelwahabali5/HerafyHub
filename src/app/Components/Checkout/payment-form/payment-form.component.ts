import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../../Services/order.service';
import { ShippingAddress, Order } from './../../../Models/order.model';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './payment-form.component.html',
  styleUrl: './payment-form.component.css'
})
export class PaymentFormComponent implements OnInit {
  @Input() shippingAddress: any;
  // @Input() cartItems!: OrderItem[];
  paymentMethods: PaymentMethod[] = [
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: 'fas fa-money-bill-wave',
      description: 'Pay when your package arrives'
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: 'fas fa-credit-card',
      description: 'Quick and secure online payment'
    }
  ];

  selectedMethod: PaymentMethod | null = null;
  paymentForm!: FormGroup;

  constructor(private fb: FormBuilder, private orderService: OrderService) { }

  ngOnInit() {
    this.initForm();
  }


  initForm() {
    this.paymentForm = this.fb.group({
      cardholderName: ['', [Validators.required, Validators.minLength(2)]],
      cardNumber: ['', [
        Validators.required,
        Validators.pattern(/^\d{16}$/),
        Validators.minLength(16),
        Validators.maxLength(16)
      ]],
      expirationDate: ['', [
        Validators.required,
        Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)
      ]],
      cvv: ['', [
        Validators.required,
        Validators.pattern(/^\d{3}$/),
        Validators.minLength(3),
        Validators.maxLength(3)
      ]]
    });
  }

  selectPaymentMethod(method: PaymentMethod) {
    this.selectedMethod = method;

    if (method.id !== 'card') {
      this.paymentForm.reset();
    }
  }

  // loadCartItems(): void {
  //   this.cartItems = this.cartService.getCartItems();
  //   this.calculateTotal();
  // }

  // calculateTotal(): void {
  //   this.totalPrice = this.cartItems.reduce(
  //     (total, item) => total + (item.price * item.quantity),
  //     0
  //   );
  // }


  isFieldInvalid(fieldName: string): boolean {
    const field = this.paymentForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // onSubmit() {
  //   if (this.selectedMethod && (this.selectedMethod.id == "cod" || this.paymentForm.valid)) {
  //     console.log('Payment Form Submitted', this.paymentForm.value);
  //     console.log('Selected Method', this.selectedMethod);
  //     this.orderService.createOrder(this.paymentForm.value);
  //   } else {
  //     Object.keys(this.paymentForm.controls).forEach(field => {
  //       const control = this.paymentForm.get(field);
  //       control?.markAsTouched({ onlySelf: true });
  //     });
  //   }
  // }

  onSubmit() {
    if (this.selectedMethod && (this.selectedMethod.id == "cod" || this.paymentForm.valid)) {
      const orderData = {
        shippingAddress: this.shippingAddress,
        paymentMethod: this.selectedMethod,
        paymentDetails: this.paymentForm.value
      };

      this.orderService.createOrder(orderData: Order).subscribe({
        next: (response) => {
          console.log('Order created successfully', response);
        },
        error: (err) => {
          console.error('Error creating order', err);
        }
      });
    }
  }

  isFormValid(): boolean {
    // console.log(this.selectedMethod?.id);
    if (!this.selectedMethod) return false;
    if (this.selectedMethod.id === 'card') {
      return this.paymentForm.valid;
    }
    return true; // For non-card methods (like cash)
  }
}
}
