// ============================================================
// state.js
// Estado compartido mínimo entre módulos: modo demo, mes activo
// del filtro y el repo de datos vigente (Firestore o memoria).
// Un pub/sub simple — sin librerías externas.
// ============================================================

import { currentMonthKey } from "./utils/format.js";

const listeners = new Set();

export const appState = {
  isDemoMode: new URLSearchParams(location.search).get("demo") === "1",
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
