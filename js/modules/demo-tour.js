// ============================================================
// modules/demo-tour.js
// Tour guiado interactivo del modo demo (?demo=1): tarjeta de
// bienvenida + pasos "X de N" que resaltan cada módulo. Solo se
// muestra la primera vez (localStorage); se puede volver a ver
// desde la consola con localStorage.removeItem('medicar-demo-tour-seen').
// ============================================================

import { icon } from "../utils/icons.js";

const TOUR_KEY = "medicar-demo-tour-seen";

const STEPS = [
  {
    path: "dashboard",
    target: () => document.getElementById("dash-metrics"),
    title: "Tu resumen financiero",
    text: "Ingresos, gastos, pagado vs. pendiente y tu balance del mes, siempre a la vista.",
  },
  {
    path: "dashboard",
    target: () => document.querySelector(".chart-card"),
    title: "Comparativa mes a mes",
    text: "Compara ingresos contra gastos, mes con mes, desde que empiezas a usar la app.",
  },
  {
    path: "ingresos",
    target: () => pickVisible('#sidebar-nav [data-path="ingresos"]', '#tabbar-nav [data-path="ingresos"]'),
    title: "Ingresos",
    text: "Registra honorarios, sueldos y cualquier ingreso, con fecha y forma de recepción.",
  },
  {
    path: "egresos",
    target: () => pickVisible('#sidebar-nav [data-path="egresos"]', '#tabbar-nav [data-path="egresos"]'),
    title: "Egresos",
    text: "Cada gasto muestra si ya está pagado o pendiente, y se ordena por fecha de vencimiento.",
  },
];

let stepIndex = 0;
let resizeHandler = null;

export function maybeStartTour() {
  if (localStorage.getItem(TOUR_KEY)) return;
  showWelcome();
}

export function restartTour() {
  showWelcome();
}

function showWelcome() {
  const root = document.getElementById("tour-root");
  location.hash = "#/dashboard";
  root.innerHTML = `
    <div class="tour-welcome">
      <div class="tour-welcome-card card">
        <div class="feature-icon" style="margin:0 auto 16px;">${icon("bolt")}</div>
        <h2>Bienvenido a la demo de Medicar</h2>
        <p>Un recorrido rápido con datos de muestra para ver cómo se vería tu control financiero personal. Toma menos de un minuto.</p>
        <div class="u-flex u-gap-3" style="justify-content:center;">
          <button type="button" class="btn btn-secondary" id="tour-skip">Explorar por mi cuenta</button>
          <button type="button" class="btn btn-primary" id="tour-start">Comenzar tour</button>
        </div>
      </div>
    </div>`;

  root.querySelector("#tour-skip").addEventListener("click", finishTour);
  root.querySelector("#tour-start").addEventListener("click", () => {
    root.innerHTML = "";
    runStep(0);
  });
}

function runStep(i) {
  stepIndex = i;
  const step = STEPS[i];
  const currentPath = location.hash.replace("#/", "");

  if (currentPath !== step.path) {
    location.hash = `#/${step.path}`;
    requestAnimationFrame(() => requestAnimationFrame(() => paintStep()));
  } else {
    paintStep();
  }
}

function paintStep() {
  const step = STEPS[stepIndex];
  const target = step.target();
  const root = document.getElementById("tour-root");

  if (!target) {
    advance(1);
    return;
  }

  const rect = target.getBoundingClientRect();
  const pad = 8;

  root.innerHTML = `
    <div class="tour-overlay">
      <div class="tour-spotlight" style="top:${rect.top - pad}px; left:${rect.left - pad}px; width:${rect.width + pad * 2}px; height:${rect.height + pad * 2}px;"></div>
      <div class="tour-card" id="tour-card">
        <div class="tour-step-count">${stepIndex + 1} de ${STEPS.length}</div>
        <h4>${step.title}</h4>
        <p>${step.text}</p>
        <div class="tour-actions">
          <div class="tour-dots">
            ${STEPS.map((_, i) => `<span class="tour-dot ${i === stepIndex ? "active" : ""}"></span>`).join("")}
          </div>
          <div class="u-flex u-gap-2">
            <button type="button" class="btn btn-ghost btn-sm" id="tour-skip-step">Saltar</button>
            <button type="button" class="btn btn-primary btn-sm" id="tour-next">
              ${stepIndex === STEPS.length - 1 ? "Finalizar" : "Siguiente"}
            </button>
          </div>
        </div>
      </div>
    </div>`;

  positionCard(rect);

  root.querySelector("#tour-next").addEventListener("click", () => advance(1));
  root.querySelector("#tour-skip-step").addEventListener("click", finishTour);

  if (resizeHandler) window.removeEventListener("resize", resizeHandler);
  resizeHandler = () => paintStep();
  window.addEventListener("resize", resizeHandler);
}

function positionCard(targetRect) {
  const card = document.getElementById("tour-card");
  if (!card) return;
  const margin = 16;
  const cardRect = card.getBoundingClientRect();

  let top = targetRect.bottom + margin;
  if (top + cardRect.height > window.innerHeight - margin) {
    top = targetRect.top - cardRect.height - margin;
  }
  if (top < margin) top = margin;

  let left = targetRect.left;
  if (left + cardRect.width > window.innerWidth - margin) {
    left = window.innerWidth - cardRect.width - margin;
  }
  if (left < margin) left = margin;

  card.style.top = `${top}px`;
  card.style.left = `${left}px`;
}

function advance(delta) {
  const next = stepIndex + delta;
  if (next >= STEPS.length) {
    finishTour();
    return;
  }
  runStep(Math.max(0, next));
}

function finishTour() {
  localStorage.setItem(TOUR_KEY, "1");
  if (resizeHandler) window.removeEventListener("resize", resizeHandler);
  resizeHandler = null;
  const root = document.getElementById("tour-root");
  root.innerHTML = "";
  location.hash = "#/dashboard";
}

function pickVisible(...selectors) {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.offsetParent !== null) return el;
  }
  return null;
}
