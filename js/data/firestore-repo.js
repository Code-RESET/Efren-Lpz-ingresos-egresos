// ============================================================
// data/firestore-repo.js
// Acceso a datos real vía Firestore. Cada usuario tiene sus
// propias subcolecciones en users/{uid}/ingresos y
// users/{uid}/egresos — así las reglas de seguridad solo
// necesitan comparar el uid del path, sin depender de que cada
// query recuerde filtrar por dueño (ver firestore.rules).
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
import { showToast } from "../utils/toast.js";

function colRef(uid, name) {
  return collection(db, "users", uid, name);
}

function snapshotToRecords(snapshot) {
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Sin un callback de error, onSnapshot falla en silencio (solo un log en
// consola que el usuario final nunca ve): la lista se queda vacía para
// siempre y se ve idéntica a "no tienes registros todavía". Con esto al
// menos se avisa que algo falló en vez de fingir que no hay datos.
function onSnapshotError(err) {
  console.error("Error de Firestore:", err);
  showToast("No se pudieron cargar tus datos. Revisa tu conexión.", "error");
}

export function createFirestoreRepo(uid) {
  return {
    isDemo: false,

    subscribeIngresos(callback) {
      const q = query(colRef(uid, "ingresos"), orderBy("fechaPercepcion", "desc"));
      return onSnapshot(q, (snap) => callback(snapshotToRecords(snap)), onSnapshotError);
    },

    subscribeEgresos(callback) {
      const q = query(colRef(uid, "egresos"), orderBy("fechaVencimiento", "asc"));
      return onSnapshot(q, (snap) => callback(snapshotToRecords(snap)), onSnapshotError);
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
