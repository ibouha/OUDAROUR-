import Decimal from "decimal.js";

const SMALL = [
  "zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf",
  "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf",
];

const TENS: Record<number, string> = {
  20: "vingt", 30: "trente", 40: "quarante", 50: "cinquante", 60: "soixante",
};

function underHundred(value: number): string {
  if (value < 20) return SMALL[value];
  if (value < 70) {
    const ten = Math.floor(value / 10) * 10;
    const unit = value % 10;
    if (!unit) return TENS[ten];
    return `${TENS[ten]}${unit === 1 ? " et un" : `-${SMALL[unit]}`}`;
  }
  if (value < 80) {
    const rest = value - 60;
    return `soixante${rest === 11 ? " et " : "-"}${underHundred(rest)}`;
  }
  const rest = value - 80;
  if (!rest) return "quatre-vingts";
  return `quatre-vingt-${underHundred(rest)}`;
}

function underThousand(value: number): string {
  if (value < 100) return underHundred(value);
  const hundreds = Math.floor(value / 100);
  const rest = value % 100;
  const prefix = hundreds === 1 ? "cent" : `${SMALL[hundreds]} cent`;
  if (!rest) return hundreds > 1 ? `${prefix}s` : prefix;
  return `${prefix} ${underHundred(rest)}`;
}

function integerToFrench(value: number): string {
  if (value === 0) return SMALL[0];
  const groups = [
    { size: 1_000_000_000, singular: "milliard", plural: "milliards" },
    { size: 1_000_000, singular: "million", plural: "millions" },
    { size: 1_000, singular: "mille", plural: "mille" },
  ];
  let remaining = value;
  const words: string[] = [];
  for (const group of groups) {
    const count = Math.floor(remaining / group.size);
    if (!count) continue;
    if (group.size === 1_000 && count === 1) words.push("mille");
    else words.push(`${integerToFrench(count)} ${count > 1 ? group.plural : group.singular}`);
    remaining %= group.size;
  }
  if (remaining) words.push(underThousand(remaining));
  return words.join(" ");
}

export function moneyToFrenchWords(value: string | number, currency = "MAD"): string {
  const rounded = new Decimal(value || 0).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const whole = rounded.floor().toNumber();
  const cents = rounded.minus(whole).mul(100).round().toNumber();
  const wholeWords = integerToFrench(whole);
  const centsWords = integerToFrench(cents);
  const unit = currency.toUpperCase() === "MAD" ? (whole === 1 ? "dirham" : "dirhams") : currency.toUpperCase();
  const centime = cents === 1 ? "centime" : "centimes";
  return `${wholeWords.charAt(0).toUpperCase()}${wholeWords.slice(1)} ${unit} et ${centsWords} ${centime}`;
}
