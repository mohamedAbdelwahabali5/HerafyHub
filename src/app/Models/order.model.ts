export type OrderStatus = 'In-Progress' | 'delivered' | 'cancelled';

export interface OrderProduct {
  product: string;
  name: string;
  quantity: number;
}
export interface ShippingAddress {
  name?: string;
  address?: string;
  phone?: string;
}

export interface Order {
  _id: string;
  user: string;
  products: OrderProduct[];
  shippingAddress?: ShippingAddress;
  totalPrice: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  deliveredAt?: Date | null;
  cancelledAt?: Date | null;
  IsCancelled: boolean;
}
