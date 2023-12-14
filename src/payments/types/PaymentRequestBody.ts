import { Product } from './Product';
import { Order } from './Order';

export interface PaymentRequestBody {
  cartItems: Product[];
  order: Order;
  currency: string;
}
