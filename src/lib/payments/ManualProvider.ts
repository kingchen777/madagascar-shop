/**
 * Manual / Bank Transfer payment provider.
 * Customer uploads proof of payment; admin manually confirms.
 * This is the fallback for WeChat Pay / Alipay / cash transfers.
 */
import type {
  PaymentProvider,
  CreatePaymentParams,
  PaymentSession,
  WebhookPayload,
  PaymentStatus,
} from "./Provider";

export class ManualPaymentProvider implements PaymentProvider {
  readonly name = "BANK_TRANSFER";

  async createPayment(params: CreatePaymentParams): Promise<PaymentSession> {
    // No external API call — just return a reference for tracking
    return {
      providerRef: `MANUAL-${params.orderNo}-${Date.now()}`,
    };
  }

  async verifyWebhook(_payload: WebhookPayload): Promise<PaymentStatus> {
    throw new Error("Manual provider does not support webhooks");
  }

  async getStatus(providerRef: string): Promise<PaymentStatus> {
    // Manual provider status is managed entirely in the database
    return {
      providerRef,
      status: "PENDING",
      amount: "0",
      currency: "MGA",
    };
  }
}
