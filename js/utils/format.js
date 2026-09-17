// ============================================================
// utils/format.js
// Helpers de formato compartidos por todos los módulos: moneda,
// fechas y llaves de mes (YYYY-MM) usadas para agrupar/filtrar.
// ============================================================

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

export function formatCurrency(amount) {
  return currencyFormatter.format(Number(amount) || 0);
}

export function formatDate(date) {
  const d = toDate(date);
  if (!d) return "";
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateShort(date) {
  const d = toDate(date);
  if (!d) return "";
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate(); // Firestore Timestamp
  return new Date(value);
}

export function monthKey(date) {
  const d = toDate(date);
  if (!d) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(monthKeyStr) {
  const [year, month] = monthKeyStr.split("-").map(Number);
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
}

export function shiftMonthKey(monthKeyStr, delta) {
  const [year, month] = monthKeyStr.split("-").map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return monthKey(d);
}

export function currentMonthKey() {
  return monthKey(new Date());
}

export function daysUntil(date) {
  const d = toDate(date);
  if (!d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}
