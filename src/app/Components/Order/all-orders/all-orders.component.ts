import { 
  Component, 
  OnInit, 
  signal, 
  Input, 
  OnChanges, 
  SimpleChanges 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../Services/order.service';
import { Order, OrderResponse } from '../../../Models/order.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-all-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-orders.component.html',
  styleUrls: ['./all-orders.component.css'],
})
export class AllOrdersComponent implements OnInit, OnChanges {
  @Input() orderId: string | null = null;

  orders = signal<Order[]>([]);
  loading = signal(true);
  error = signal(false);
  selectedOrderDetails: Order | null = null;

  constructor(private orderService: OrderService) { }

  ngOnInit() {
    this.loadOrders();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Check if orderId has changed and is not null
    if (changes['orderId'] && this.orderId) {
      this.updateOrderStatus(this.orderId);
    }
  }

  updateOrderStatus(orderId: string) {
    // Find the order in the current list and update its status
    this.orders.update(orders => 
      orders.map(order => 
        order._id === orderId 
          ? { ...order, status: 'Cancelled' } 
          : order
      )
    );

    // Update selected order details if it's the same order
    if (this.selectedOrderDetails?._id === orderId) {
      this.selectedOrderDetails = {
        ...this.selectedOrderDetails,
        status: 'Cancelled'
      };
    }
  }

  loadOrders() {
    this.loading.set(true);
    this.orderService.getUserOrders().subscribe({
      next: (response: OrderResponse) => {
        if (response?.success && Array.isArray(response.orders)) {
          const sortedOrders = response.orders.sort((a: Order, b: Order) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          this.orders.set(sortedOrders);
        } else {
          this.orders.set([]);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(true);
        this.loading.set(false);
        console.error('Error loading orders:', err);
      }
    });
  }

  viewOrderDetails(order: Order) {
    if (!order._id) {
      console.error('Order ID is undefined');
      return;
    }
    
    // this.loading.set(true);
    this.orderService.getOrderDetails(order._id).subscribe({
      next: (response) => {
        this.selectedOrderDetails = response;
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching order details:', err);
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }


  closeOrderDetails() {
    this.selectedOrderDetails = null;
  }

  cancelOrder(orderId: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to cancel this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3D8D7A',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.orderService.cancelOrder(orderId).subscribe({
          next: (cancelledOrder) => {
            // Immediately update the order status in the list
            this.orders.update(orders => 
              orders.map(order => 
                order._id === orderId 
                  ? { ...order, status: 'Cancelled' } 
                  : order
              )
            );

            // Update the selected order details if it's the same order
            if (this.selectedOrderDetails?._id === orderId) {
              this.selectedOrderDetails = {
                ...this.selectedOrderDetails,
                status: 'Cancelled'
              };
            }

            // Show success message
            Swal.fire({
              title: 'Cancelled!',
              text: 'Your order has been cancelled.',
              icon: 'success',
              confirmButtonColor: '#3D8D7A'
            });
          },
          error: (err) => {
            this.error.set(true);
            
            // Show error message
            Swal.fire({
              title: 'Error!',
              text: 'Failed to cancel the order. Please try again.',
              icon: 'error',
              confirmButtonColor: '#3D8D7A'
            });
            
            console.error('Error cancelling order:', err);
          }
        });
      }
    });
  }
  applySavedQuantities(): void {
    const storedQuantities = localStorage.getItem('cartQuantities');

    if (storedQuantities && this.selectedOrderDetails?.orderItems) {
      try {
        const cartQuantities: { [key: string]: number } = JSON.parse(storedQuantities);

        this.selectedOrderDetails.orderItems.forEach(item => {
          const productId = item.product?._id;

          if (productId && cartQuantities[productId]) {
            // console.log(`Applying saved quantity for product ${productId}: ${cartQuantities[productId]}`);
            item.quantity = cartQuantities[productId];
          }
        });
      } catch (e) {
        console.error('Error parsing cart quantities:', e);
      }
    }
  }

}
