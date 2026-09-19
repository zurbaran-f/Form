# Formulario de contacto

Formulario web para recoger **nombre, teléfono y correo electrónico**. Cada envío
llega por email a **zurbaranf@kosadesigns.com**.

Son archivos estáticos (HTML, CSS y JavaScript): funcionan en cualquier hosting,
incluido GitHub Pages, sin servidor ni base de datos.

```
index.html            el formulario
styles.css            estilos (se adapta a móvil y a modo oscuro)
app.js                validación y envío sin recargar la página
gracias.html          página de "gracias" para navegadores sin JavaScript
qr/qr-formulario.svg  código QR en vectorial (para imprimir a cualquier tamaño)
qr/qr-formulario.png  código QR en imagen (para redes, WhatsApp, documentos)
qr/cartel.html        cartel imprimible con el QR
tools/generar-qr.py   vuelve a generar el QR si cambias de dirección web
```

## 1. Publicarlo en internet (GitHub Pages, gratis)

1. En GitHub, entra en este repositorio → **Settings** → **Pages**.
2. En *Source* elige **Deploy from a branch**.
3. Branch: `claude/contact-form-email-0954bz` (o `main` si antes fusionas la rama),
   carpeta `/ (root)`. Pulsa **Save**.
4. Espera un minuto: la web queda publicada en
   `https://zurbaran-f.github.io/Form/`

También puedes subir los cuatro archivos a cualquier hosting (Netlify, Vercel,
Hostinger, cPanel…): basta con copiarlos a la carpeta pública.

## 2. Activar el envío de correos (solo una vez)

El envío usa [FormSubmit](https://formsubmit.co), un servicio gratuito que no
necesita registro. La primera vez hay que confirmar la dirección:

1. Abre el formulario ya publicado y envía una prueba con tus datos.
2. FormSubmit enviará un correo a **zurbaranf@kosadesigns.com** con el asunto
   *"Confirm your email"* (revisa spam).
3. Pulsa el enlace de confirmación.

A partir de ahí, cada envío llega a tu bandeja con el asunto *"Nuevo contacto
desde el formulario web"* y los datos en una tabla. Puedes responder
directamente al correo de la persona.

> **Recomendado tras activarlo:** en el correo de confirmación, FormSubmit te da
> un código único (por ejemplo `https://formsubmit.co/a1b2c3d4...`). Si sustituyes
> la dirección por ese código en el atributo `action` de `index.html`, tu email
> deja de aparecer en el código de la página y recibes menos spam.

## 3. El código QR

En la carpeta `qr/` tienes el código QR que lleva al formulario. Apuntando con
la cámara del móvil, cualquier persona llega directamente a la página.

- `qr-formulario.png` — para WhatsApp, redes sociales o un documento.
- `qr-formulario.svg` — vectorial: imprímelo en tarjeta, cartel o escaparate al
  tamaño que quieras sin que pierda nitidez.
- `cartel.html` — ábrelo en el navegador y pulsa **Imprimir cartel**: sale una
  hoja A4 lista para colgar.

Está generado con corrección de errores alta, así que se sigue leyendo aunque se
ensucie o se tape una esquina. Como norma, no lo imprimas a menos de 2,5 cm de
lado y deja el margen blanco que ya trae alrededor.

**Apunta a:** `https://zurbaran-f.github.io/Form/`
(la dirección de GitHub Pages del paso 1; el QR solo funcionará cuando esa
página esté publicada).

### Si publicas el formulario en otra dirección

Vuelve a generar el QR con la dirección nueva:

```bash
pip install segno            # solo la primera vez
python3 tools/generar-qr.py https://tu-dominio.com
```

El script actualiza el PNG, el SVG y la dirección que muestra el cartel.

## 4. Cambiar el correo de destino

Está en un único sitio, la línea `action` de `index.html`:

```html
<form ... action="https://formsubmit.co/zurbaranf@kosadesigns.com" ...>
```

Cambia la dirección y vuelve a confirmar (paso 2) con el correo nuevo.

## Detalles

- **Validación**: los tres campos son obligatorios; se comprueba que el correo
  tenga formato válido y que el teléfono tenga al menos 7 dígitos.
- **Anti-spam**: campo trampa invisible (`_honey`) que solo rellenan los robots.
- **Sin JavaScript**: el formulario se envía igualmente por el método clásico y
  la persona acaba en `gracias.html`.
- **Accesibilidad**: etiquetas asociadas a cada campo, errores anunciados por
  lectores de pantalla y foco visible.

### Probarlo en local

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

### Alternativas al servicio de envío

Si algún día quieres cambiar de proveedor, solo hay que tocar la URL de `action`
(y, en `app.js`, la función `ajaxEndpoint` si el nuevo servicio usa otra ruta):

- [Web3Forms](https://web3forms.com) — gratis, requiere una clave de acceso.
- [Formspree](https://formspree.io) — plan gratuito con límite de envíos.
- Un backend propio (por ejemplo Node + Nodemailer) si prefieres no depender de
  terceros.
