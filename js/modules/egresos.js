// ============================================================
// modules/egresos.js
// Alta, edición, eliminación y filtro por mes de egresos.
// Esquema: gasto, categoria, monto, diaVencimiento,
// fechaVencimiento, formaPago, estado (Pagado/Pendiente), notas.
// Ordenado por fecha de vencimiento.
// ============================================================

import { formatCurrency, formatDate, monthKey, monthLabel, shiftMonthKey, daysUntil } from "../utils/format.js";
import { icon } from "../utils/icons.js";
import { openModal } from "../utils/modal.js";
import { showToast } from "../utils/toast.js";
import { appState, setActiveMonth, onStateChange } from "../state.js";

const CATEGORIAS = ["Vivienda", "Deudas", "Otro"];
const FORMAS = ["Domiciliado", "Efectivo", "Transferencia", "Tarjeta"];

export function renderEgresos(container, ctx) {
  const { repo } = ctx;
  let allRecords = [];
  let statusFilter = "todos"; // todos | pagado | pendiente

  container.innerHTML = `
    <div class="view-header">
      <h2 class="view-title">Egresos</h2>
      <div class="month-filter">
        <button type="button" id="eg-prev-month" aria-label="Mes anterior">${icon("chevronLeft")}</button>
        <span id="eg-month-label"></span>
        <button type="button" id="eg-next-month" aria-label="Mes siguiente">${icon("chevronRight")}</button>
      </div>
    </div>
    <div class="list-toolbar">
      <div class="segmented" id="eg-filter">
        <button type="button" data-value="todos" class="active">Todos</button>
        <button type="button" data-value="pendiente">Pendientes</button>
        <button type="button" data-value="pagado">Pagados</button>
      </div>
    </div>
    <div id="eg-list" class="record-list stagger"></div>
    <button type="button" class="fab" id="eg-fab" aria-label="Agregar egreso">${icon("plus")}</button>
  `;

  const listEl = container.querySelector("#eg-list");
  const monthLabelEl = container.querySelector("#eg-month-label");
  const filterEl = container.querySelector("#eg-filter");

  function paintMonthLabel() {
    monthLabelEl.textContent = monthLabel(appState.activeMonth);
  }

  function paintList() {
    let records = allRecords.filter((r) => monthKey(r.fechaVencimiento) === appState.activeMonth);
    if (statusFilter === "pagado") records = records.filter((r) => r.estado === "Pagado");
    if (statusFilter === "pendiente") records = records.filter((r) => r.estado !== "Pagado");

    if (records.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state card">
          ${icon("expense")}
          <h3>Sin egresos aquí</h3>
          <p>Agrega el primer gasto del mes con el botón +.</p>
        </div>`;
      return;
    }

    listEl.innerHTML = records
      .map((r) => {
        const isPaid = r.estado === "Pagado";
        const days = daysUntil(r.fechaVencimiento);
        let dueHint = formatDate(r.fechaVencimiento);
        if (!isPaid && days !== null) {
          if (days < 0) dueHint = `Venció hace ${Math.abs(days)} día${Math.abs(days) === 1 ? "" : "s"}`;
          else if (days === 0) dueHint = "Vence hoy";
          else dueHint = `Vence en ${days} día${days === 1 ? "" : "s"}`;
        }
        return `
      <div class="record-row card-solid" data-id="${r.id}">
        <span class="record-status-dot ${isPaid ? "paid" : "pending"}" title="${isPaid ? "Pagado" : "Pendiente"}"></span>
        <div class="record-main">
          <div class="record-title">${escapeHtml(r.gasto)}</div>
          <div class="record-meta">
            <span>${escapeHtml(r.categoria || "Sin categoría")}</span>
            <span class="dot-sep">${dueHint}</span>
          </div>
        </div>
        <div class="record-amount">${formatCurrency(r.monto)}</div>
        <span class="record-chevron">${icon("chevronRight")}</span>
      </div>`;
      })
      .join("");
  }

  function openForm(record) {
    const isEdit = Boolean(record);
    const dateValue = record ? toInputDate(record.fechaVencimiento) : toInputDate(new Date());

    const html = `
      <div class="modal-header">
        <h3 class="modal-title">${isEdit ? "Editar egreso" : "Nuevo egreso"}</h3>
        <button type="button" class="btn-icon" id="modal-close" aria-label="Cerrar">${icon("close")}</button>
      </div>
      <form id="eg-form" novalidate>
        <label class="field">
          <span class="field-label">Gasto</span>
          <input type="text" id="f-gasto" required value="${record ? escapeAttr(record.gasto) : ""}" placeholder="Ej. Hipoteca casa (Santander)" />
        </label>
        <label class="field">
          <span class="field-label">Categoría</span>
          <input type="text" id="f-categoria" list="eg-categorias" value="${record ? escapeAttr(record.categoria) : ""}" placeholder="Vivienda, Deudas..." />
          <datalist id="eg-categorias">${CATEGORIAS.map((c) => `<option value="${c}">`).join("")}</datalist>
        </label>
        <label class="field">
          <span class="field-label">Monto</span>
          <input type="number" id="f-monto" required min="0" step="0.01" value="${record ? record.monto : ""}" placeholder="0.00" />
        </label>
        <label class="field">
          <span class="field-label">Fecha de vencimiento</span>
          <input type="date" id="f-fecha" required value="${dateValue}" />
        </label>
        <label class="field">
          <span class="field-label">Forma de pago</span>
          <input type="text" id="f-forma" list="eg-formas" value="${record ? escapeAttr(record.formaPago) : ""}" placeholder="Domiciliado, Efectivo..." />
          <datalist id="eg-formas">${FORMAS.map((f) => `<option value="${f}">`).join("")}</datalist>
        </label>
        <label class="field">
          <span class="field-label">Estado</span>
          <div class="segmented" id="f-estado" style="width:100%;">
            <button type="button" data-value="Pendiente" class="${!record || record.estado !== "Pagado" ? "active" : ""}" style="flex:1;">Pendiente</button>
            <button type="button" data-value="Pagado" class="${record && record.estado === "Pagado" ? "active" : ""}" style="flex:1;">Pagado</button>
          </div>
        </label>
        <label class="field">
          <span class="field-label">Notas (opcional)</span>
          <textarea id="f-notas" rows="2">${record ? escapeHtml(record.notas || "") : ""}</textarea>
        </label>

        <div class="modal-actions">
          ${isEdit ? `<button type="button" id="f-delete" class="btn btn-danger">${icon("trash")} Eliminar</button>` : ""}
          <button type="submit" class="btn btn-primary">${isEdit ? "Guardar" : "Agregar"}</button>
        </div>
      </form>
    `;

    openModal(html, {
      onMount(sheet, close) {
        sheet.querySelector("#modal-close").addEventListener("click", close);

        let estadoValue = record && record.estado === "Pagado" ? "Pagado" : "Pendiente";
        const estadoGroup = sheet.querySelector("#f-estado");
        estadoGroup.addEventListener("click", (e) => {
          const btn = e.target.closest("button[data-value]");
          if (!btn) return;
          estadoValue = btn.dataset.value;
          estadoGroup.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === btn));
        });

        const form = sheet.querySelector("#eg-form");
        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          const fechaVal = sheet.querySelector("#f-fecha").value;
          const fechaVencimiento = new Date(`${fechaVal}T00:00:00`);
          const data = {
            gasto: sheet.querySelector("#f-gasto").value.trim(),
            categoria: sheet.querySelector("#f-categoria").value.trim() || "Otro",
            monto: parseFloat(sheet.querySelector("#f-monto").value) || 0,
            diaVencimiento: fechaVencimiento.getDate(),
            fechaVencimiento,
            formaPago: sheet.querySelector("#f-forma").value.trim() || "Efectivo",
            estado: estadoValue,
            notas: sheet.querySelector("#f-notas").value.trim(),
          };
          if (!data.gasto || Number.isNaN(data.monto)) return;

          try {
            if (isEdit) {
              await repo.updateEgreso(record.id, data);
              showToast("Egreso actualizado", "success");
            } else {
              await repo.addEgreso(data);
              showToast("Egreso agregado", "success");
            }
            close();
          } catch (err) {
            showToast("No se pudo guardar. Intenta de nuevo.", "error");
          }
        });

        const deleteBtn = sheet.querySelector("#f-delete");
        deleteBtn?.addEventListener("click", async () => {
          if (!confirm("¿Eliminar este egreso? Esta acción no se puede deshacer.")) return;
          try {
            await repo.deleteEgreso(record.id);
            showToast("Egreso eliminado", "success");
            close();
          } catch (err) {
            showToast("No se pudo eliminar. Intenta de nuevo.", "error");
          }
        });
      },
    });
  }

  container.querySelector("#eg-fab").addEventListener("click", () => openForm(null));
  listEl.addEventListener("click", (e) => {
    const row = e.target.closest(".record-row");
    if (!row) return;
    const record = allRecords.find((r) => r.id === row.dataset.id);
    if (record) openForm(record);
  });

  filterEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-value]");
    if (!btn) return;
    statusFilter = btn.dataset.value;
    filterEl.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === btn));
    paintList();
  });

  container.querySelector("#eg-prev-month").addEventListener("click", () => {
    setActiveMonth(shiftMonthKey(appState.activeMonth, -1));
  });
  container.querySelector("#eg-next-month").addEventListener("click", () => {
    setActiveMonth(shiftMonthKey(appState.activeMonth, 1));
  });

  const unsubscribeRepo = repo.subscribeEgresos((records) => {
    allRecords = records;
    paintList();
  });
  const unsubscribeState = onStateChange(() => {
    paintMonthLabel();
    paintList();
  });

  paintMonthLabel();

  return () => {
    unsubscribeRepo();
    unsubscribeState();
  };
}

function toInputDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function escapeAttr(str) {
  return escapeHtml(str);
}
