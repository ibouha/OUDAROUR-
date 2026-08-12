import Decimal from "decimal.js";

Decimal.set({ precision: 24, rounding: Decimal.ROUND_HALF_UP });

export type CalculableItem = {
  quantity: string | number;
  unitPriceHt: string | number;
  discountRate: string | number;
  vatRate: string | number;
};

export function calculateLine(item: CalculableItem) {
  const quantity = new Decimal(item.quantity || 0);
  const price = new Decimal(item.unitPriceHt || 0);
  const gross = quantity.mul(price);
  const discount = gross.mul(new Decimal(item.discountRate || 0)).div(100);
  const ht = gross.minus(discount);
  const vat = ht.mul(new Decimal(item.vatRate || 0)).div(100);
  return {
    grossHt: gross.toDecimalPlaces(2).toFixed(2),
    discount: discount.toDecimalPlaces(2).toFixed(2),
    totalHt: ht.toDecimalPlaces(2).toFixed(2),
    vat: vat.toDecimalPlaces(2).toFixed(2),
    totalTtc: ht.plus(vat).toDecimalPlaces(2).toFixed(2),
  };
}

export function persistedTotals(items: CalculableItem[]) {
  const initial = { subtotalHt: new Decimal(0), discountTotal: new Decimal(0), totalHt: new Decimal(0), totalVat: new Decimal(0), totalTtc: new Decimal(0) };
  const totals = items.reduce((sum, item) => {
    const line = calculateLine(item);
    sum.subtotalHt = sum.subtotalHt.plus(line.grossHt);
    sum.discountTotal = sum.discountTotal.plus(line.discount);
    sum.totalHt = sum.totalHt.plus(line.totalHt);
    sum.totalVat = sum.totalVat.plus(line.vat);
    sum.totalTtc = sum.totalTtc.plus(line.totalTtc);
    return sum;
  }, initial);
  return {
    subtotalHt: totals.subtotalHt.toDecimalPlaces(2).toFixed(2),
    discountTotal: totals.discountTotal.toDecimalPlaces(2).toFixed(2),
    totalHt: totals.totalHt.toDecimalPlaces(2).toFixed(2),
    totalVat: totals.totalVat.toDecimalPlaces(2).toFixed(2),
    totalTtc: totals.totalTtc.toDecimalPlaces(2).toFixed(2),
  };
}

export function formatMoney(value: string | number, currency = "MAD") {
  return `${new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0))} ${currency}`;
}
