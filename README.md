# Sync Connect · WhatsApp local

Versión local de la bandeja de WhatsApp con QR, respuestas asistidas por OpenAI y avisos para consultas sin respuesta confirmada.

## Probar en este computador

1. Abre `Iniciar-CRM.bat` y deja abierta la ventana de consola.
2. El panel abre en http://127.0.0.1:3030/ . Si no abre solo, copia ese enlace en Chrome.
3. Introduce o guarda la clave de OpenAI en el panel. Las claves que ya estuvieran guardadas en `OPENAI_API_KEYS_JSON` se intentan en orden si una falla por cuota, autenticación o conexión.
4. Completa los datos reales del negocio en `business.json` antes de usar el bot con clientes.
5. En WhatsApp del teléfono: **Dispositivos vinculados → Vincular un dispositivo**. Escanea el QR que aparece en la bandeja.
6. Prueba desde otro número. Si falta información, el bot responde que una persona confirmará y deja la consulta en **Requiere respuesta**.

Para detener el servidor, cierra la ventana `Sync Connect WhatsApp` o pulsa `Ctrl+C` en ella. La clave (`.env`), los datos del negocio (`business.json`), las alertas (`data/`) y la sesión vinculada (`auth/`) se guardan localmente y están excluidos de Git.

## Notas

Esta conexión usa Baileys para enlazar mediante QR; es un protocolo no oficial de WhatsApp y la cuenta puede estar sujeta a restricciones. La API de OpenAI se factura aparte de ChatGPT.
