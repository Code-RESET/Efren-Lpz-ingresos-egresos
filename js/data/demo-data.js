// ============================================================
// data/demo-data.js
// Datos de muestra para el modo demo (?demo=1), tomados TAL CUAL
// de la plantilla real de Excel que envió Efrén López (hoja
// "Gastos del Mes" + hoja "Ingresos", septiembre 2026). No se
// inventan meses ni montos adicionales: es el mes real de
// referencia del cliente. Si Angel quiere un demo con más meses
// de historial para lucir la comparativa, solo hay que agregar
// más objetos aquí con el mismo formato.
// ============================================================

function d(day) {
  return new Date(2026, 8, day); // septiembre 2026 (mes 8 = índice 0)
}

export const DEMO_EGRESOS = [
  { id: "demo-e1", gasto: "Hipoteca casa (Santander)", categoria: "Vivienda", monto: 100, diaVencimiento: 3, fechaVencimiento: d(3), formaPago: "Domiciliado", estado: "Pagado", notas: "" },
  { id: "demo-e2", gasto: "Internet Consultorio (Medicar)", categoria: "Otro", monto: 100, diaVencimiento: 5, fechaVencimiento: d(5), formaPago: "Efectivo", estado: "Pagado", notas: "" },
  { id: "demo-e3", gasto: "Sueldo Limpieza Medicar", categoria: "Otro", monto: 100, diaVencimiento: 7, fechaVencimiento: d(7), formaPago: "Transferencia", estado: "Pagado", notas: "" },
  { id: "demo-e4", gasto: "Internet Casa (Starlink)", categoria: "Vivienda", monto: 100, diaVencimiento: 8, fechaVencimiento: d(8), formaPago: "Transferencia", estado: "Pagado", notas: "" },
  { id: "demo-e5", gasto: "Ecogas", categoria: "Vivienda", monto: 100, diaVencimiento: 10, fechaVencimiento: d(10), formaPago: "Efectivo", estado: "Pagado", notas: "" },
  { id: "demo-e6", gasto: "Internet (Netwey)", categoria: "Vivienda", monto: 50, diaVencimiento: 10, fechaVencimiento: d(10), formaPago: "Transferencia", estado: "Pagado", notas: "" },
  { id: "demo-e7", gasto: "Sueldo Limpieza Medicar", categoria: "Otro", monto: 20, diaVencimiento: 13, fechaVencimiento: d(13), formaPago: "Transferencia", estado: "Pagado", notas: "" },
  { id: "demo-e8", gasto: "Tarjeta Crédito (BBVA)", categoria: "Deudas", monto: 23, diaVencimiento: 14, fechaVencimiento: d(14), formaPago: "Tarjeta", estado: "Pagado", notas: "" },
  { id: "demo-e9", gasto: "Infonavit Casa", categoria: "Vivienda", monto: 46, diaVencimiento: 15, fechaVencimiento: d(15), formaPago: "Domiciliado", estado: "Pagado", notas: "" },
  { id: "demo-e10", gasto: "Crédito Fovissste", categoria: "Vivienda", monto: 1, diaVencimiento: 15, fechaVencimiento: d(15), formaPago: "Transferencia", estado: "Pagado", notas: "" },
  { id: "demo-e11", gasto: "Renta Consultorio (Medicar)", categoria: "Otro", monto: 5, diaVencimiento: 15, fechaVencimiento: d(15), formaPago: "Transferencia", estado: "Pagado", notas: "" },
  { id: "demo-e12", gasto: "Infonavit Casa", categoria: "Vivienda", monto: 4, diaVencimiento: 30, fechaVencimiento: d(30), formaPago: "Domiciliado", estado: "Pendiente", notas: "" },
  { id: "demo-e13", gasto: "Tarjeta Crédito (Santander)", categoria: "Deudas", monto: 190, diaVencimiento: 30, fechaVencimiento: d(30), formaPago: "Tarjeta", estado: "Pagado", notas: "" },
  { id: "demo-e14", gasto: "Crédito Fovissste", categoria: "Vivienda", monto: 2, diaVencimiento: 30, fechaVencimiento: d(30), formaPago: "Transferencia", estado: "Pendiente", notas: "" },
  { id: "demo-e15", gasto: "Sueldo Enfermero", categoria: "Otro", monto: 2, diaVencimiento: 30, fechaVencimiento: d(30), formaPago: "Efectivo", estado: "Pendiente", notas: "" },
];

export const DEMO_INGRESOS = [
  { id: "demo-i1", concepto: "Honorarios consulta médica", categoria: "Honorarios", monto: 15000, fechaPercepcion: d(15), formaRecepcion: "Efectivo", notas: "" },
  { id: "demo-i2", concepto: "Nómina IMSS", categoria: "Sueldo", monto: 2, fechaPercepcion: d(9), formaRecepcion: "Depósito", notas: "" },
  { id: "demo-i3", concepto: "Nómina ISSSTE", categoria: "Sueldo", monto: 2, fechaPercepcion: d(10), formaRecepcion: "Depósito", notas: "" },
  { id: "demo-i4", concepto: "Pago Medicar", categoria: "Honorarios", monto: 2, fechaPercepcion: d(1), formaRecepcion: "Depósito", notas: "" },
  { id: "demo-i5", concepto: "Pago Medicar", categoria: "Honorarios", monto: 2, fechaPercepcion: d(2), formaRecepcion: "Depósito", notas: "" },
  { id: "demo-i6", concepto: "Pago Medicar", categoria: "Honorarios", monto: 2, fechaPercepcion: d(4), formaRecepcion: "Depósito", notas: "" },
  { id: "demo-i7", concepto: "Pago Medicar", categoria: "Honorarios", monto: 2, fechaPercepcion: d(7), formaRecepcion: "Depósito", notas: "" },
  { id: "demo-i8", concepto: "Pago Medicar", categoria: "Honorarios", monto: 2, fechaPercepcion: d(8), formaRecepcion: "Depósito", notas: "" },
  { id: "demo-i9", concepto: "Pago Medicar", categoria: "Honorarios", monto: 2, fechaPercepcion: d(10), formaRecepcion: "Depósito", notas: "" },
  { id: "demo-i10", concepto: "Pago Medicar", categoria: "Honorarios", monto: 2, fechaPercepcion: d(11), formaRecepcion: "Depósito", notas: "" },
];
