export interface AccountSession {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface SavedAddress {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pin: string;
  phone: string;
  isDefault: boolean;
}

/** A postal address as captured at checkout. */
export type OrderAddress = Omit<SavedAddress, "id" | "isDefault">;

export interface OrderLine {
  title: string;
  variantTitle: string | null;
  quantity: number;
  image: string;
  unitPrice: number;
}

export interface Order {
  id: string;
  number: string;
  placedAt: string;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  currency: string;
  lines: OrderLine[];
  /** Address the confirmation email was sent to. */
  email: string;
  /** Items at selling price, before discounts. */
  subtotal: number;
  discount: number;
  shippingTotal: number;
  /** Amount charged: subtotal - discount + shippingTotal. */
  total: number;
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  shippingMethod: string;
  paymentMethod: string;
}
