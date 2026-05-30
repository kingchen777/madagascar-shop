export type PaymentCurrency = "MGA" | "USD" | "EUR" | "CNY";

export interface CreatePaymentParams {
  orderId: string;
  orderNo: string;
  amount: string; // string to avoid float precision
  currency: PaymentCurrency;
  description: string;
  customerPhone?: string;
  customerEmail?: string;
  returnUrl: string;
  webhookUrl: string;
  metadata?: Record<string, string>;
}

export interface PaymentSession {
  providerRef: string;
  redirectUrl?: string; // if provider requires redirect
  expiresAt?: Date;
}

export interface WebhookPayload {
  rawBody: string;
  headers: Record<string, string>;
}

export interface PaymentStatus {
  providerRef: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  amount: string;
  currency: string;
  paidAt?: Date;
}

/**
 * Unified payment provider interface.
 * Each provider (Voaray, Stripe, mock) implements this.
 */
export interface PaymentProvider {
  readonly name: string;

  /** Create a payment session and return redirect URL or reference */
  createPayment(params: CreatePaymentParams): Promise<PaymentSession>;

  /** Verify webhook signature and parse event */
  verifyWebhook(payload: WebhookPayload): Promise<PaymentStatus>;

  /** Poll payment status (for providers without webhooks) */
  getStatus(providerRef: string): Promise<PaymentStatus>;
}
