// ============================================================
// firebase-config.js
// Proyecto real de Medicar en Firebase (medicarappv1).
// Ver README.md para los pasos completos de creación del proyecto.
//
// Se deja embebido directo en el código (no solo en localStorage)
// porque en HD Crédit se detectó que localStorage se puede perder
// con actualizaciones del sistema operativo del teléfono.
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAH-5AwoYaIH-sYSrdoQWndNM3X8DfM2So",
  authDomain: "medicarappv1.firebaseapp.com",
  projectId: "medicarappv1",
  storageBucket: "medicarappv1.firebasestorage.app",
  messagingSenderId: "204928044316",
  appId: "1:204928044316:web:2bcc4adf5a671f9ae93ed9",
};

const app = initializeApp(FIREBASE_CONFIG);

// Persistencia de almacenamiento local (evita que iOS/Android
// limpien datos en bajo almacenamiento).
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().catch(() => {});
}

export const auth = getAuth(app);
export const db = getFirestore(app);
