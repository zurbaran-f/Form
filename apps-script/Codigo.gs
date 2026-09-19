/**
 * Formulario de contacto — recibe los envíos, los guarda en esta hoja de
 * cálculo y te avisa por correo desde tu propia cuenta de Gmail.
 *
 * Instrucciones de instalación: ver INSTRUCCIONES.md
 */

// A dónde quieres que lleguen los avisos.
const DESTINO = 'zurbaranf@kosadesigns.com';

// Dirección de tu web, para el botón "Volver" de la página de gracias.
const WEB = 'https://zurbaran-f.github.io/Form/';

/**
 * Se ejecuta cada vez que alguien envía el formulario.
 */
function doPost(e) {
  const datos = (e && e.parameter) || {};

  // Campo trampa invisible: si viene relleno es un robot. Ni guardamos ni avisamos.
  if (datos._honey) {
    return paginaGracias();
  }

  const nombre = limpiar(datos.Nombre, 100);
  const telefono = limpiar(datos['Teléfono'] || datos.Telefono, 40);
  const email = limpiar(datos.Email, 150);

  // Envío vacío: no molestamos tu bandeja.
  if (!nombre && !telefono && !email) {
    return paginaGracias();
  }

  guardarEnHoja(nombre, telefono, email);
  enviarAviso(nombre, telefono, email);

  return paginaGracias();
}

/**
 * Si alguien abre la dirección del programa en el navegador.
 */
function doGet() {
  return HtmlService.createHtmlOutput(
    '<p style="font:16px system-ui;padding:24px">Esta dirección solo recibe los envíos del formulario.</p>'
  );
}

function limpiar(valor, maximo) {
  return String(valor || '').trim().slice(0, maximo);
}

/**
 * Deja constancia de cada contacto en la hoja de cálculo, para que no se
 * pierda ninguno aunque un correo falle.
 */
function guardarEnHoja(nombre, telefono, email) {
  try {
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (hoja.getLastRow() === 0) {
      hoja.appendRow(['Fecha', 'Nombre', 'Teléfono', 'Email']);
      hoja.getRange(1, 1, 1, 4).setFontWeight('bold');
      hoja.setFrozenRows(1);
    }
    hoja.appendRow([new Date(), nombre, telefono, email]);
  } catch (error) {
    // El correo es lo prioritario: si la hoja falla, seguimos adelante.
    console.error('No se pudo guardar en la hoja: ' + error);
  }
}

/**
 * Te manda el aviso por correo. Sale de tu cuenta de Google, así que tu
 * servidor de correo no lo trata como un remitente desconocido.
 */
function enviarAviso(nombre, telefono, email) {
  const filas = [
    ['Nombre', nombre],
    ['Teléfono', telefono],
    ['Email', email]
  ];

  const cuerpo =
    '<div style="font:16px/1.5 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#16181d">' +
    '<h2 style="margin:0 0 4px">Nuevo contacto desde la web</h2>' +
    '<p style="margin:0 0 20px;color:#6b7280">' +
      Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "d 'de' MMMM 'a las' HH:mm") +
    '</p>' +
    '<table cellpadding="10" cellspacing="0" style="border-collapse:collapse;border:1px solid #e3e5ea">' +
    filas.map(function (fila) {
      return '<tr>' +
        '<td style="border:1px solid #e3e5ea;background:#f7f8fa;font-weight:600">' + escapar(fila[0]) + '</td>' +
        '<td style="border:1px solid #e3e5ea">' + (escapar(fila[1]) || '—') + '</td>' +
        '</tr>';
    }).join('') +
    '</table>' +
    (email ? '<p style="margin:20px 0 0;color:#6b7280">Puedes responder a este correo y le llegará directamente.</p>' : '') +
    '</div>';

  const opciones = {
    to: DESTINO,
    subject: 'Nuevo contacto: ' + (nombre || 'sin nombre'),
    htmlBody: cuerpo,
    name: 'Formulario web'
  };

  // Así, al pulsar "Responder", contestas a la persona y no a ti mismo.
  if (email) {
    opciones.replyTo = email;
  }

  MailApp.sendEmail(opciones);
}

function escapar(texto) {
  return String(texto || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Lo que ve la persona que ha enviado el formulario si su navegador no
 * puede quedarse en la página (por ejemplo, sin JavaScript).
 */
function paginaGracias() {
  return HtmlService.createHtmlOutput(
    '<div style="font:16px/1.5 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;' +
    'text-align:center;padding:48px 20px;color:#16181d">' +
    '<div style="font-size:40px;color:#16a36a">&#10003;</div>' +
    '<h1 style="margin:8px 0">¡Gracias por contactarnos!</h1>' +
    '<p style="color:#6b7280">Hemos recibido tus datos y te escribiremos muy pronto.</p>' +
    '<p><a href="' + WEB + '" style="color:#3b5bfd">Volver</a></p>' +
    '</div>'
  ).setTitle('¡Gracias por contactarnos!');
}
