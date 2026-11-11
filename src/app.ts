import { createRequire } from 'node:module'

// BuilderBot 1.4.4 publishes its CommonJS entry point; load that entry explicitly.
const require = createRequire(import.meta.url)
const { createBot, createProvider, createFlow, addKeyword, MemoryDB } = require('@builderbot/bot')
const { BaileysProvider } = require('@builderbot/provider-baileys')

const PORT = Number(process.env.PORT ?? 3008)

const helloFlow = addKeyword(['hola', 'buenas', 'hello', 'hi'])
    .addAnswer('¡Hola! 👋 Este es un bot de prueba. Ya podremos configurarlo con la información de tu negocio.')

async function main() {
    const adapterFlow = createFlow([helloFlow])
    const adapterProvider = createProvider(BaileysProvider)
    const adapterDB = new MemoryDB()

    const { httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    httpServer(PORT)
    console.log(`Bot iniciado en el puerto ${PORT}. Escanea el QR que aparece aquí con WhatsApp.`)
}

main().catch((error) => {
    console.error('No se pudo iniciar el bot:', error)
    process.exitCode = 1
})
