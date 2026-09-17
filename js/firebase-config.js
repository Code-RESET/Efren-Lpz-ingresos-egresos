// ============================================================
// firebase-config.js
// Reemplazar FIREBASE_CONFIG con las credenciales del proyecto
// Firebase de Medicar (Firebase Console → Configuración del
// proyecto → Tus apps → SDK config). Ver README.md para los pasos
// completos de creación del proyecto.
//
// Se deja embebido directo en el código (no solo en localStorage)
// porque en HD Crédit se detectó que localStorage se puede perder
// con actualizaciones del sistema operativo del teléfono.
//
// En modo demo (?demo=1) este archivo NO se usa: app.js carga el
// repo en memoria de js/data/demo-repo.js y Firebase nunca se
// inicializa, así que el demo funciona sin conexión ni proyecto
// real configurado.
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const FIREBASE_CONFIG = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxxxxxxxxxx",
};

const app = initializeApp(FIREBASE_CONFIG);

// Persistencia de almacenamiento local (evita que iOS/Android
// limpien datos en bajo almacenamiento).
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().catch(() => {});
}

export const auth = getAuth(app);
export const db = getFirestore(app);
