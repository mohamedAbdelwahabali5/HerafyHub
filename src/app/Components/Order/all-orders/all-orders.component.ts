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

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);
    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
        console.log(orders);
      },
      error: (err) => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  viewOrderDetails(order: Order) {
    this.selectedOrderDetails = order;
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
