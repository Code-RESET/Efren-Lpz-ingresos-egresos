// ============================================================
// modules/ingresos.js
// Alta, edición, eliminación y filtro por mes de ingresos.
// Esquema: concepto, categoria, monto, fechaPercepcion,
// formaRecepcion, notas.
// ============================================================

import { formatCurrency, formatDate, monthKey, monthLabel, shiftMonthKey, toDate } from "../utils/format.js";
import { icon } from "../utils/icons.js";
import { openModal } from "../utils/modal.js";
import { showToast } from "../utils/toast.js";
import { appState, setActiveMonth, onStateChange } from "../state.js";

const CATEGORIAS = ["Honorarios", "Sueldo", "Renta", "Otro"];
const FORMAS = ["Efectivo", "Depósito", "Transferencia"];

export function renderIngresos(container, ctx) {
  const { repo } = ctx;
  let allRecords = [];

  container.innerHTML = `
    <div class="view-header">
      <h2 class="view-title">Ingresos</h2>
      <div class="month-filter">
        <button type="button" id="ing-prev-month" aria-label="Mes anterior">${icon("chevronLeft")}</button>
        <span id="ing-month-label"></span>
        <button type="button" id="ing-next-month" aria-label="Mes siguiente">${icon("chevronRight")}</button>
      </div>
    </div>
    <div id="ing-list" class="record-list stagger"></div>
    <button type="button" class="fab" id="ing-fab" aria-label="Agregar ingreso">${icon("plus")}</button>
  `;

  const listEl = container.querySelector("#ing-list");
  const monthLabelEl = container.querySelector("#ing-month-label");

  function paintMonthLabel() {
    monthLabelEl.textContent = monthLabel(appState.activeMonth);
  }

  function paintList() {
    const records = allRecords.filter((r) => monthKey(r.fechaPercepcion) === appState.activeMonth);

    if (records.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state card">
          ${icon("income")}
          <h3>Sin ingresos este mes</h3>
          <p>Agrega el primer ingreso del mes con el botón +.</p>
        </div>`;
      return;
    }

    listEl.innerHTML = records
      .map(
        (r) => `
      <div class="record-row card-solid" data-id="${r.id}">
        <div class="record-main">
          <div class="record-title">${escapeHtml(r.concepto)}</div>
          <div class="record-meta">
            <span>${escapeHtml(r.categoria || "Sin categoría")}</span>
            <span class="dot-sep">${formatDate(r.fechaPercepcion)}</span>
            <span class="dot-sep">${escapeHtml(r.formaRecepcion || "")}</span>
          </div>
        </div>
        <div class="record-amount income">+${formatCurrency(r.monto)}</div>
        <span class="record-chevron">${icon("chevronRight")}</span>
      </div>`
      )
      .join("");
  }

  function openForm(record) {
    const isEdit = Boolean(record);
    const dateValue = record ? toInputDate(record.fechaPercepcion) : toInputDate(new Date());

    const html = `
      <div class="modal-header">
        <h3 class="modal-title">${isEdit ? "Editar ingreso" : "Nuevo ingreso"}</h3>
        <button type="button" class="btn-icon" id="modal-close" aria-label="Cerrar">${icon("close")}</button>
      </div>
      <form id="ing-form" novalidate>
        <label class="field">
          <span class="field-label">Concepto</span>
          <input type="text" id="f-concepto" required value="${record ? escapeAttr(record.concepto) : ""}" placeholder="Ej. Honorarios consulta médica" />
        </label>
        <label class="field">
          <span class="field-label">Categoría</span>
          <input type="text" id="f-categoria" list="ing-categorias" value="${record ? escapeAttr(record.categoria) : ""}" placeholder="Honorarios, Sueldo..." />
          <datalist id="ing-categorias">${CATEGORIAS.map((c) => `<option value="${c}">`).join("")}</datalist>
        </label>
        <label class="field">
          <span class="field-label">Monto</span>
          <input type="number" id="f-monto" required min="0" step="0.01" value="${record ? record.monto : ""}" placeholder="0.00" />
        </label>
        <label class="field">
          <span class="field-label">Fecha de percepción</span>
          <input type="date" id="f-fecha" required value="${dateValue}" />
        </label>
        <label class="field">
          <span class="field-label">Forma de recepción</span>
          <input type="text" id="f-forma" list="ing-formas" value="${record ? escapeAttr(record.formaRecepcion) : ""}" placeholder="Efectivo, Depósito..." />
          <datalist id="ing-formas">${FORMAS.map((f) => `<option value="${f}">`).join("")}</datalist>
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
        const form = sheet.querySelector("#ing-form");

        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          const data = {
            concepto: sheet.querySelector("#f-concepto").value.trim(),
            categoria: sheet.querySelector("#f-categoria").value.trim() || "Otro",
            monto: parseFloat(sheet.querySelector("#f-monto").value) || 0,
            fechaPercepcion: new Date(`${sheet.querySelector("#f-fecha").value}T00:00:00`),
            formaRecepcion: sheet.querySelector("#f-forma").value.trim() || "Efectivo",
            notas: sheet.querySelector("#f-notas").value.trim(),
          };
          if (!data.concepto || !data.fechaPercepcion || Number.isNaN(data.monto)) return;

          try {
            if (isEdit) {
              await repo.updateIngreso(record.id, data);
              showToast("Ingreso actualizado", "success");
            } else {
              await repo.addIngreso(data);
              showToast("Ingreso agregado", "success");
            }
            close();
          } catch (err) {
            showToast("No se pudo guardar. Intenta de nuevo.", "error");
          }
        });

        const deleteBtn = sheet.querySelector("#f-delete");
        deleteBtn?.addEventListener("click", async () => {
          if (!confirm("¿Eliminar este ingreso? Esta acción no se puede deshacer.")) return;
          try {
            await repo.deleteIngreso(record.id);
            showToast("Ingreso eliminado", "success");
            close();
          } catch (err) {
            showToast("No se pudo eliminar. Intenta de nuevo.", "error");
          }
        });
      },
    });
  }

  container.querySelector("#ing-fab").addEventListener("click", () => openForm(null));
  listEl.addEventListener("click", (e) => {
    const row = e.target.closest(".record-row");
    if (!row) return;
    const record = allRecords.find((r) => r.id === row.dataset.id);
    if (record) openForm(record);
  });

  container.querySelector("#ing-prev-month").addEventListener("click", () => {
    setActiveMonth(shiftMonthKey(appState.activeMonth, -1));
  });
  container.querySelector("#ing-next-month").addEventListener("click", () => {
    setActiveMonth(shiftMonthKey(appState.activeMonth, 1));
  });

  const unsubscribeRepo = repo.subscribeIngresos((records) => {
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
  const d = toDate(date) || new Date();
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
