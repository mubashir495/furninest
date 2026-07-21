export interface ShippingAddress {
  _id: string;
  user?: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  created_date: string;
  updated_date: string;
}

// Used when creating/updating an address, or supplying a new one at checkout
export type ShippingAddressInput = Omit<
  ShippingAddress,
  '_id' | 'user' | 'created_date' | 'updated_date' | 'isDefault'
> & { isDefault?: boolean };
