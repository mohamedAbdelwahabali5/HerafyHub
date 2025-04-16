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

  cartItems: any[] = [];
  selectedMethod: PaymentMethod | null = null;
  userInfo: any;
  totalPrice = 0;
  isLoading = false;
  isProcessingReturn = false;
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
      if (localStorage.getItem('fromCheckout') === 'true') {
        this.handlePaymentReturn(params);
      }
    });
  }

  private handlePaymentReturn(params: any) {
    this.isProcessingReturn = true;
    console.log('Returned from payment gateway with params:', params);

    const success = params['success'];
    const merchantOrderId = params['merchant_order_id'];

    if (!merchantOrderId) {
      console.error('Missing merchant order ID in return URL');
      this.showMessage('Payment Error', 'Missing order information', 'error');
      this.removePaymentFlag();
      this.isProcessingReturn = false;
      return;
    }

    if (success === 'true') {
      this.router.navigate(['/order'], { queryParams: { orderId: merchantOrderId } });
      this.processSuccessfulPayment(merchantOrderId);
    } else {
      this.showMessage('Payment Failed', `Order ID: ${merchantOrderId}`, 'error');
      this.removePaymentFlag();
      this.isProcessingReturn = false;
    }
  }

  private processSuccessfulPayment(merchantOrderId: string) {
    // First ensure user info is loaded
    this.userService.getUserProfile().subscribe({
      next: (userResponse) => {
        this.userInfo = userResponse;
        this.proceedWithOrderCreation(merchantOrderId);
      },
      error: (userError) => {
        console.error('Error loading user info:', userError);
        this.toastr.error('Failed to load user information', 'Error');
        this.isProcessingReturn = false;
      }
    });
  }

  private proceedWithOrderCreation(merchantOrderId: string) {
    console.log('Processing payment success for order:', merchantOrderId);

    if (localStorage.getItem('processedOrderId') === merchantOrderId) {
      console.log('Order already processed:', merchantOrderId);
      this.router.navigate(['/order'], {
        queryParams: { orderId: localStorage.getItem('lastOrderId') || '' }
      });
      this.isProcessingReturn = false;
      return;
    }

    if (!this.restoreCartData()) {
      this.toastr.error('Failed to restore cart data', 'Order Error');
      this.router.navigate(['/cart']);
      this.isProcessingReturn = false;
      return;
    }

    const orderProducts = this.mapCartItemsToOrderProducts();
    if (!orderProducts || orderProducts.length === 0) {
      this.toastr.error('No products found in cart', 'Order Error');
      this.isProcessingReturn = false;
      return;
    }

    const shippingAddress = this.getShippingAddress();
    console.log('Shipping Address:', shippingAddress);

    // Add fallback values if empty
    if (!shippingAddress.name || !shippingAddress.address) {
      shippingAddress.name = shippingAddress.name || 'Customer';
      shippingAddress.address = shippingAddress.address || 'Online Order';
      shippingAddress.phone = shippingAddress.phone || '01000000000';
      console.warn('Using fallback shipping address values');
    }

    const orderData = {
      shippingAddress,
      paymentMethod: 'Credit Card' as const,
      products: orderProducts.map(p => ({
        productId: String(p?.productId),
        quantity: Number(p?.quantity || 1)
      })),
      paymentReference: merchantOrderId
    };

    console.log('Creating order with data:', orderData);
    this.isLoading = true;

    this.orderService.createOrder(orderData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        const orderId = response.order?._id || response._id;
        console.log('Order created successfully:', orderId);

        localStorage.setItem('processedOrderId', merchantOrderId);
        localStorage.setItem('lastOrderId', orderId);

        this.clearCartAndNavigate(orderId);
        this.isProcessingReturn = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Failed to create order:', error);
        this.toastr.error(
          error.error?.message || 'Failed to create order record',
          'Order Error',
          { timeOut: 5000, closeButton: true }
        );
        this.isProcessingReturn = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.paymentStatusSub) {
      this.paymentStatusSub.unsubscribe();
    }
  }

  private loadPaymentIframe(url: string) {
    this.safeIframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  loadCartItems() {
    this.cartService.getAllProducts().subscribe({
      next: (response: any) => {
        this.cartItems = response.cartItems;
        this.applySavedQuantities();
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
    this.router.navigate(['/order'], {
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
    this.clearCartAndNavigate(orderId);
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
    localStorage.setItem('isShippingAddressEdited', this.isShippingAddressEdited ? 'true' : 'false');
    localStorage.setItem('shippingAddress', JSON.stringify(this.shippingAddress));
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
      phone_number: this.userInfo.phone || '01000000000',
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
        this.iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/911500?payment_token=${this.paymentKey}`;
        this.setPaymentFlag();

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

  private clearCartAndNavigate(orderId: string) {
    this.cleanupLocalStorage();
    this.cartService.clearCartItems();
    this.cartItems = [];

    this.cartService.clearCart().subscribe({
      next: () => {
        console.log('Cart cleared successfully via API');
        this.router.navigate(['/order'], {
          queryParams: { orderId: orderId }
        });
      },
      error: (clearError) => {
        console.error('Cart clearing API call failed:', clearError);
        this.router.navigate(['/order'], {
          queryParams: { orderId: orderId }
        });
      }
    });
  }

  private cleanupLocalStorage() {
    const keysToRemove = [
      'productsInCart',
      'cartQuantities',
      'fromCheckout',
      'checkoutCartData',
      'paymentMethod',
      'processedOrderId',
      'lastOrderId'
    ];

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  setPaymentFlag() {
    localStorage.setItem('fromCheckout', 'true');
    localStorage.setItem('checkoutCartData', JSON.stringify(this.cartItems));
  }

  removePaymentFlag() {
    localStorage.removeItem('fromCheckout');
  }

  removePaymentMethod() {
    localStorage.removeItem('paymentMethod');
  }

  getShippingAddress(): ShippingAddress {
    if (this.isShippingAddressEdited && this.shippingAddress) {
      return this.shippingAddress;
    }

    if (localStorage.getItem('isShippingAddressEdited') === 'true') {
      const shippingAddressString = localStorage.getItem('shippingAddress');
      if (shippingAddressString) {
        console.log('Shipping address found in local storage');
        return JSON.parse(shippingAddressString);
      }
    }

    if (this.userInfo) {
      return {
        name: `${this.userInfo.firstName || ''} ${this.userInfo.lastName || ''}`.trim(),
        address: [this.userInfo.address, this.userInfo.city, this.userInfo.state]
          .filter(part => part && part.trim() !== '')
          .join(' - '),
        phone: this.userInfo.phone || ''
      };
    }

    return {
      name: '',
      address: '',
      phone: ''
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

  private restoreCartData(): boolean {
    try {
      const savedCartData = localStorage.getItem('checkoutCartData');
      if (!savedCartData) {
        console.error('No saved cart data found');
        return false;
      }

      this.cartItems = JSON.parse(savedCartData);
      if (!this.cartItems || !Array.isArray(this.cartItems) || this.cartItems.length === 0) {
        console.error('Invalid cart data format or empty cart');
        return false;
      }

      this.calculateTotalPrice();
      return true;
    } catch (e) {
      console.error('Error restoring cart data:', e);
      return false;
    }
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
