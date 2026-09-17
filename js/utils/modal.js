// ============================================================
// utils/modal.js
// Hoja modal genérica (bottom sheet en móvil, diálogo centrado en
// escritorio, ver .modal-backdrop/.modal-sheet en components.css).
// Los módulos le pasan su propio HTML interno y reciben `close()`.
// ============================================================

export function openModal(innerHtml, { onMount } = {}) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `<div class="modal-sheet">${innerHtml}</div>`;
  document.body.appendChild(backdrop);

  function close() {
    backdrop.removeEventListener("click", onBackdropClick);
    document.removeEventListener("keydown", onKeydown);
    backdrop.remove();
  }

  function onBackdropClick(e) {
    if (e.target === backdrop) close();
  }
  function onKeydown(e) {
    if (e.key === "Escape") close();
  }

  backdrop.addEventListener("click", onBackdropClick);
  document.addEventListener("keydown", onKeydown);

  const sheet = backdrop.querySelector(".modal-sheet");
  if (onMount) onMount(sheet, close);

  return { close, sheet };
}
