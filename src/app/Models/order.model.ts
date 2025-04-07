export type OrderStatus = 
  | 'In-Progress' 
  | 'Confirmed' 
  | 'Processing' 
  | 'Shipping' 
  | 'Out for Delivery' 
  | 'Delivered' 
  | 'Cancelled';

export type PaymentMethod = 'Credit Card' | 'Cash on Delivery';

export interface ShippingAddress {
  name: string;
  address: string;
  phone: string;
}

export interface OrderItem {
  _id?: string;
  order?: string;
  product: {
    _id: string;
    title: string;
    price?: number;
    image?: string;
  };
  quantity: number;
  price: number;
}
export interface OrderStatistics {
  totalOrders: number;
  totalSpent: number;
  ordersByStatus: {
    inProgress: number;
    confirmed: number;
    processing: number;
    shipping: number;
    delivered: number;
    cancelled: number;
  };
}

export interface RecentActivity {
  orderNumber?: string;
  status: string;
  totalPrice: number;
  date: Date;
  items: number;
  action: string;
}

export interface Order {
  _id?: string;
  user?: string;
  invoiceNumber:string;
  shippingAddress: ShippingAddress;
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  IsCancelled: boolean;
  createdAt: Date;
  updatedAt: Date;
  orderItems: OrderItem[];
}


export interface OrderResponse {
  success: boolean;
  message: string;
  statistics: OrderStatistics;
  recentActivity: RecentActivity[];
  orders: Order[];
}
