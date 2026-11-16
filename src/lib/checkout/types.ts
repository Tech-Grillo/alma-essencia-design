// Tipos compartilhados entre o checkout (navegador) e o servidor.

export type CheckoutItemInput = {
  slug: string;
  size: string | null;
  quantity: number;
};

export type CheckoutCustomer = {
  name: string;
  email: string;
  phone: string;
};

export type CheckoutDelivery =
  | { type: "pickup" }
  | { type: "delivery"; neighborhood: string; address: string };

export type CheckoutInput = {
  customer: CheckoutCustomer;
  delivery: CheckoutDelivery;
  items: CheckoutItemInput[];
};

export type CardData = {
  token: string;
  payment_method_id: string;
  issuer_id?: string;
  installments: number;
  payer: {
    email?: string;
    identification?: { type: string; number: string };
  };
};

export type OrderStatus = "pending" | "paid" | "rejected" | "cancelled" | "expired";

export type PixResult = {
  orderId: string;
  total: number;
  qrCode: string;
  qrCodeBase64: string;
  expiresAt: string;
};

export type CardResult = {
  orderId: string;
  status: OrderStatus;
  message: string;
};

export type OrderSummary = {
  id: string;
  status: OrderStatus;
  paymentMethod: "pix" | "card";
  total: number;
  createdAt: string;
};
