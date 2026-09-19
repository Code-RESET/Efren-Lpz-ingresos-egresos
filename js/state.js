// ============================================================
// state.js
// Estado compartido mínimo entre módulos: mes activo del filtro y
// el repo de datos vigente. Un pub/sub simple — sin librerías
// externas.
// ============================================================

import { currentMonthKey } from "./utils/format.js";

const listeners = new Set();

export const appState = {
  user: null,
  repo: null,
  activeMonth: currentMonthKey(),
};

export function setActiveMonth(monthKeyStr) {
  appState.activeMonth = monthKeyStr;
  notify();
}

export function onStateChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach((fn) => fn(appState));
}
