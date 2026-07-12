export function formatNumber(n: number | null | undefined): string {
  if (n == null) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(".", ",") + "jt";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".", ",") + "rb";
  return String(n);
}
