import { Component, ElementRef, Input, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

// Services
import { OrderService } from '../../../Services/order.service';
import { CartService } from '../../../Services/cart.service';
import { PaymobService } from '../../../Services/paymob.service';
import { UsersService } from '../../../Services/users.service';

// Models
import { ShippingAddress } from '../../../Models/order.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface PaymobAuthResponse {
  token: string;
}

interface PaymobOrderResponse {
  id: number;
}

interface PaymobPaymentKeyResponse {
  token: string;
}

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.css']
})
export class PaymentFormComponent implements OnInit {
  @Input() shippingAddress!: ShippingAddress;
  @Input() userData: any;
  @Input() isShippingAddressEdited: boolean = false;
  @ViewChild('paymentIframe') paymentIframe!: ElementRef;

  cartItems: any[] = [];
  selectedMethod: PaymentMethod | null = null;
  userInfo: any;
  totalPrice = 0;
  isLoading = false;
  safeIframeUrl!: SafeResourceUrl;
  // Paymob properties
  authToken: string = '';
  orderId: number = 0;
  paymentKey: string = '';
  iframeUrl: string = '';
  isPaymentProcessing: boolean = false;

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
    private sanitizer: DomSanitizer,
    private orderService: OrderService,
    private cartService: CartService,
    private router: Router,
    private toastr: ToastrService,
    private paymobService: PaymobService,
    private userService: UsersService
  ) { }


  ngOnInit() {
    this.loadCartItems();
    this.gettingAllUserInfo();
  }

  private loadPaymentIframe(url: string) {
    // Bypass security trust for this specific URL
    const trustedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

    // Use Angular's safe value in the template
    this.safeIframeUrl = trustedUrl;

    console.log('Payment iframe URL set:', url);
  }
  loadCartItems() {
    this.cartService.getAllProducts().subscribe({
      next: (response: any) => {
        this.cartItems = response.cartItems;
        this.calculateTotalPrice();
      },
      error: (error) => {
        console.error('Error loading cart items:', error);
        this.toastr.error('Failed to load cart items', 'Error');
      }
    });
  }

  calculateTotalPrice(): void {
    this.totalPrice = this.cartItems.reduce(
      (sum, item) => sum + (item.total || 0),
      0
    );
    this.totalPrice = Math.round(this.totalPrice * 100); // Convert to cents
  }

  onSubmit() {
    if (!this.selectedMethod) {
      this.toastr.error('Please select a payment method', 'Error');
      return;
    }

    if (this.selectedMethod.id === 'cod') {
      this.processCashOnDelivery();
    } else if (this.selectedMethod.id === 'card' && this.paymentKey) {
      // For card payments, the order is created after successful payment in the iframe
      // You might need to handle this differently based on your backend implementation
      this.toastr.info('Please complete the payment process', 'Info');
    }
  }

  private processCashOnDelivery() {
    if (!this.validateCartItems()) return;

    const orderProducts = this.mapCartItemsToOrderProducts();
    if (!orderProducts.length) return;

    const shippingAddress = this.getShippingAddress();
    if (!this.validateShippingAddress(shippingAddress)) return;

    const orderData = {
      shippingAddress,
      paymentMethod: 'Cash on Delivery' as const,
      products: orderProducts.map(p => ({
        productId: String(p?.productId),
        quantity: Number(p?.quantity || 1)
      }))
    };

    this.isLoading = true;
    this.orderService.createOrder(orderData).subscribe({
      next: (response: any) => {
        this.handleOrderSuccess(response);
      },
      error: (error) => {
        this.handleOrderError(error);
      }
    });
  }

  private validateCartItems(): boolean {
    if (!this.cartItems || !Array.isArray(this.cartItems) || this.cartItems.length === 0) {
      this.toastr.error('No products in cart', 'Cart Error');
      return false;
    }
    return true;
  }

  private mapCartItemsToOrderProducts() {
    return this.cartItems.map(item => {
      const productId = item.id || item._id || item.product?._id || item.productId;
      if (!productId) {
        console.warn('Could not find product ID for item:', item);
        return null;
      }
      return {
        productId: productId,
        quantity: Number(item.quantity || 1)
      };
    }).filter(product => product !== null);
  }

  private handleOrderSuccess(response: any) {
    this.isLoading = false;
    this.toastr.success('Order placed successfully!', 'Success', {
      timeOut: 3000,
      closeButton: true
    });

    this.cartService.clearCart().subscribe({
      next: () => {
        this.router.navigate(['/order'], {
          queryParams: { orderId: response.order?._id || response._id }
        });
        this.cartService.clearCartItems();
      },
      error: (clearError) => {
        console.error('Cart clearing failed:', clearError);
        this.router.navigate(['/'], {
          queryParams: { orderId: response.order?._id || response._id }
        });
      }
    });
  }

  private handleOrderError(error: any) {
    this.isLoading = false;
    this.toastr.error(
      error.error?.message || 'Failed to create order',
      'Order Error',
      { timeOut: 5000, closeButton: true }
    );

    if (error.error?.message) {
      console.error('Server Error Message:', error.error.message);
    }
    if (error.error?.errors) {
      console.error('Validation Errors:', error.error.errors);
    }
  }

  selectPaymentMethod(method: PaymentMethod) {
    this.selectedMethod = method;
    if (method.id === 'card') {
      this.initiateCardPayment();
    }
  }

  initiateCardPayment() {
    if (this.isPaymentProcessing) return;

    this.isPaymentProcessing = true;
    this.calculateTotalPrice();

    if (this.totalPrice <= 0) {
      this.toastr.error('Invalid payment amount', 'Error');
      this.isPaymentProcessing = false;
      return;
    }

    this.paymobService.getAuthToken().subscribe({
      next: (res: PaymobAuthResponse) => {
        this.authToken = res.token;
        this.createPaymobOrder();
      },
      error: (err) => {
        this.handlePaymentError('Failed to get authentication token', err);
      }
    });
  }

  private createPaymobOrder() {
    this.paymobService.createOrder(this.authToken, this.totalPrice).subscribe({
      next: (orderRes: PaymobOrderResponse) => {
        this.orderId = orderRes.id;
        this.getPaymentKey();
      },
      error: (err) => {
        this.handlePaymentError('Failed to create payment order', err);
      }
    });
  }

  private getPaymentKey() {
    if (!this.userInfo) {
      this.handlePaymentError('User information not available');
      return;
    }

    const billingData = {
      first_name: this.userInfo.firstName || 'Customer',
      last_name: this.userInfo.lastName || '',
      phone_number: this.userInfo.phone || '01000000000', // Paymob requires phone
      email: this.userInfo.email || 'customer@example.com',
      apartment: "NA",
      floor: "NA",
      street: (this.userInfo.address || '').split(",")[0] || 'Unknown',
      building: "NA",
      city: this.userInfo.city || 'Cairo',
      country: "EG",
      postal_code: this.userInfo.zipCode || '12345'
    };

    this.paymobService.getPaymentKey(
      this.authToken,
      this.orderId,
      this.totalPrice,
      billingData
    ).subscribe({
      next: (keyRes: PaymobPaymentKeyResponse) => {
        this.paymentKey = keyRes.token;
        // Use your actual Paymob iframe ID (replace 911500)
        this.iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/911500?payment_token=${this.paymentKey}`;

        // Load iframe after slight delay to ensure DOM is ready
        setTimeout(() => {
          this.loadPaymentIframe(this.iframeUrl);
          this.isPaymentProcessing = false;
        }, 100);
      },
      error: (err) => {
        this.handlePaymentError('Failed to get payment key', err);
      }
    });
  }

  private handlePaymentError(message: string, error?: any) {
    this.isPaymentProcessing = false;
    console.error(message, error);
    this.toastr.error(message, 'Payment Error');
  }

  // Helper methods remain the same
  getUserFullName(): string {
    if (!this.userData) return '';
    const firstName = this.userData.firstName || '';
    const lastName = this.userData.lastName || '';
    return `${firstName} ${lastName}`.trim();
  }

  getUserFullAddress(): string {
    if (!this.userData) return '';
    const addressParts = [
      this.userData.address,
      this.userData.city,
      this.userData.state
    ].filter(part => part && part.trim() !== '');
    return addressParts.join(' - ');
  }

  getShippingAddress(): ShippingAddress {
    if (this.isShippingAddressEdited && this.shippingAddress) {
      return this.shippingAddress;
    }
    return {
      name: this.getUserFullName(),
      address: this.getUserFullAddress(),
      phone: this.userData?.phone || ''
    };
  }

  validateShippingAddress(address: ShippingAddress): boolean {
    if (!address.name || address.name.trim().length < 3) {
      this.toastr.error('Name must be at least 3 characters long', 'Validation Error');
      return false;
    }
    if (address.name.trim().length > 100) {
      this.toastr.error('Name cannot exceed 100 characters', 'Validation Error');
      return false;
    }

    if (!address.address || address.address.trim().length < 3) {
      this.toastr.error('Address must be at least 3 characters long', 'Validation Error');
      return false;
    }
    if (address.address.trim().length > 250) {
      this.toastr.error('Address cannot exceed 250 characters', 'Validation Error');
      return false;
    }

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!address.phone || !phoneRegex.test(address.phone)) {
      this.toastr.error('Invalid phone number', 'Validation Error');
      return false;
    }

    return true;
  }

  gettingAllUserInfo() {
    this.userService.getUserProfile().subscribe({
      next: (response) => {
        this.userInfo = response;
      },
      error: (error) => {
        console.error('Error loading user info:', error);
        this.toastr.error('Failed to load user information', 'Error');
      }
    });
  }

  clearIframe() {
    if (this.paymentIframe) {
      this.paymentIframe.nativeElement.src = '';
    }
  }
}


