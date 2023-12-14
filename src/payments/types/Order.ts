import { Product } from './Product';

export interface Order {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  status: string;
  cartItems: Product[];
  created_at: string;
  updated_at: string;
}
