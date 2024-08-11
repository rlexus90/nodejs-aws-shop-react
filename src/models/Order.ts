/* eslint-disable @typescript-eslint/ban-types */
import * as Yup from "yup";
import { OrderStatus } from "~/constants/order";

export const AddressSchema = Yup.object({
  firstName: Yup.string().required().default(""),
  lastName: Yup.string().required().default(""),
  address: Yup.string().required().default(""),
  comment: Yup.string().default(""),
}).defined();

export type Address = Yup.InferType<typeof AddressSchema>;

export const OrderItemSchema = Yup.object({
  productId: Yup.string().required(),
  count: Yup.number().integer().positive().required(),
}).defined();

export type OrderItem = Yup.InferType<typeof OrderItemSchema>;

export const statusHistorySchema = Yup.object({
  status: Yup.mixed<OrderStatus>().oneOf(Object.values(OrderStatus)).required(),
  timestamp: Yup.number(),
  comment: Yup.string(),
});

export type statusHistory = Yup.InferType<typeof statusHistorySchema>;

export const OrderSchema = Yup.object({
  id: Yup.string().required(),
  items: Yup.array().of(OrderItemSchema).defined(),
  address: AddressSchema.required(),
  statusHistory: statusHistorySchema,
}).defined();

export type Order = Yup.InferType<typeof OrderSchema>;

export type OrderReq = {
  id: string;
  userId: string;
  cartId: string;
  address: {
    address: string;
    comment: string;
    firstName: string;
    lastName: string;
  };
  items: OrderItem[];
  payment?: {};
  statusHistory: { status: string; timestamp?: number; comment?: string };
  total: number;
};
