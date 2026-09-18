// ============================================================
// router.js
// Router simple por hash (#/ruta). No recarga la página.
//
// Para agregar un módulo nuevo:
//   1. Copiar js/modules/dashboard.js y renombrar.
//   2. Escribir su render(container, ctx) -> función de limpieza opcional.
//   3. Registrarlo aquí, en MODULES.
// ============================================================

import { renderDashboard } from "./modules/dashboard.js";
import { renderIngresos } from "./modules/ingresos.js";
import { renderEgresos } from "./modules/egresos.js";
import { icon } from "./utils/icons.js";

// path   -> texto después del # en la URL
// label  -> texto del menú de navegación
// icon   -> nombre en utils/icons.js
// render -> (container, ctx) => void | (() => void) función de limpieza
const MODULES = [
  { path: "dashboard", label: "Inicio", icon: "dashboard", render: renderDashboard },
  { path: "ingresos", label: "Ingresos", icon: "income", render: renderIngresos },
  { path: "egresos", label: "Egresos", icon: "expense", render: renderEgresos },
];

const content = document.getElementById("app-content");
const sidebarNav = document.getElementById("sidebar-nav");
const tabbarNav = document.getElementById("tabbar-nav");

let ctx = null;
let cleanupCurrent = null;

function navLinkSidebar(m) {
  return `<a href="#/${m.path}" data-path="${m.path}">${icon(m.icon)}<span>${m.label}</span></a>`;
}
function navLinkTabbar(m) {
  return `<a href="#/${m.path}" data-path="${m.path}">${icon(m.icon)}<span>${m.label}</span></a>`;
}

function buildNav() {
  sidebarNav.innerHTML = MODULES.map(navLinkSidebar).join("");
  tabbarNav.innerHTML = MODULES.map(navLinkTabbar).join("");
}

function setActiveLink(path) {
  document.querySelectorAll(".app-nav a, .app-tabbar a").forEach((a) => {
    a.classList.toggle("active", a.dataset.path === path);
  });
}

function renderRoute() {
  const path = location.hash.replace("#/", "") || MODULES[0].path;
  const mod = MODULES.find((m) => m.path === path) || MODULES[0];

  setActiveLink(mod.path);

  if (typeof cleanupCurrent === "function") cleanupCurrent();

  content.classList.remove("view-enter");
  content.innerHTML = "";
  // eslint-disable-next-line no-unused-expressions
  content.offsetWidth; // reinicia la animación de entrada
  content.classList.add("view-enter");

  cleanupCurrent = mod.render(content, ctx) || null;

  // .view-enter anima con transform (translateY) y fill-mode "both", así
  // que ese transform se queda aplicado en #app-content aun después de
  // terminar la animación. Un elemento con transform activo se vuelve el
  // "containing block" de sus descendientes position:fixed (ej. el FAB
  // de Ingresos/Egresos), así que ese botón dejaba de fijarse a la
  // pantalla y se fijaba al contenido que hace scroll. Se quita la clase
  // al terminar la animación para no dejar el transform pegado.
  content.addEventListener(
    "animationend",
    () => content.classList.remove("view-enter"),
    { once: true }
  );
}

export function initRouter(routerCtx) {
  ctx = routerCtx;
  buildNav();
  window.addEventListener("hashchange", renderRoute);
  if (!location.hash) location.hash = `#/${MODULES[0].path}`;
  else renderRoute();
}

export function stopRouter() {
  window.removeEventListener("hashchange", renderRoute);
  if (typeof cleanupCurrent === "function") cleanupCurrent();
  cleanupCurrent = null;
}
