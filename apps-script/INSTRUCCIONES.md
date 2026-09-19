# Cómo montar el envío desde tu propia cuenta de Google

Unos 5 minutos. Al terminar, cada persona que rellene el formulario te llegará
por correo **enviado desde tu cuenta de Gmail** (así tu servidor no lo rechaza)
y además quedará anotada en una hoja de cálculo tuya.

Hazlo con la sesión de **zurbaranf@gmail.com** iniciada.

## 1. Crea la hoja donde se guardarán los contactos

Entra en **https://sheets.new** — se crea una hoja de cálculo en blanco.
Ponle un nombre arriba a la izquierda, por ejemplo `Contactos web`.

## 2. Abre el editor de programas

En el menú de la hoja: **Extensiones → Apps Script**.
Se abre una pestaña nueva con un editor de código.

## 3. Pega el programa

Borra todo lo que veas en el editor (normalmente unas líneas que ponen
`function myFunction() {}`) y pega en su lugar **todo el contenido del archivo
`Codigo.gs`**.

Pulsa el icono del disquete para guardar (o Ctrl+S).

## 4. Publícalo

1. Arriba a la derecha, botón azul **Implementar → Nueva implementación**.
2. Pulsa la rueda dentada que hay junto a *Seleccionar tipo* y elige
   **Aplicación web**.
3. Rellena así:
   - *Descripción*: `Formulario de contacto` (da igual lo que pongas)
   - *Ejecutar como*: **Yo (zurbaranf@gmail.com)**
   - *Quién tiene acceso*: **Cualquier usuario** ← importante, si no, los
     visitantes no podrán enviar
4. Pulsa **Implementar**.

## 5. Dale permiso (solo la primera vez)

Google te pedirá autorizar el programa:

1. **Autorizar acceso** → elige tu cuenta de Google.
2. Aparecerá un aviso: *"Google no ha verificado esta aplicación"*. Es normal:
   el programa es tuyo y no está publicado en la tienda de Google.
   Pulsa **Configuración avanzada** (abajo a la izquierda) y luego
   **Ir a Contactos web (no seguro)**.
3. Pulsa **Permitir**.

Le estás dando permiso a tu propio programa para enviar correo en tu nombre y
escribir en tu hoja de cálculo. Nada más.

## 6. Copia la dirección y pásamela

Al terminar verás **URL de la aplicación web**, algo parecido a:

```
https://script.google.com/macros/s/AKfycbx...largo.../exec
```

Cópiala y pásamela: yo conecto el formulario a esa dirección y lo dejo
funcionando.

---

## Si algún día cambias el programa

Los cambios no se aplican hasta que vuelves a publicar:
**Implementar → Gestionar implementaciones →** icono del lápiz **→ Versión:
Nueva versión → Implementar**. La dirección `/exec` sigue siendo la misma.

## Límite

Una cuenta gratuita de Gmail puede enviar unos 100 correos al día con este
sistema. De sobra para un formulario de contacto.
