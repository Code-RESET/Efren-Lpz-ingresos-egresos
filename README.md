# Medicar — Control financiero

PWA de control financiero personal de Efrén López (Medicar). Ingresos,
egresos y métricas, en HTML + CSS + JS puro (sin build step), Firebase
(Auth + Firestore) y despliegue en GitHub Pages.

Construida sobre [code-reset-boilerplate](https://github.com/Code-RESET/code-reset-boilerplate).

## 1. Crear el proyecto de Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com) → **Agregar proyecto**.
   Nómbralo, por ejemplo, `medicar-app`.
2. **Authentication** → pestaña **Sign-in method** → habilita **Correo electrónico/contraseña**.
3. **Authentication** → pestaña **Users** → **Agregar usuario** → crea la cuenta de
   Efrén (correo + contraseña). La app es mono-usuario: no hay pantalla de registro,
   el acceso se crea aquí, a mano.
4. **Firestore Database** → **Crear base de datos** → modo producción → elige la
   región más cercana (ej. `us-central` o `southamerica-east1`).
5. En **Reglas**, pega el contenido de [`firestore.rules`](firestore.rules) de este
   repo y publica. Sin esto, por defecto Firestore bloquea todo (correcto), pero
   necesitas las reglas explícitas para que el usuario dueño sí pueda leer/escribir.
6. **Configuración del proyecto** (ícono de engrane) → pestaña **Tus apps** →
   **Agregar app → Web (`</>`)** → regístrala (no hace falta Firebase Hosting) →
   copia el objeto `firebaseConfig` que te muestra.

## 2. Pegar la configuración en el código

Abre [`js/firebase-config.js`](js/firebase-config.js) y reemplaza `FIREBASE_CONFIG`
con el objeto que copiaste:

```js
const FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};
```

No necesitas nada más: no hay variables de entorno ni build step. Este archivo se
sube tal cual al repo (la clave de Firebase Web es pública por diseño; lo que
protege los datos son las reglas de Firestore del paso anterior).

## 3. Probar en local

Como es HTML/JS puro con módulos ES6, solo necesitas servirlo (no puedes abrir
`index.html` con doble clic por las restricciones de `type="module"` en `file://`):

```bash
python3 -m http.server 8080
# o: npx serve .
```

Abre `http://localhost:8080`.

## 4. Publicar en GitHub Pages

1. Sube el repo a GitHub (o usa este mismo).
2. **Settings → Pages** → Source: **Deploy from a branch** → rama `main`,
   carpeta `/ (root)` → **Save**.
3. En unos minutos queda publicado en `https://<usuario>.github.io/<repo>/`.
4. En Firebase → **Authentication → Settings → Authorized domains**, agrega ese
   dominio de GitHub Pages (si no, el login fallará por CORS/dominio no
   autorizado).

Cada vez que actualices archivos base del shell (`index.html`, `css/*.css` que
afectan a todas las vistas, `js/app.js`, `js/router.js`), sube el número en
`CACHE_VERSION` dentro de [`service-worker.js`](service-worker.js) para que los
teléfonos que ya instalaron la PWA jalen la versión nueva.

## Estructura del proyecto

```
index.html          Landing + login + shell de la app (una sola página)
css/                 Sistema de diseño (tokens, base, componentes) + por vista
js/
  app.js             Arranque: decide pantalla, login, logout
  auth.js             Solo autenticación (se carga de forma dinámica)
  router.js           Router por hash, registro de módulos
  state.js             Estado compartido mínimo (mes activo, repo activo)
  firebase-config.js  Config de Firebase — EDITAR con las credenciales reales
  data/
    firestore-repo.js Acceso real a Firestore (users/{uid}/ingresos|egresos)
  modules/
    dashboard.js       Métricas, comparativa mes a mes (Chart.js), desglose
    ingresos.js         Alta/edición/borrado/filtro de ingresos
    egresos.js           Alta/edición/borrado/filtro de egresos, Pagado/Pendiente
  utils/                Formato de moneda/fecha, iconos SVG, toasts, modal
manifest.json        PWA
service-worker.js    Cache del shell (subir CACHE_VERSION al tocar archivos base)
firestore.rules      Reglas de seguridad — pegar en Firebase Console
manual-de-usuario.html  Manual para el cliente (identidad Code-Reset)
```

## Cómo agregar un módulo nuevo

1. Copia `js/modules/dashboard.js` (o `ingresos.js` si el módulo nuevo es una
   lista con alta/edición/borrado) y renómbralo.
2. Escribe su `render(container, ctx)` — recibe el contenedor y
   `{ user, repo }`; puede devolver una función de limpieza.
3. Regístralo en el arreglo `MODULES` de `js/router.js`.
4. Si necesita su propio CSS, agrega el archivo en `css/` y enlázalo en
   `index.html`.

Aparece solo en el menú (sidebar de escritorio + tab bar de móvil) y en el
routing, sin tocar el resto de los módulos.

## Antes de entregar al cliente

- Probar en Chrome, Safari (iOS) y Samsung Internet — sobre todo el formulario
  de login y los modales de alta/edición, que son los flujos más sensibles a
  diferencias de navegador.
- Confirmar que "Agregar a pantalla de inicio" funciona en Android e iOS
  (ícono, nombre y que abra en modo standalone sin la barra del navegador).
- Verificar las reglas de Firestore con el Simulador (ver `firestore.rules`):
  un usuario que no sea el dueño debe recibir "denegado" al leer o escribir.
- Revisar que `CACHE_VERSION` esté al día si se tocó algo del shell base.
