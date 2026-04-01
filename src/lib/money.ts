const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function dollarsToCents(amount: number) {
  return Math.round(amount * 100);
}

export function centsToDollars(amount: number) {
  return amount / 100;
}

export function formatUsdFromCents(amount: number) {
  return usdFormatter.format(centsToDollars(amount));
}
