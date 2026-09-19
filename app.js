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
  // Ojo: el id del botón no puede ser "submit", porque taparía el
  // método form.submit() que usamos como plan B.
  var submitBtn = document.getElementById('enviar') ||
    form.querySelector('button[type="submit"]');
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
    if (!submitBtn) { return; }
    submitBtn.disabled = on;
    submitBtn.classList.toggle('is-sending', on);
    var label = submitBtn.querySelector('.btn__label');
    if (label) { label.textContent = on ? 'Enviando…' : 'Enviar'; }
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

    // Intentamos enviar sin recargar la página. Preparamos todo ANTES de
    // frenar el envío del navegador: si algo fallara aquí, preferimos que lo
    // mande él a la manera de siempre antes que dejar el botón muerto.
    var peticion;
    try {
      peticion = fetch(ajaxEndpoint(), {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });
    } catch (e) {
      return; // sigue el envío normal del navegador
    }

    event.preventDefault();
    if (statusEl) { statusEl.textContent = ''; }
    sending(true);

    peticion
      .then(function (response) {
        if (!response.ok) { throw new Error('HTTP ' + response.status); }
        return response.json();
      })
      .then(function (data) {
        if (String(data.success) !== 'true') {
          throw new Error(data.message || 'Envío rechazado');
        }
        sending(false);
        form.hidden = true;
        if (successEl) {
          successEl.hidden = false;
          var titulo = successEl.querySelector('h2');
          if (titulo) { titulo.focus(); }
        }
      })
      .catch(function () {
        // El envío por AJAX no funciona mientras el correo de destino no esté
        // confirmado (y algún navegador puede bloquearlo). En ese caso enviamos
        // el formulario a la manera clásica: el navegador va a FormSubmit, que
        // se encarga de la confirmación y después devuelve a gracias.html.
        if (navigator.onLine === false) {
          if (statusEl) {
            statusEl.textContent =
              'Parece que no hay conexión. Inténtalo de nuevo cuando vuelvas a tener internet.';
          }
          sending(false);
          return;
        }
        if (statusEl) { statusEl.textContent = 'Completando el envío…'; }
        // form.submit() no dispara el evento 'submit', así que no vuelve aquí.
        form.submit();
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
