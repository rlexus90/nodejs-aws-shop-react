import { Product } from "~/models/Product";

export type Cart = {
  id: string;
  user_id: string;
  created_at: Date | string;
  updated_at: Date | string;
  status: CartStatuses;
  items: CartItem[];
};

export type CartItem = {
  product: Product;
  count: number;
};

export enum CartStatuses {
  OPEN = "OPEN",
  STATUS = "ORDERED",
}
