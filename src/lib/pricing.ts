import Decimal from "decimal.js";

export interface PricingInput {
  basePriceCNY: string | number;
  exchangeRateCnyMga: string | number;
  serviceFeePct: string | number; // e.g. 15 = 15%
  weightKg?: string | number;
  intlShippingRatePerKg?: string | number; // MGA per kg
}

export interface FeeBreakdown {
  productCost: Decimal;
  serviceFee: Decimal;
  intlShipping: Decimal;
  customsFee: Decimal;
  miscFee: Decimal;
  total: Decimal;
  depositAmount: Decimal;
}

/**
 * Calculate the suggested MGA selling price from CNY cost.
 * priceMGA = basePriceCNY * exchangeRate * (1 + serviceFeePct/100)
 */
export function calculateSuggestedPriceMGA(input: PricingInput): Decimal {
  const cost = new Decimal(input.basePriceCNY);
  const rate = new Decimal(input.exchangeRateCnyMga);
  const feePct = new Decimal(input.serviceFeePct).div(100);

  return cost.mul(rate).mul(new Decimal(1).add(feePct)).toDecimalPlaces(0);
}

/**
 * Build a fee breakdown for a new agent order quote.
 */
export function buildFeeBreakdown(
  productCostMGA: string | number,
  options: {
    serviceFeePct: string | number;
    weightKg?: string | number;
    intlShippingRatePerKg?: string | number;
    customsFee?: string | number;
    miscFee?: string | number;
    depositPct: string | number; // e.g. 30 = 30%
  }
): FeeBreakdown {
  const productCost = new Decimal(productCostMGA);
  const serviceFee = productCost
    .mul(new Decimal(options.serviceFeePct).div(100))
    .toDecimalPlaces(0);

  const intlShipping =
    options.weightKg && options.intlShippingRatePerKg
      ? new Decimal(options.weightKg)
          .mul(new Decimal(options.intlShippingRatePerKg))
          .toDecimalPlaces(0)
      : new Decimal(0);

  const customsFee = new Decimal(options.customsFee ?? 0).toDecimalPlaces(0);
  const miscFee = new Decimal(options.miscFee ?? 0).toDecimalPlaces(0);

  const total = productCost
    .add(serviceFee)
    .add(intlShipping)
    .add(customsFee)
    .add(miscFee);

  const depositAmount = total
    .mul(new Decimal(options.depositPct).div(100))
    .toDecimalPlaces(0);

  return {
    productCost,
    serviceFee,
    intlShipping,
    customsFee,
    miscFee,
    total,
    depositAmount,
  };
}

/**
 * Calculate balance due = total - deposit already paid.
 */
export function calculateBalance(
  total: string | number,
  depositPaid: string | number
): Decimal {
  return new Decimal(total).sub(new Decimal(depositPaid)).toDecimalPlaces(0);
}

/**
 * Format MGA amount for display (e.g. "1 234 567 Ar")
 */
export function formatMGA(amount: string | number | Decimal): string {
  const num = new Decimal(amount).toNumber();
  return (
    new Intl.NumberFormat("fr-MG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num) + " Ar"
  );
}

/**
 * Format CNY amount for display (e.g. "¥1,234.56")
 */
export function formatCNY(amount: string | number | Decimal): string {
  const num = new Decimal(amount).toNumber();
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
  }).format(num);
}
