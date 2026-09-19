/**
 * Validación y envío del formulario de contacto.
 *
 * El correo de destino NO se configura aquí: sale del atributo "action" del
 * formulario en index.html. Este script solo lo convierte en el endpoint AJAX
 * para poder enviar sin recargar la página.
 */
(function () {
  'use strict';

  var form = document.getElementById('form');
  var statusEl = document.getElementById('status');
  var successEl = document.getElementById('success');
  var submitBtn = document.getElementById('submit');
  var nextUrl = document.getElementById('next-url');

  // Página de gracias para navegadores sin JavaScript (envío clásico).
  if (nextUrl && /^https?:$/.test(location.protocol)) {
    nextUrl.value = new URL('gracias.html', location.href).href;
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
    errorEl.textContent = message || '';
    if (message) {
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.removeAttribute('aria-invalid');
    }
  }

  function validate(field) {
    var value = document.getElementById(field.id).value.trim();
    if (!value) { setError(field, field.required); return false; }
    if (!field.test(value)) { setError(field, field.invalid); return false; }
    setError(field, '');
    return true;
  }

  // Limpia el error en cuanto la persona corrige el campo.
  FIELDS.forEach(function (field) {
    var input = document.getElementById(field.id);
    input.addEventListener('blur', function () { validate(field); });
    input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true') { validate(field); }
    });
  });

  function ajaxEndpoint() {
    // https://formsubmit.co/correo  ->  https://formsubmit.co/ajax/correo
    return form.action.replace(/formsubmit\.co\/(?!ajax\/)/, 'formsubmit.co/ajax/');
  }

  function sending(on) {
    submitBtn.disabled = on;
    submitBtn.classList.toggle('is-sending', on);
    submitBtn.querySelector('.btn__label').textContent = on ? 'Enviando…' : 'Enviar';
  }

  form.addEventListener('submit', function (event) {
    // Valida todos los campos y enfoca el primero con error.
    var firstInvalid = null;
    FIELDS.forEach(function (field) {
      if (!validate(field) && !firstInvalid) { firstInvalid = field; }
    });

    if (firstInvalid) {
      event.preventDefault();
      document.getElementById(firstInvalid.id).focus();
      return;
    }

    // A partir de aquí enviamos por AJAX; si algo falla, avisamos sin perder
    // los datos que la persona ya escribió.
    event.preventDefault();
    statusEl.textContent = '';
    sending(true);

    fetch(ajaxEndpoint(), {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    })
      .then(function (response) {
        if (!response.ok) { throw new Error('HTTP ' + response.status); }
        return response.json();
      })
      .then(function (data) {
        if (String(data.success) !== 'true') {
          throw new Error(data.message || 'Envío rechazado');
        }
        form.hidden = true;
        successEl.hidden = false;
        successEl.querySelector('h2').focus();
      })
      .catch(function () {
        statusEl.textContent =
          'No pudimos enviar el formulario. Revisa tu conexión e inténtalo de nuevo.';
      })
      .then(function () {
        sending(false);
      });
  });

  document.getElementById('again').addEventListener('click', function () {
    form.reset();
    FIELDS.forEach(function (field) { setError(field, ''); });
    successEl.hidden = true;
    form.hidden = false;
    document.getElementById('nombre').focus();
  });
})();
