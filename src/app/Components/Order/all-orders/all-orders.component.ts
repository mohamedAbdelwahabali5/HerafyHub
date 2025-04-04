import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../Services/order.service';
import { Order } from '../../../Models/order.model';

@Component({
  selector: 'app-all-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-orders.component.html',
  styleUrls: ['./all-orders.component.css'],
})
export class AllOrdersComponent implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(true);
  error = signal(false);
  selectedOrderDetails: Order | null = null;

  constructor(private orderService: OrderService) { }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);
    this.orderService.getUserOrders().subscribe({
      next: (response: any) => {
        if (response?.success && Array.isArray(response.orders)) {
          this.orders.set(response.orders);
        } else {
          this.orders.set([]);
        }
        this.loading.set(false);
        console.log('Orders loaded:', this.orders());
      },
      error: (err) => {
        this.error.set(true);
        this.loading.set(false);
        console.error('Error loading orders:', err);
      }
    });
  }

  viewOrderDetails(order: Order) {
    this.selectedOrderDetails = order;
    // console.log('Order Details:', order);
    // console.log('Order Items:', order.orderItems);
  }

  closeOrderDetails() {
    this.selectedOrderDetails = null;
  }

  cancelOrder(orderId: string) {
    this.orderService.cancelOrder(orderId).subscribe({
      next: (cancelledOrder) => {
        this.orders.update((orders) =>
          orders.filter((order) => order._id !== orderId)
        );
        this.closeOrderDetails();
      },
      error: (err) => {
        this.error.set(true);
      },
    });
  }
}
