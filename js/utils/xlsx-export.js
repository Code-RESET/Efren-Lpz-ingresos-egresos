// ============================================================
// utils/xlsx-export.js
// Respaldo directo en Excel: junta ingresos + egresos del repo
// activo y genera un .xlsx descargable con la
// misma estructura de hojas que la plantilla original de Excel del
// cliente ("Gastos del Mes", "Ingresos", "Balance"), para que sirva
// como respaldo real y sea familiar si algún día lo abre a mano.
//
// Usa SheetJS (window.XLSX) cargado por CDN en index.html — si no
// hay conexión y no cargó, se avisa con un toast en vez de fallar
// en silencio (mismo patrón que Chart.js en modules/dashboard.js).
// ============================================================

import { toDate, monthKey, monthLabel } from "./format.js";
import { showToast } from "./toast.js";

function snapshotOnce(subscribeFn) {
  return new Promise((resolve) => {
    let unsubscribe = null;
    let readyToStop = false;
    let resolved = false;

    const stop = () => {
      readyToStop = true;
      unsubscribe?.();
    };

    unsubscribe = subscribeFn((records) => {
      if (resolved) return;
      resolved = true;
      resolve(records);
      // Si subscribeFn llama a este callback de forma síncrona (antes de
      // que termine de asignar `unsubscribe` arriba), esperamos a que esa
      // asignación exista para no invocar undefined.
      if (unsubscribe) stop();
    });

    if (resolved && !readyToStop) stop();
  });
}

function buildEgresosSheet(egresos) {
  const rows = egresos.map((r) => ({
    Gasto: r.gasto || "",
    Categoría: r.categoria || "",
    Monto: Number(r.monto) || 0,
    "Día de vencimiento": r.diaVencimiento || "",
    "Fecha de vencimiento": toDate(r.fechaVencimiento),
    "Forma de pago": r.formaPago || "",
    Estado: r.estado || "Pendiente",
    Notas: r.notas || "",
  }));
  return window.XLSX.utils.json_to_sheet(rows);
}

function buildIngresosSheet(ingresos) {
  const rows = ingresos.map((r) => ({
    Concepto: r.concepto || "",
    Categoría: r.categoria || "",
    Monto: Number(r.monto) || 0,
    "Fecha de percepción": toDate(r.fechaPercepcion),
    "Forma de recepción": r.formaRecepcion || "",
    Notas: r.notas || "",
  }));
  return window.XLSX.utils.json_to_sheet(rows);
}

function buildBalanceSheet(ingresos, egresos) {
  const months = [...new Set([...ingresos.map((r) => monthKey(r.fechaPercepcion)), ...egresos.map((r) => monthKey(r.fechaVencimiento))])]
    .filter(Boolean)
    .sort();

  const rows = months.map((m) => {
    const ingresosMes = ingresos.filter((r) => monthKey(r.fechaPercepcion) === m);
    const egresosMes = egresos.filter((r) => monthKey(r.fechaVencimiento) === m);
    const totalIngresos = sum(ingresosMes);
    const totalGastos = sum(egresosMes);
    const pagado = sum(egresosMes.filter((r) => r.estado === "Pagado"));
    const pendiente = sum(egresosMes.filter((r) => r.estado !== "Pagado"));

    return {
      Mes: capitalize(monthLabel(m)),
      "Total ingresos": totalIngresos,
      "Total gastos": totalGastos,
      "Gastos pagados": pagado,
      "Gastos pendientes": pendiente,
      "Balance del mes": totalIngresos - totalGastos,
    };
  });

  return window.XLSX.utils.json_to_sheet(rows);
}

function sum(records) {
  return records.reduce((acc, r) => acc + (Number(r.monto) || 0), 0);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function downloadBackup(repo) {
  if (!window.XLSX) {
    showToast("No se pudo generar el Excel: necesitas conexión a internet para cargarlo.", "error");
    return;
  }

  try {
    const [ingresos, egresos] = await Promise.all([
      snapshotOnce(repo.subscribeIngresos),
      snapshotOnce(repo.subscribeEgresos),
    ]);

    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, buildIngresosSheet(ingresos), "Ingresos");
    window.XLSX.utils.book_append_sheet(workbook, buildEgresosSheet(egresos), "Gastos del Mes");
    window.XLSX.utils.book_append_sheet(workbook, buildBalanceSheet(ingresos, egresos), "Balance");

    const today = new Date().toISOString().slice(0, 10);
    window.XLSX.writeFile(workbook, `Medicar - Respaldo - ${today}.xlsx`);
    showToast("Respaldo descargado", "success");
  } catch (err) {
    showToast("No se pudo generar el respaldo. Intenta de nuevo.", "error");
  }
}
