# Sync Connect · WhatsApp local

Versión local de la bandeja de WhatsApp con QR, CRM, respuestas asistidas por OpenAI y Gemini, y avisos para consultas sin respuesta confirmada.

## Probar en este computador

1. Abre `Iniciar-CRM.bat` y deja abierta la ventana de consola.
2. El panel abre en http://127.0.0.1:3030/ . Si no abre solo, copia ese enlace en Chrome.
3. En **Configuración → Inteligencia artificial**, puedes añadir varias claves para OpenAI y Gemini, ajustar sus modelos y elegir cuál se intenta primero. Si un proveedor falla por cuota, autenticación o conexión, se intenta el siguiente proveedor y sus claves.
4. Completa los datos reales del negocio en `business.json` antes de usar el bot con clientes.
5. En WhatsApp del teléfono: **Dispositivos vinculados → Vincular un dispositivo**. Escanea el QR que aparece en la bandeja.
6. Prueba desde otro número. Si falta información, el bot responde que una persona confirmará y deja la consulta en **Requiere respuesta**.
7. Para compartir una muestra, configura el **Enlace de una demo pública** en Configuración. Si no tienes una, el bot puede pedir los datos de un negocio y mandar por WhatsApp una muestra personalizada como archivo HTML. Si el cliente comparte una web pública, intenta usar su título y descripción para prepararla.

Para detener el servidor, cierra la ventana `Sync Connect WhatsApp` o pulsa `Ctrl+C` en ella. La clave (`.env`), los datos del negocio (`business.json`), las alertas (`data/`) y la sesión vinculada (`auth/`) se guardan localmente y están excluidos de Git.

## Notas

Esta conexión usa Baileys para enlazar mediante QR; es un protocolo no oficial de WhatsApp y la cuenta puede estar sujeta a restricciones. Las API de OpenAI y Gemini tienen sus propias claves, cuotas y facturación; una suscripción de ChatGPT no incluye crédito de API.
# whtasapp-openso-boot
# whtasapp-openso-boot
# whtasapp-openso-boot
# whtasapp-openso-boot
