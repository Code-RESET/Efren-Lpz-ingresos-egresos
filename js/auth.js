// ============================================================
// auth.js
// Únicamente autenticación: iniciar sesión, cerrar sesión y
// escuchar cambios de sesión. No decide qué pantalla mostrarse
// (eso lo hace app.js) para no mezclar lógica de negocio aquí.
// ============================================================

import { auth } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

// Traduce códigos de error de Firebase a mensajes claros para el
// usuario final, sin exponer detalles técnicos.
export function translateAuthError(code) {
  const mapa = {
    "auth/invalid-email": "Ese correo no es válido.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/user-not-found": "Correo o contraseña incorrectos.",
    "auth/wrong-password": "Correo o contraseña incorrectos.",
    "auth/too-many-requests": "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
    "auth/network-request-failed": "Sin conexión a internet. Revisa tu red e inténtalo de nuevo.",
    "auth/user-disabled": "Esta cuenta está deshabilitada.",
  };
  return mapa[code] || "No se pudo iniciar sesión. Verifica tus datos e inténtalo de nuevo.";
}
