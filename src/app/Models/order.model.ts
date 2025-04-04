export type OrderStatus = 
  | 'In-Progress' 
  | 'Confirmed' 
  | 'Processing' 
  | 'Shipping' 
  | 'Out for Delivery' 
  | 'Delivered' 
  | 'Cancelled';

export interface ShippingAddress {
  name: string;
  address: string;
  phone: string;
}

export interface Order {
  _id?: string;
  user?: string;
  shippingAddress: ShippingAddress;
  totalPrice: number;
  status?: OrderStatus;
  paymentMethod: 'Credit Card' | 'Cash on Delivery';
  IsCancelled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  orderItems?: OrderItem[];
}

export interface OrderItem {
  _id?: string;
  order?: string;
  product: { _id: string; title: string };
  quantity: number;
  price: number;
}
