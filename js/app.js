// ============================================================
// app.js
// Punto de entrada: decide qué pantalla mostrar (landing, login
// o app-shell), maneja el formulario de login con validación en
// vivo y logout.
//
// auth.js y data/firestore-repo.js (y con ellos el SDK de Firebase
// vía CDN) se importan de forma DINÁMICA, solo cuando hacen falta
// (al enviar el login, o al detectar sesión activa), para no
// bloquear la carga inicial de la landing con el SDK de Firebase.
// ============================================================

import { icon } from "./utils/icons.js";
import { initRouter, stopRouter } from "./router.js";
import { appState } from "./state.js";
import { downloadBackup } from "./utils/xlsx-export.js";
import { initThemeToggle } from "./utils/theme.js";

let authModPromise = null;
function loadAuth() {
  if (!authModPromise) authModPromise = import("./auth.js");
  return authModPromise;
}

// Reemplaza los <span data-icon="..."> / <div data-icon="..."> por su SVG.
document.querySelectorAll("[data-icon]").forEach((el) => {
  el.innerHTML = icon(el.dataset.icon);
});

initThemeToggle();

const screens = {
  landing: document.getElementById("landing-screen"),
  login: document.getElementById("login-screen"),
  app: document.getElementById("app-shell"),
};

function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    el.classList.toggle("hidden-screen", key !== name);
  });
}

// ---------- Login: validación en vivo ----------
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("login-email");
const passwordInput = document.getElementById("login-password");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const loginBtn = document.getElementById("login-btn");
const loginAlert = document.getElementById("login-alert");

function isEmailValid(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateLoginForm() {
  const emailValue = emailInput.value.trim();
  const passwordValue = passwordInput.value;
  const emailOk = isEmailValid(emailValue);
  const passOk = passwordValue.length >= 6;

  emailError.hidden = emailOk || emailValue.length === 0;
  emailInput.classList.toggle("invalid", !emailOk && emailValue.length > 0);
  emailError.textContent = "Escribe un correo válido.";

  passwordError.hidden = passOk || passwordValue.length === 0;
  passwordInput.classList.toggle("invalid", !passOk && passwordValue.length > 0);
  passwordError.textContent = "Mínimo 6 caracteres.";

  loginBtn.disabled = !(emailOk && passOk);
  return emailOk && passOk;
}

function hideLoginAlert() {
  loginAlert.hidden = true;
  loginAlert.textContent = "";
}

function showLoginAlert(message) {
  loginAlert.textContent = message;
  loginAlert.hidden = false;
}

emailInput?.addEventListener("input", validateLoginForm);
passwordInput?.addEventListener("input", validateLoginForm);

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validateLoginForm()) return;

  hideLoginAlert();
  loginBtn.disabled = true;
  const originalLabel = loginBtn.textContent;
  loginBtn.innerHTML = '<span class="spinner"></span>';

  try {
    const { login } = await loadAuth();
    await login(emailInput.value.trim(), passwordInput.value);
    // watchAuthState() se encarga de mostrar el app-shell.
  } catch (err) {
    const { translateAuthError } = await loadAuth();
    showLoginAlert(translateAuthError(err.code));
  } finally {
    loginBtn.textContent = originalLabel;
    validateLoginForm();
  }
});

document.getElementById("landing-login-btn")?.addEventListener("click", () => showScreen("login"));
document.getElementById("landing-login-btn-2")?.addEventListener("click", () => showScreen("login"));
document.getElementById("login-back")?.addEventListener("click", (e) => {
  e.preventDefault();
  hideLoginAlert();
  loginForm.reset();
  validateLoginForm();
  showScreen("landing");
});

// ---------- Logout ----------
async function handleLogout() {
  const { logout } = await loadAuth();
  await logout();
}
document.getElementById("logout-btn-sidebar")?.addEventListener("click", handleLogout);
document.getElementById("logout-btn-header")?.addEventListener("click", handleLogout);

// ---------- Respaldo en Excel ----------
function handleBackup() {
  if (appState.repo) downloadBackup(appState.repo);
}
document.getElementById("backup-btn-sidebar")?.addEventListener("click", handleBackup);
document.getElementById("backup-btn-header")?.addEventListener("click", handleBackup);

// ---------- Identidad del usuario en el sidebar ----------
function paintUser(user) {
  const email = user?.email || "";
  document.getElementById("user-email-sidebar").textContent = email;
  document.getElementById("user-avatar").textContent = email.charAt(0).toUpperCase() || "?";
}

// ---------- Arranque de la app autenticada ----------
function enterApp(user, repo) {
  appState.user = user;
  appState.repo = repo;
  paintUser(user);
  showScreen("app");
  initRouter({ user, repo });
}

// ---------- Solo celular ----------
// El <html data-device-ok> ya lo puso el script inline de index.html
// antes del primer paint (evita el parpadeo). Si está bloqueado, ni
// siquiera cargamos Firebase — no hace falta en una pantalla de aviso.
function isBlockedByDevice() {
  return document.documentElement.dataset.deviceOk === "0";
}

if (!isBlockedByDevice()) {
  loadAuth()
    .then(({ watchAuthState }) => {
      watchAuthState((user) => {
        if (user) {
          import("./data/firestore-repo.js").then(({ createFirestoreRepo }) => {
            enterApp(user, createFirestoreRepo(user.uid));
          });
        } else {
          stopRouter();
          appState.user = null;
          appState.repo = null;
          showScreen("landing");
        }
      });
    })
    .catch((err) => {
      console.error("No se pudo cargar Firebase:", err);
      showScreen("landing");
    });
}

// Recalcula si cambia el tamaño de ventana (ej. alguien prueba
// redimensionando en escritorio). Recargar es más simple y seguro
// que tratar de arrancar/desarmar el flujo de auth a medio camino.
let deviceGateBlockedAtLoad = isBlockedByDevice();
window.addEventListener("resize", () => {
  const small = Math.min(window.innerWidth, window.innerHeight);
  const touch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  const blockedNow = !(touch && small <= 480);
  if (blockedNow !== deviceGateBlockedAtLoad) location.reload();
});
