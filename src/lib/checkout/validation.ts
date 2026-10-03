export interface AddressValues {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pin: string;
  phone: string;
}

export interface CheckoutValues {
  contact: string;
  emailOffers: boolean;
  country: "India";
  shipping: AddressValues;
  saveInfo: boolean;
  textOffers: boolean;
  payment: "razorpay" | "phonepe";
  billingSame: boolean;
  billing: AddressValues;
}

export type AddressErrors = Partial<Record<keyof AddressValues, string>>;

export interface CheckoutErrors {
  contact?: string;
  shipping: AddressErrors;
  billing: AddressErrors;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const digitsOnly = (value: string) => value.replace(/\D/g, "");

export function validateContact(value: string) {
  const trimmed = value.trim();
  if (EMAIL_PATTERN.test(trimmed)) return undefined;
  if (digitsOnly(trimmed).length >= 10 && !/[a-z@]/i.test(trimmed)) return undefined;
  return "Enter an email or phone number";
}

export function validateAddress(values: AddressValues, options?: { requirePhone?: boolean }): AddressErrors {
  const errors: AddressErrors = {};

  if (!values.lastName.trim()) errors.lastName = "Enter a last name";
  if (!values.address1.trim()) errors.address1 = "Enter an address";
  if (!values.city.trim()) errors.city = "Enter a city";
  if (!/^\d{6}$/.test(values.pin.trim())) errors.pin = "Enter a ZIP / postal code";
  if (options?.requirePhone !== false && digitsOnly(values.phone).length < 10) {
    errors.phone = "Enter a phone number";
  }

  return errors;
}

export function validateCheckout(values: CheckoutValues): CheckoutErrors {
  return {
    contact: validateContact(values.contact),
    shipping: validateAddress(values.shipping),
    billing: values.billingSame ? {} : validateAddress(values.billing, { requirePhone: false }),
  };
}

export function hasErrors(errors: CheckoutErrors) {
  return (
    Boolean(errors.contact) ||
    Object.keys(errors.shipping).length > 0 ||
    Object.keys(errors.billing).length > 0
  );
}

export const EMPTY_ADDRESS: AddressValues = {
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  state: "Gujarat",
  pin: "",
  phone: "",
};

export const EMPTY_CHECKOUT_VALUES: CheckoutValues = {
  contact: "",
  emailOffers: false,
  country: "India",
  shipping: EMPTY_ADDRESS,
  saveInfo: false,
  textOffers: false,
  payment: "razorpay",
  billingSame: true,
  billing: EMPTY_ADDRESS,
};
