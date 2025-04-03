import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../../Services/order.service';
import { CartService } from '../../../Services/cart.service';
import { Router } from '@angular/router';
import { ShippingAddress } from '../../../Models/order.model';
import { ToastrService } from 'ngx-toastr';

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
  @Input() shippingAddress!: ShippingAddress;
  @Input() userData: any;
  @Input() isShippingAddressEdited: boolean = false;
  cartItems: any[] = [];
  paymentForm!: FormGroup;
  selectedMethod: PaymentMethod | null = null;

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

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private cartService: CartService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.initForm();
    this.loadCartItems();

    // Debug logging
    console.log('User Data:', this.userData);
    console.log('Shipping Address:', this.shippingAddress);
    console.log('Is Shipping Address Edited:', this.isShippingAddressEdited);
  }

  loadCartItems() {
    this.cartService.getAllProducts().subscribe({
      next: (response: any) => {
        this.cartItems = response.cartItems;
      },
      error: (error) => {
        console.error('Error loading cart items:', error);
      }
    });
  }

  onSubmit() {
    if (this.selectedMethod && (this.selectedMethod.id === "cod" || this.paymentForm.valid)) {
      // Validate cart items
      if (!this.cartItems || !Array.isArray(this.cartItems) || this.cartItems.length === 0) {
        this.toastr.error('No products in cart', 'Cart Error');
        return;
      }

      // Robust product mapping with fallback
      const orderProducts = this.cartItems.map(item => {
        const productId =
          item.id ||           // Use 'id' field first
          item._id ||          // Then try '_id'
          item.product?._id || // Then nested product ID
          item.productId;      // Last resort

        if (!productId) {
          console.warn('Could not find product ID for item:', item);
          return null;
        }

        return {
          productId: productId,
          quantity: Number(item.quantity || 1)
        };
      }).filter(product => product !== null);

      // Validate order products
      if (orderProducts.length === 0) {
        this.toastr.error('No valid products found in cart', 'Cart Error');
        return;
      }

      // Use the dynamic shipping address method
      const shippingAddress = this.getShippingAddress();

      const orderData = {
        shippingAddress,
        paymentMethod: this.selectedMethod.id === 'cod'
          ? 'Cash on Delivery' as const
          : 'Credit Card' as const,
        products: orderProducts
      };

      // Validation checks similar to backend
      if (!this.validateShippingAddress(shippingAddress)) {
        return;
      }

      this.orderService.createOrder(orderData).subscribe({
        next: (response: any) => {
          // Success toast
          this.toastr.success('Order placed successfully!', 'Success', {
            timeOut: 3000,
            closeButton: true
          });

          this.cartService.clearCart().subscribe({
            next: () => {
              this.router.navigate(['/order'], {
                queryParams: {
                  orderId: response.order?._id || response._id
                }
              });
              this.cartService.clearCartItems();
            },
            error: (clearError) => {
              console.error('Cart clearing failed:', clearError);
              // Still navigate even if cart clearing fails
              this.router.navigate(['/'], {
                queryParams: {
                  orderId: response.order?._id || response._id
                }
              });
            }
          });
        },
        error: (error) => {
          // Error toast
          this.toastr.error(
            error.error?.message || 'Failed to create order',
            'Order Error',
            {
              timeOut: 5000,
              closeButton: true
            }
          );

          // More detailed error logging
          if (error.error?.message) {
            console.error('Server Error Message:', error.error.message);
          }
          if (error.error?.errors) {
            console.error('Validation Errors:', error.error.errors);
          }
        }
      });
    } else {
      // Mark form fields as touched to show validation errors
      Object.keys(this.paymentForm.controls).forEach(field => {
        const control = this.paymentForm.get(field);
        control?.markAsTouched({ onlySelf: true });
      });
    }
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

  isFieldInvalid(fieldName: string): boolean {
    const field = this.paymentForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isFormValid(): boolean {
    // console.log(this.selectedMethod?.id);
    if (!this.selectedMethod) return false;
    if (this.selectedMethod.id === 'card') {
      return this.paymentForm.valid;
    }
    return true; // For non-card methods (like cash)
  }

  // Helper method to get full name
  getUserFullName(): string {
    // Add more robust logging
    console.log('Full Name Debug:');
    console.log('First Name:', this.userData?.firstName);
    console.log('Last Name:', this.userData?.lastName);

    if (!this.userData) {
      console.warn('No user data available');
      return '';
    }

    // Handle cases where firstName or lastName might be undefined
    const firstName = this.userData.firstName || '';
    const lastName = this.userData.lastName || '';

    const fullName = `${firstName} ${lastName}`.trim();

    console.log('Constructed Full Name:', fullName);
    return fullName || '';
  }

  // Helper method to get full address
  getUserFullAddress(): string {
    if (!this.userData) return '';

    const addressParts = [
      this.userData.address,
      this.userData.city,
      this.userData.state
    ].filter(part => part && part.trim() !== '');

    return addressParts.join(' - ');
  }

  // Helper method to get shipping address
  getShippingAddress(): ShippingAddress {
    // If shipping address was explicitly edited in user-info, use that
    if (this.isShippingAddressEdited && this.shippingAddress) {
      return this.shippingAddress;
    }

    // Always return a valid ShippingAddress
    return {
      name: this.getUserFullName(),
      address: this.getUserFullAddress(),
      phone: this.userData?.phone || ''
    };
  }

  // Validation method mimicking backend validation
  validateShippingAddress(address: ShippingAddress): boolean {
    // Name validation
    if (!address.name || address.name.trim().length < 3) {
      this.toastr.error('Name must be at least 3 characters long', 'Validation Error');
      return false;
    }
    if (address.name.trim().length > 100) {
      this.toastr.error('Name cannot exceed 100 characters', 'Validation Error');
      return false;
    }

    // Address validation
    if (!address.address || address.address.trim().length < 3) {
      this.toastr.error('Address must be at least 3 characters long', 'Validation Error');
      return false;
    }
    if (address.address.trim().length > 250) {
      this.toastr.error('Address cannot exceed 250 characters', 'Validation Error');
      return false;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!address.phone || !phoneRegex.test(address.phone)) {
      this.toastr.error('Invalid phone number', 'Validation Error');
      return false;
    }

    return true;
  }
}

