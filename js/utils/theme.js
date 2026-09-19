// ============================================================
// utils/theme.js
// Botón de cambio de tema claro/oscuro. Por default la app sigue
// el sistema (prefers-color-scheme, ver css/tokens.css); al tocar
// el botón se fija una preferencia explícita en localStorage que
// gana sobre el sistema. El script inline en el <head> de
// index.html ya aplica esa preferencia ANTES del primer paint para
// evitar el parpadeo (FOUC).
// ============================================================

import { icon } from "./icons.js";

const THEME_KEY = "medicar-theme";

function currentTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function paintToggles(theme) {
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    const iconSlot = btn.querySelector(".theme-toggle-icon") || btn;
    iconSlot.innerHTML = icon(theme === "dark" ? "moon" : "sun");
    const label = btn.querySelector(".theme-toggle-label");
    if (label) label.textContent = theme === "dark" ? "Modo oscuro" : "Modo claro";
  });
}

function paintMetaThemeColor(theme) {
  const color = theme === "dark" ? "#000000" : "#f5f5f7";
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    meta.setAttribute("content", color);
  });
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Almacenamiento no disponible (privado/bloqueado): el cambio
    // sigue funcionando, solo no se recuerda entre sesiones.
  }
  paintToggles(theme);
  paintMetaThemeColor(theme);
  document.dispatchEvent(new CustomEvent("medicar:theme-change", { detail: { theme } }));
}

export function initThemeToggle() {
  const stored = localStorage.getItem(THEME_KEY);
  paintToggles(currentTheme());
  if (stored === "light" || stored === "dark") paintMetaThemeColor(stored);

  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      applyTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  });
}
