// ============================================================
// modules/dashboard.js
// Tarjetas de resumen del mes, comparativa mes a mes (Chart.js)
// desde el primer mes con datos, y desglose por categoría.
// ============================================================

import { formatCurrency, monthKey, monthLabel, shiftMonthKey } from "../utils/format.js";
import { icon } from "../utils/icons.js";
import { appState, setActiveMonth, onStateChange } from "../state.js";

const PALETTE = ["#0a84ff", "#ff9f0a", "#30d158", "#bf5af2", "#64d2ff", "#ff375f", "#5e5ce6", "#ffd60a"];

export function renderDashboard(container, ctx) {
  const { repo } = ctx;
  let ingresos = [];
  let egresos = [];
  let chart = null;
  let ingresosReady = false;
  let egresosReady = false;

  container.innerHTML = `
    <div class="view-header">
      <h2 class="view-title">Inicio</h2>
      <div class="month-filter">
        <button type="button" id="dash-prev-month" aria-label="Mes anterior">${icon("chevronLeft")}</button>
        <span id="dash-month-label"></span>
        <button type="button" id="dash-next-month" aria-label="Mes siguiente">${icon("chevronRight")}</button>
      </div>
    </div>

    <div class="metrics-grid" id="dash-metrics"></div>

    <div class="card chart-card">
      <h3>Comparativa mes a mes</h3>
      <div class="chart-wrap"><canvas id="dash-chart"></canvas></div>
    </div>

    <div class="breakdown-grid">
      <div class="card breakdown-card">
        <h3>Ingresos por categoría</h3>
        <div id="dash-breakdown-ingresos"></div>
      </div>
      <div class="card breakdown-card">
        <h3>Gastos por categoría</h3>
        <div id="dash-breakdown-egresos"></div>
      </div>
    </div>
  `;

  const monthLabelEl = container.querySelector("#dash-month-label");
  const metricsEl = container.querySelector("#dash-metrics");
  const breakdownIngEl = container.querySelector("#dash-breakdown-ingresos");
  const breakdownEgEl = container.querySelector("#dash-breakdown-egresos");
  const canvas = container.querySelector("#dash-chart");

  function paintMonthLabel() {
    monthLabelEl.textContent = monthLabel(appState.activeMonth);
  }

  function paintMetrics() {
    const month = appState.activeMonth;
    const ingresosMes = ingresos.filter((r) => monthKey(r.fechaPercepcion) === month);
    const egresosMes = egresos.filter((r) => monthKey(r.fechaVencimiento) === month);

    const totalIngresos = sum(ingresosMes, "monto");
    const totalGastos = sum(egresosMes, "monto");
    const gastosPagados = sum(egresosMes.filter((r) => r.estado === "Pagado"), "monto");
    const gastosPendientes = sum(egresosMes.filter((r) => r.estado !== "Pagado"), "monto");
    const balance = totalIngresos - totalGastos;

    metricsEl.innerHTML = `
      <div class="metric-card card fade-in-up">
        <span class="metric-label">${icon("income")} Ingresos del mes</span>
        <span class="metric-value">${formatCurrency(totalIngresos)}</span>
        <span class="metric-sub">${ingresosMes.length} registro${ingresosMes.length === 1 ? "" : "s"}</span>
      </div>
      <div class="metric-card card fade-in-up">
        <span class="metric-label">${icon("expense")} Gastos del mes</span>
        <span class="metric-value">${formatCurrency(totalGastos)}</span>
        <span class="metric-sub">${egresosMes.length} registro${egresosMes.length === 1 ? "" : "s"}</span>
      </div>
      <div class="metric-card card fade-in-up">
        <span class="metric-label">${icon("clock")} Pagado / pendiente</span>
        <span class="metric-value">${formatCurrency(gastosPagados)}</span>
        <span class="metric-sub">Pendiente: ${formatCurrency(gastosPendientes)}</span>
      </div>
      <div class="metric-card card fade-in-up ${balance >= 0 ? "balance-positive" : "balance-negative"}">
        <span class="metric-label">${icon("scale")} Balance del mes</span>
        <span class="metric-value">${formatCurrency(balance)}</span>
        <span class="metric-sub">Ingresos − gastos (pagados y pendientes)</span>
      </div>
    `;
  }

  function paintBreakdown(el, records, amountKey, emptyLabel) {
    const totals = new Map();
    records.forEach((r) => {
      const cat = r.categoria || "Otro";
      totals.set(cat, (totals.get(cat) || 0) + (Number(r[amountKey]) || 0));
    });

    if (totals.size === 0) {
      el.innerHTML = `<p class="text-dim" style="font-size:0.86rem;">${emptyLabel}</p>`;
      return;
    }

    const total = [...totals.values()].reduce((a, b) => a + b, 0) || 1;
    const rows = [...totals.entries()].sort((a, b) => b[1] - a[1]);

    el.innerHTML = rows
      .map(([cat, amount], i) => {
        const pct = Math.round((amount / total) * 100);
        const color = PALETTE[i % PALETTE.length];
        return `
        <div class="breakdown-row-wrap">
          <div class="breakdown-row">
            <span class="breakdown-dot" style="background:${color}"></span>
            <span class="breakdown-name">${escapeHtml(cat)}</span>
            <span class="breakdown-amount">${formatCurrency(amount)}</span>
            <span class="breakdown-pct">${pct}%</span>
          </div>
          <div class="breakdown-bar-track">
            <div class="breakdown-bar-fill" style="width:${pct}%; background:${color};"></div>
          </div>
        </div>`;
      })
      .join("");
  }

  function paintChart() {
    if (!window.Chart) {
      canvas.replaceWith(Object.assign(document.createElement("p"), {
        className: "text-dim",
        style: "font-size:0.86rem; text-align:center; padding-top:40px;",
        textContent: "La gráfica necesita conexión a internet para cargar (Chart.js). Los totales de arriba siguen funcionando sin conexión.",
      }));
      return;
    }

    const months = [...new Set([...ingresos.map((r) => monthKey(r.fechaPercepcion)), ...egresos.map((r) => monthKey(r.fechaVencimiento))])]
      .filter(Boolean)
      .sort();

    const labels = months.map((m) => {
      const [year, month] = m.split("-").map(Number);
      const monthName = new Date(year, month - 1, 1).toLocaleDateString("es-MX", { month: "short" });
      return `${monthName} '${String(year).slice(-2)}`;
    });
    const ingresosData = months.map((m) => sum(ingresos.filter((r) => monthKey(r.fechaPercepcion) === m), "monto"));
    const gastosData = months.map((m) => sum(egresos.filter((r) => monthKey(r.fechaVencimiento) === m), "monto"));

    const style = getComputedStyle(document.documentElement);
    const textDim = style.getPropertyValue("--text-dim").trim();
    const grid = style.getPropertyValue("--border").trim();

    if (chart) chart.destroy();
    chart = new window.Chart(canvas, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Ingresos", data: ingresosData, backgroundColor: "#0a84ff", borderRadius: 6, maxBarThickness: 28 },
          { label: "Gastos", data: gastosData, backgroundColor: "#ff9f0a", borderRadius: 6, maxBarThickness: 28 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: textDim, font: { family: "-apple-system, sans-serif" } } },
          tooltip: {
            callbacks: { label: (item) => ` ${item.dataset.label}: ${formatCurrency(item.raw)}` },
          },
        },
        scales: {
          x: { ticks: { color: textDim }, grid: { display: false } },
          y: { ticks: { color: textDim, callback: (v) => formatCurrency(v) }, grid: { color: grid } },
        },
      },
    });
  }

  function paintMonthDependent() {
    paintMetrics();
    paintBreakdown(breakdownIngEl, ingresos.filter((r) => monthKey(r.fechaPercepcion) === appState.activeMonth), "monto", "Sin ingresos este mes.");
    paintBreakdown(breakdownEgEl, egresos.filter((r) => monthKey(r.fechaVencimiento) === appState.activeMonth), "monto", "Sin gastos este mes.");
  }

  // La gráfica compara TODOS los meses con datos, no solo el mes activo:
  // solo hace falta reconstruirla cuando cambian los datos, no al navegar
  // entre meses con las flechas.
  function paintAll() {
    paintMonthDependent();
    if (ingresosReady && egresosReady) paintChart();
  }

  function recolorChart() {
    if (!chart) return;
    const style = getComputedStyle(document.documentElement);
    const textDim = style.getPropertyValue("--text-dim").trim();
    const grid = style.getPropertyValue("--border").trim();
    chart.options.plugins.legend.labels.color = textDim;
    chart.options.scales.x.ticks.color = textDim;
    chart.options.scales.y.ticks.color = textDim;
    chart.options.scales.y.grid.color = grid;
    chart.update();
  }

  container.querySelector("#dash-prev-month").addEventListener("click", () => {
    setActiveMonth(shiftMonthKey(appState.activeMonth, -1));
  });
  container.querySelector("#dash-next-month").addEventListener("click", () => {
    setActiveMonth(shiftMonthKey(appState.activeMonth, 1));
  });

  const unsubIngresos = repo.subscribeIngresos((records) => {
    ingresos = records;
    ingresosReady = true;
    paintAll();
  });
  const unsubEgresos = repo.subscribeEgresos((records) => {
    egresos = records;
    egresosReady = true;
    paintAll();
  });
  const unsubState = onStateChange(() => {
    paintMonthLabel();
    paintMonthDependent();
  });
  document.addEventListener("medicar:theme-change", recolorChart);

  paintMonthLabel();
  paintMetrics();

  return () => {
    unsubIngresos();
    unsubEgresos();
    unsubState();
    document.removeEventListener("medicar:theme-change", recolorChart);
    if (chart) chart.destroy();
  };
}

function sum(records, key) {
  return records.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
