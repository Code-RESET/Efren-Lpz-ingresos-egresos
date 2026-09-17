// ============================================================
// utils/toast.js
// Notificaciones flotantes breves para confirmar acciones
// (guardado, error, eliminado...). Requiere <div id="toast-root">
// en index.html.
// ============================================================

export function showToast(message, type = "") {
  const root = document.getElementById("toast-root");
  if (!root) return;

  const el = document.createElement("div");
  el.className = `toast ${type ? `toast-${type}` : ""}`.trim();
  el.textContent = message;
  root.appendChild(el);

  setTimeout(() => {
    el.style.transition = "opacity 220ms ease, transform 220ms ease";
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    setTimeout(() => el.remove(), 220);
  }, 2600);
}
