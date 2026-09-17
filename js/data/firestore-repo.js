// ============================================================
// data/firestore-repo.js
// Acceso a datos real vía Firestore. Cada usuario tiene sus
// propias subcolecciones en users/{uid}/ingresos y
// users/{uid}/egresos — así las reglas de seguridad solo
// necesitan comparar el uid del path, sin depender de que cada
// query recuerde filtrar por dueño (ver firestore.rules).
//
// Expone la misma interfaz que data/demo-repo.js para que los
// módulos (dashboard/ingresos/egresos) no sepan ni les importe
// si están en modo demo o conectados a Firebase real.
// ============================================================

import { db } from "../firebase-config.js";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

function colRef(uid, name) {
  return collection(db, "users", uid, name);
}

function snapshotToRecords(snapshot) {
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function createFirestoreRepo(uid) {
  return {
    isDemo: false,

    subscribeIngresos(callback) {
      const q = query(colRef(uid, "ingresos"), orderBy("fechaPercepcion", "desc"));
      return onSnapshot(q, (snap) => callback(snapshotToRecords(snap)));
    },

    subscribeEgresos(callback) {
      const q = query(colRef(uid, "egresos"), orderBy("fechaVencimiento", "asc"));
      return onSnapshot(q, (snap) => callback(snapshotToRecords(snap)));
    },

    async addIngreso(data) {
      await addDoc(colRef(uid, "ingresos"), data);
    },
    async updateIngreso(id, data) {
      await updateDoc(doc(db, "users", uid, "ingresos", id), data);
    },
    async deleteIngreso(id) {
      await deleteDoc(doc(db, "users", uid, "ingresos", id));
    },

    async addEgreso(data) {
      await addDoc(colRef(uid, "egresos"), data);
    },
    async updateEgreso(id, data) {
      await updateDoc(doc(db, "users", uid, "egresos", id), data);
    },
    async deleteEgreso(id) {
      await deleteDoc(doc(db, "users", uid, "egresos", id));
    },
  };
}
