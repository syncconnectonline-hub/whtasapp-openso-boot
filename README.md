# WhatsApp CRM local

Panel CRM local para atender conversaciones de WhatsApp, organizar contactos y responder preguntas del negocio con OpenAI.

## Iniciar

1. Instala Node.js 20 o superior desde [nodejs.org](https://nodejs.org/).
2. Haz doble clic en `Iniciar-CRM.bat`. La primera vez instala las dependencias si hacen falta, inicia el servidor y abre el panel.
3. Si el navegador no se abre, visita [http://127.0.0.1:3008](http://127.0.0.1:3008).
4. En **Configuración**, completa la información real del negocio y tus claves API de OpenAI.
5. Desde WhatsApp en el celular, abre **Dispositivos vinculados → Vincular un dispositivo** y escanea el QR que aparece en el CRM.

## Funciones

- Bandeja de conversaciones con búsqueda y filtros.
- Ficha CRM por contacto, con etapa, etiquetas y notas guardadas localmente.
- Pipeline, lista de contactos y cola de preguntas sin resolver.
- Respuestas de OpenAI basadas en la información que guardes del negocio. Puedes guardar varias claves de OpenAI (una por línea); si una llega al límite/cuota o es rechazada por autenticación, el sistema intenta la siguiente.
- Respuesta automática a consultas de cotización con el mensaje y el enlace web configurados.
- Notificación de preguntas sin resolver al teléfono de avisos, si lo configuras.
- Configuración de nombre, horarios, dirección, precios, preguntas frecuentes y clave API.
- **Cerrar sesión** desvincula el dispositivo; **Volver a conectar** permite escanear otro QR.

Sin clave y datos del negocio, no se pueden responder consultas reales con precisión. Las claves quedan guardadas localmente en `.env` (excluido de Git); no las compartas. Para continuidad real, las claves deben tener cuota disponible y facturación habilitada; varias claves del mismo proyecto/cuenta no duplican su cuota. Los datos del negocio y CRM se guardan en archivos locales.

## Privacidad y uso

El servidor está configurado para escuchar solo en `127.0.0.1`. Para detenerlo, pulsa `Ctrl+C` en la ventana que abrió el archivo `Iniciar-CRM.bat`.

Baileys conecta con WhatsApp mediante un protocolo no oficial, sin abrir una ventana secundaria; el QR aparece dentro del panel CRM. Usa con prudencia y revisa las condiciones vigentes de WhatsApp. El consumo de la API de OpenAI puede generar cargos independientes de ChatGPT.
