import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllOrdersComponent } from '../all-orders/all-orders.component';

@Component({
  selector: 'app-order-page',
  standalone: true,
  imports: [
    CommonModule,
    AllOrdersComponent,
  ],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderPageComponent {
}
