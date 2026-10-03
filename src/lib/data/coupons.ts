export interface Coupon {
  code: string;
  title: string;
  description: string;
}

/** Offers listed in the cart's "Coupons & offers" panel. */
export const coupons: Coupon[] = [
  {
    code: "FIRSTTIMEOFFER",
    title: "10% off your first order",
    description: "New to DPetals? Extra 10% off your first order.",
  },
];
