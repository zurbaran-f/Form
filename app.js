/**
 * Validación y envío del formulario de contacto.
 *
 * El destino de los correos NO se configura aquí: sale del atributo "action"
 * del formulario, en index.html.
 *
 * Cómo se envía: el formulario entrega sus datos dentro de un marco invisible.
 * Así el navegador manda exactamente lo mismo que un formulario normal —el
 * formato que el servicio sabe leer— y la persona no sale de la página.
 */
(function () {
  'use strict';

  var form = document.getElementById('form');
  if (!form) { return; }

  var statusEl = document.getElementById('status');
  var successEl = document.getElementById('success');
  var submitBtn = document.getElementById('enviar') ||
    form.querySelector('button[type="submit"]');
  var nextUrl = document.getElementById('next-url');

  // Página de gracias para quien envíe sin JavaScript. Se escribe en el
  // atributo (y no solo en la propiedad) para que sobreviva a form.reset().
  if (nextUrl && /^https?:$/.test(location.protocol)) {
    nextUrl.setAttribute('value', new URL('gracias.html', location.href).href);
  }

  var FIELDS = [
    {
      id: 'nombre',
      required: 'Escribe tu nombre.',
      test: function (v) { return v.length >= 2; },
      invalid: 'El nombre es demasiado corto.'
    },
    {
      id: 'telefono',
      required: 'Escribe tu teléfono.',
      // Al menos 7 dígitos; admite +, espacios, guiones y paréntesis.
      test: function (v) {
        return /^[+()\d\s.-]+$/.test(v) && (v.replace(/\D/g, '').length >= 7);
      },
      invalid: 'Introduce un teléfono válido (mínimo 7 dígitos).'
    },
    {
      id: 'email',
      required: 'Escribe tu correo electrónico.',
      test: function (v) { return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v); },
      invalid: 'Introduce un correo electrónico válido.'
    }
  ];

  function setError(field, message) {
    var input = document.getElementById(field.id);
    var errorEl = document.getElementById('err-' + field.id);
    if (errorEl) { errorEl.textContent = message || ''; }
    if (!input) { return; }
    if (message) {
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.removeAttribute('aria-invalid');
    }
  }

  function validate(field) {
    var input = document.getElementById(field.id);
    if (!input) { return true; }
    var value = input.value.trim();
    if (!value) { setError(field, field.required); return false; }
    if (!field.test(value)) { setError(field, field.invalid); return false; }
    setError(field, '');
    return true;
  }

  // Limpia el error en cuanto la persona corrige el campo.
  FIELDS.forEach(function (field) {
    var input = document.getElementById(field.id);
    if (!input) { return; }
    input.addEventListener('blur', function () { validate(field); });
    input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true') { validate(field); }
    });
  });

  function sending(on) {
    if (!submitBtn) { return; }
    submitBtn.disabled = on;
    submitBtn.classList.toggle('is-sending', on);
    var label = submitBtn.querySelector('.btn__label');
    if (label) { label.textContent = on ? 'Enviando…' : 'Enviar'; }
  }

  // Marco invisible que recibe la respuesta del servicio. Si no se pudiera
  // crear, el formulario se envía como siempre (cambiando de página) en vez
  // de quedarse sin hacer nada.
  var marco = null;
  try {
    marco = document.createElement('iframe');
    marco.name = 'envio-formulario';
    marco.title = 'Envío del formulario';
    marco.setAttribute('aria-hidden', 'true');
    marco.style.position = 'absolute';
    marco.style.width = '1px';
    marco.style.height = '1px';
    marco.style.border = '0';
    marco.style.opacity = '0';
    marco.style.left = '-9999px';
    document.body.appendChild(marco);
    form.setAttribute('target', 'envio-formulario');
  } catch (e) {
    marco = null;
  }

  var enviando = false;
  var espera = null;

  function mostrarGracias() {
    sending(false);
    if (statusEl) { statusEl.textContent = ''; }
    form.reset();
    FIELDS.forEach(function (field) { setError(field, ''); });
    form.hidden = true;
    if (successEl) {
      successEl.hidden = false;
      var titulo = successEl.querySelector('h2');
      if (titulo) { titulo.focus(); }
    }
  }

  if (marco) {
    marco.addEventListener('load', function () {
      // El marco también dispara 'load' al crearse: solo nos interesa
      // cuando hay un envío en marcha.
      if (!enviando) { return; }
      enviando = false;
      clearTimeout(espera);
      mostrarGracias();
    });
  }

  form.addEventListener('submit', function (event) {
    // Valida todos los campos y enfoca el primero con error.
    var firstInvalid = null;
    FIELDS.forEach(function (field) {
      if (!validate(field) && !firstInvalid) { firstInvalid = field; }
    });

    if (firstInvalid) {
      event.preventDefault();
      var input = document.getElementById(firstInvalid.id);
      if (input) { input.focus(); }
      return;
    }

    // Sin marco, dejamos que el navegador envíe cambiando de página.
    if (!marco) { return; }

    // Aquí NO frenamos el envío: el navegador lo manda al marco invisible.
    enviando = true;
    if (statusEl) { statusEl.textContent = ''; }
    sending(true);

    clearTimeout(espera);
    espera = setTimeout(function () {
      if (!enviando) { return; }
      enviando = false;
      sending(false);
      if (statusEl) {
        statusEl.textContent =
          'Está tardando más de lo normal. Comprueba tu conexión e inténtalo de nuevo.';
      }
    }, 25000);
  });

  var otro = document.getElementById('again');
  if (otro) {
    otro.addEventListener('click', function () {
      if (successEl) { successEl.hidden = true; }
      form.hidden = false;
      var primero = document.getElementById('nombre');
      if (primero) { primero.focus(); }
    });
  }
})();
