// ============================================================
// utils/icons.js
// Iconografía mínima en SVG inline (sin librerías de iconos).
// Todos usan stroke="currentColor" para heredar el color del
// contenedor y funcionar igual en light/dark.
// ============================================================

const wrap = (paths, viewBox = "0 0 24 24") =>
  `<svg viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`;

export const icons = {
  dashboard: wrap(`<path d="M4 13h6V4H4v9Z"/><path d="M14 20h6v-9h-6v9Z"/><path d="M4 20h6v-4H4v4Z"/><path d="M14 9h6V4h-6v5Z"/>`),
  income: wrap(`<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8.5 12.5 12 16l3.5-3.5"/>`),
  expense: wrap(`<circle cx="12" cy="12" r="9"/><path d="M12 16V8M8.5 11.5 12 8l3.5 3.5"/>`),
  logout: wrap(`<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>`),
  chevronRight: wrap(`<path d="m9 18 6-6-6-6"/>`),
  chevronLeft: wrap(`<path d="m15 18-6-6 6-6"/>`),
  plus: wrap(`<path d="M12 5v14M5 12h14"/>`),
  edit: wrap(`<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>`),
  trash: wrap(`<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>`),
  close: wrap(`<path d="M18 6 6 18M6 6l12 12"/>`),
  wallet: wrap(`<path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3"/><path d="M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1h-4a2.5 2.5 0 0 1 0-5h4a1 1 0 0 0 1-1"/><circle cx="16.5" cy="13.5" r="0.6" fill="currentColor" stroke="none"/>`),
  clock: wrap(`<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`),
  scale: wrap(`<path d="M12 3v18"/><path d="M5 7h14"/><path d="M5 7 3 12a2.5 2.5 0 0 0 5 0L6 7"/><path d="M19 7l-2 5a2.5 2.5 0 0 0 5 0l-2-5"/>`),
  layers: wrap(`<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>`),
  shield: wrap(`<path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/>`),
  smartphone: wrap(`<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>`),
  bolt: wrap(`<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/>`),
  x: wrap(`<path d="M18 6 6 18M6 6l12 12"/>`),
  check: wrap(`<path d="M20 6 9 17l-5-5"/>`),
  arrowLeft: wrap(`<path d="M19 12H5M12 19l-7-7 7-7"/>`),
  download: wrap(`<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>`),
};

export function icon(name) {
  return icons[name] || "";
}
