// ============================================================
// data/demo-repo.js
// Repo en memoria para el modo demo (?demo=1): misma interfaz que
// data/firestore-repo.js pero sin tocar Firebase. Los cambios
// (alta/edición/borrado) viven solo mientras dura la sesión del
// navegador — al recargar, vuelve a los datos de demo-data.js.
// ============================================================

import { DEMO_EGRESOS, DEMO_INGRESOS } from "./demo-data.js";

let nextId = 1000;
const uid = () => `demo-new-${nextId++}`;

export function createDemoRepo() {
  const ingresos = DEMO_INGRESOS.map((r) => ({ ...r }));
  const egresos = DEMO_EGRESOS.map((r) => ({ ...r }));
  const ingresoListeners = new Set();
  const egresoListeners = new Set();

  function sortIngresos() {
    ingresos.sort((a, b) => b.fechaPercepcion - a.fechaPercepcion);
  }
  function sortEgresos() {
    egresos.sort((a, b) => a.fechaVencimiento - b.fechaVencimiento);
  }
  sortIngresos();
  sortEgresos();

  function emitIngresos() {
    ingresoListeners.forEach((cb) => cb([...ingresos]));
  }
  function emitEgresos() {
    egresoListeners.forEach((cb) => cb([...egresos]));
  }

  return {
    isDemo: true,

    subscribeIngresos(callback) {
      ingresoListeners.add(callback);
      callback([...ingresos]);
      return () => ingresoListeners.delete(callback);
    },
    subscribeEgresos(callback) {
      egresoListeners.add(callback);
      callback([...egresos]);
      return () => egresoListeners.delete(callback);
    },

    async addIngreso(data) {
      ingresos.push({ id: uid(), ...data });
      sortIngresos();
      emitIngresos();
    },
    async updateIngreso(id, data) {
      const i = ingresos.findIndex((r) => r.id === id);
      if (i !== -1) ingresos[i] = { ...ingresos[i], ...data };
      sortIngresos();
      emitIngresos();
    },
    async deleteIngreso(id) {
      const i = ingresos.findIndex((r) => r.id === id);
      if (i !== -1) ingresos.splice(i, 1);
      emitIngresos();
    },

    async addEgreso(data) {
      egresos.push({ id: uid(), ...data });
      sortEgresos();
      emitEgresos();
    },
    async updateEgreso(id, data) {
      const i = egresos.findIndex((r) => r.id === id);
      if (i !== -1) egresos[i] = { ...egresos[i], ...data };
      sortEgresos();
      emitEgresos();
    },
    async deleteEgreso(id) {
      const i = egresos.findIndex((r) => r.id === id);
      if (i !== -1) egresos.splice(i, 1);
      emitEgresos();
    },
  };
}
