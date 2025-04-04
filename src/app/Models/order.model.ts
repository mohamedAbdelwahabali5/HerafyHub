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

export interface Order {
  _id?: string;
  user?: string;
  shippingAddress: ShippingAddress;
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  IsCancelled: boolean;
  createdAt: Date;
  updatedAt: Date;
  orderItems: OrderItem[];
}
