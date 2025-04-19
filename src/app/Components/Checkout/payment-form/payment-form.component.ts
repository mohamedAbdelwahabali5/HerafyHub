import { Component, ElementRef, Input, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

// Services
import { OrderService } from '../../../Services/order.service';
import { CartService } from '../../../Services/cart.service';
import { PaymobService } from '../../../Services/paymob.service';
import { UsersService } from '../../../Services/users.service';

// Models
import { ShippingAddress } from '../../../Models/order.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { interval, Subscription, switchMap, takeWhile } from 'rxjs';
import Swal, { SweetAlertIcon } from 'sweetalert2';

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
  // @ViewChild('paymentIframe') paymentIframe!: ElementRef;

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
  isVerifyingPayment = false;
  private paymentStatusSub!: Subscription;
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
    private userService: UsersService,
    private route: ActivatedRoute,
  ) { }


  ngOnInit() {
    this.loadCartItems();
    this.gettingAllUserInfo();
    this.route.queryParams.subscribe((params) => {
      const success = params['success'];
      const merchantOrderId = params['merchant_order_id'];

      if (localStorage.getItem('fromCheckout') === 'true') {
        // In the queryParams subscription, modify the handling:
        if (success === 'true') {
          // Restore cart data before processing
          if (this.restoreCartData()) {
            const paymentMethod = localStorage.getItem('paymentMethod');
            console.log('Payment Method:', paymentMethod);
            console.log('merchantOrderId:', merchantOrderId);
            if (paymentMethod === 'card') {
              this.handleSuccessfulCardPayment(merchantOrderId);
            } else {
              this.processCashOnDelivery();
            }
            this.showMessage('Payment Successful', `Order ID: ${merchantOrderId}`, 'success');
          } else {
            this.toastr.error('Could not restore order data', 'Error');
          }
        } else {
          this.showMessage('Payment Failed', `Order ID: ${merchantOrderId}`, 'error')
        }
        this.removePaymentFlag();
        this.removePaymentMethod();

        // After payment processing is complete, also clean up other localStorage items
        setTimeout(() => {
          localStorage.removeItem('processedOrderId');
          localStorage.removeItem('lastOrderId');
        }, 5000); // Give some time for navigation to complete
      }
    });
  }
  ngOnDestroy() {
    if (this.paymentStatusSub) {
      this.paymentStatusSub.unsubscribe();
    }
  }
  private loadPaymentIframe(url: string) {
    // Bypass security trust for this specific URL
    const trustedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

    // Use Angular's safe value in the template
    this.safeIframeUrl = trustedUrl;

    // console.log('Payment iframe URL set:', url);
  }
  loadCartItems() {
    this.cartService.getAllProducts().subscribe({
      next: (response: any) => {
        this.cartItems = response.cartItems;
        this.applySavedQuantities(); // Add this line
        this.calculateTotalPrice();
      },
      error: (error) => {
        console.error('Error loading cart items:', error);
        this.toastr.error('Failed to load cart items', 'Error');
      }
    });
  }

  private applySavedQuantities(): void {
    const storedQuantities = localStorage.getItem('cartQuantities');
    if (storedQuantities) {
      try {
        const cartQuantities = JSON.parse(storedQuantities);
        this.cartItems.forEach(item => {
          const productId = item.id || item._id || item.product?._id || item.productId;
          // Handle both array and object formats
          const quantity = Array.isArray(cartQuantities)
            ? cartQuantities.find(q => q.id === productId)?.quantity
            : cartQuantities[productId];

          if (quantity) {
            item.quantity = Number(quantity);
            item.total = item.price * item.quantity;
          }
        });
      } catch (e) {
        console.error('Error parsing cart quantities:', e);
      }
    }
  }

  calculateTotalPrice(): void {
    this.totalPrice = this.cartItems.reduce(
      (sum, item) => sum + (item.total || 0),
      -4
    );
    this.totalPrice = Math.round(this.totalPrice * 100); // Convert to cents
  }

  onSubmit() {
    if (!this.selectedMethod) {
      console.log('No payment method selected');
      console.log(this.selectedMethod);
      this.toastr.error('Please select a payment method', 'Error');
      return;
    }

    if (this.selectedMethod.id === 'cod' || this.selectedMethod.id === 'card') {
      this.processCashOnDelivery();
    }

  }




  private startPaymentVerification() {
    if (!this.orderId) return;

    this.isVerifyingPayment = true;

    this.paymentStatusSub = interval(3000).pipe(
      switchMap(() => this.paymobService.checkPaymentStatus(this.orderId.toString())),
      takeWhile(response => response.status !== 'paid', true)
    ).subscribe({
      next: (response) => {
        if (response.status === 'paid') {
          this.handleSuccessfulPayment();
        }
      },
      error: (err) => {
        this.toastr.error('Error verifying payment', 'Error');
        this.isVerifyingPayment = false;
      }
    });
  }

  private handleSuccessfulPayment() {
    this.isVerifyingPayment = false;
    this.toastr.success('Payment completed successfully!', 'Success');
    this.router.navigate(['/order-success'], {
      queryParams: { orderId: this.orderId }
    });
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
    console.log('Cart Items:', this.cartItems);

    return this.cartItems.map(item => {
      const productId = item.id || item._id || item.product?._id || item.productId;
      const quantity = item.quantity;

      if (!productId) {
        console.warn('Could not find product ID for item:', item);
        return null;
      }
      return {
        productId: productId,
        quantity: Number(quantity)
      };
    }).filter(product => product !== null);
  }

  private handleOrderSuccess(response: any) {
    this.isLoading = false;
    this.toastr.success('Order placed successfully!', 'Success', {
      timeOut: 3000,
      closeButton: true
    });

    const orderId = response.order?._id || response._id;

    this.cartService.clearCart().subscribe({
      next: () => {
        this.router.navigate(['/order'], {
          queryParams: { orderId: orderId }
        });
        this.cartService.clearCartItems();
        localStorage.removeItem('productsInCart');
        localStorage.removeItem('cartQuantities');
        localStorage.removeItem('fromCheckout');
        localStorage.removeItem('checkoutCartData');
        localStorage.removeItem('paymentMethod');
        localStorage.removeItem('processedOrderId');
      },
      error: (clearError) => {
        console.error('Cart clearing failed:', clearError);
        this.router.navigate(['/order'], {
          queryParams: { orderId: orderId }
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
    localStorage.setItem('paymentMethod', method.id);
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

  // Update this method to properly handle the card payment flow
  private handleSuccessfulCardPayment(merchantOrderId: string) {
    // Check if we already processed this order to prevent duplicates
    if (localStorage.getItem('processedOrderId') === merchantOrderId) {
      console.log('Order already processed:', merchantOrderId);
      this.router.navigate(['/order'], {
        queryParams: { orderId: localStorage.getItem('lastOrderId') || '' }
      });
      return;
    }

    // First create the order in your system
    const orderProducts = this.mapCartItemsToOrderProducts();
    if (!orderProducts.length) {
      this.toastr.error('No products found in cart', 'Order Error');
      return;
    }

    const shippingAddress = this.getShippingAddress();
    if (!this.validateShippingAddress(shippingAddress)) return;

    const orderData = {
      shippingAddress,
      paymentMethod: 'Credit Card' as const,
      products: orderProducts.map(p => ({
        productId: String(p?.productId),
        quantity: Number(p?.quantity || 1)
      }))

    };

    this.isLoading = true;
    this.orderService.createOrder(orderData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        const orderId = response.order?._id || response._id;

        // Mark this order as processed to prevent duplicates
        localStorage.setItem('processedOrderId', merchantOrderId);
        localStorage.setItem('lastOrderId', orderId);

        // Clear cart and navigate to order success page
        this.cartService.clearCart().subscribe({
          next: () => {
            this.router.navigate(['/order'], {
              queryParams: { orderId: orderId }
            });
            this.cartService.clearCartItems();
            localStorage.removeItem('productsInCart');
            localStorage.removeItem('cartQuantities');
          },
          error: (clearError) => {
            console.error('Cart clearing failed:', clearError);
            this.router.navigate(['/order'], {
              queryParams: { orderId: orderId }
            });
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.toastr.error(
          error.error?.message || 'Failed to create order record',
          'Order Error',
          { timeOut: 5000, closeButton: true }
        );
        console.error('Failed to create order after successful payment:', error);
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
        this.setPaymentFlag();

        // Load iframe after slight delay to ensure DOM is ready
        setTimeout(() => {
          this.loadPaymentIframe(this.iframeUrl);
          this.startPaymentVerification();
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

  setPaymentFlag() {
    localStorage.setItem('fromCheckout', 'true');
    localStorage.setItem('checkoutCartData', JSON.stringify(this.cartItems));
  }
  removePaymentFlag() {
    localStorage.removeItem('fromCheckout');
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

  private removePaymentMethod() {
    localStorage.removeItem('paymentMethod');
  }
  // method to restore cart data
  private restoreCartData() {
    const savedCartData = localStorage.getItem('checkoutCartData');
    if (savedCartData) {
      try {
        this.cartItems = JSON.parse(savedCartData);
        this.calculateTotalPrice();
        return true;
      } catch (e) {
        console.error('Error parsing saved cart data:', e);
        return false;
      }
    }
    return false;
  }
  private showMessage(title: string, message: string, icon: SweetAlertIcon): void {
    Swal.fire({
      title: title,
      text: message,
      icon: icon,
      showConfirmButton: false,
      timer: 3000
    });
  }
}


