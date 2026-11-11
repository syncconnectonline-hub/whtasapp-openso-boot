import 'dotenv/config'
import express from 'express'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { Server as SocketServer } from 'socket.io'
import OpenAI from 'openai'
import QRCode from 'qrcode'
import pino from 'pino'
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys'
import businessData from '../business.json' with { type: 'json' }

const here = path.dirname(fileURLToPath(import.meta.url))
const flutterBuild = path.join(here, '../flutter_app/build/web')
const webRoot = existsSync(flutterBuild) ? flutterBuild : path.join(here, '../public')
const app = express()
const server = http.createServer(app)
const io = new SocketServer(server)
const port = Number(process.env.PORT || 3030)
const business = { ...businessData, name: businessData.name || businessData.businessName || 'Sync Connect' }
function readOpenAIKeys() {
  const keys = []
  const raw = process.env.OPENAI_API_KEYS_JSON
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) keys.push(...parsed)
    } catch {
      keys.push(...raw.split(/[\r\n,]+/))
    }
  }
  if (process.env.OPENAI_API_KEY) keys.push(process.env.OPENAI_API_KEY)
  return [...new Set(keys.map((key) => String(key).trim()).filter((key) => key.startsWith('sk-')))]
}
let openaiKeys = readOpenAIKeys()
let openai = openaiKeys.length ? new OpenAI({ apiKey: openaiKeys[0], maxRetries: 0 }) : null
const chats = new Map()
const dataDir = path.join(here, '../data')
const alertsPath = path.join(dataDir, 'alerts.json')
mkdirSync(dataDir, { recursive: true })
let unreadQuestions = []
try { unreadQuestions = JSON.parse(readFileSync(alertsPath, 'utf8')) } catch {}
let waStatus = 'Esperando conexión…'
let currentQr = null
let socket

app.use(express.static(webRoot))
app.use(express.json({ limit: '2kb' }))
app.get('/api/state', (_req, res) => res.json({ waStatus, currentQr, chats: [...chats.values()], unreadQuestions, apiConfigured: Boolean(openai) }))
app.post('/api/settings/openai', (req, res) => {
  const origin = req.get('origin')
  const remote = req.socket.remoteAddress
  if (origin !== `http://127.0.0.1:${port}` || !['127.0.0.1', '::ffff:127.0.0.1', '::1'].includes(remote)) {
    return res.status(403).json({ error: 'Solo se permite configurar desde este computador.' })
  }
  const key = String(req.body?.apiKey || '').trim()
  if (!key.startsWith('sk-') || key.length < 20) return res.status(400).json({ error: 'La clave no parece válida. Revisa que comience con sk-.' })
  const envPath = path.join(here, '../.env')
  const nextKeys = [key, ...openaiKeys.filter((saved) => saved !== key)]
  const envContent = existsSync(envPath) ? readFileSync(envPath, 'utf8') : ''
  const next = /^\s*OPENAI_API_KEYS_JSON\s*=.*$/m.test(envContent)
    ? envContent.replace(/^\s*OPENAI_API_KEYS_JSON\s*=.*$/m, `OPENAI_API_KEYS_JSON=${JSON.stringify(nextKeys)}`)
    : `${envContent.trimEnd()}\nOPENAI_API_KEYS_JSON=${JSON.stringify(nextKeys)}\n`
  writeFileSync(envPath, next, { encoding: 'utf8', mode: 0o600 })
  openaiKeys = nextKeys
  openai = new OpenAI({ apiKey: key, maxRetries: 0 })
  return res.json({ saved: true })
})

function emitState() {
  io.emit('state', { waStatus, currentQr, chats: [...chats.values()], unreadQuestions, apiConfigured: Boolean(openai) })
}

function saveAlerts() {
  const tempPath = `${alertsPath}.tmp`
  writeFileSync(tempPath, JSON.stringify(unreadQuestions, null, 2), 'utf8')
  renameSync(tempPath, alertsPath)
}

function addMessage(jid, message) {
  const chat = chats.get(jid) || { id: jid, name: jid.split('@')[0], messages: [] }
  chat.messages.push(message)
  chat.updatedAt = Date.now()
  chats.set(jid, chat)
  emitState()
}

async function createOpenAIResponse(payload) {
  let lastError
  for (const key of openaiKeys) {
    try {
      return await new OpenAI({ apiKey: key, maxRetries: 0 }).responses.create(payload)
    } catch (error) {
      lastError = error
      const retryable = [401, 403, 408, 429, 500, 502, 503, 504].includes(error.status)
        || ['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'ECONNREFUSED'].includes(error.code)
      if (!retryable) throw error
    }
  }
  throw lastError || new Error('No hay claves de OpenAI configuradas.')
}

async function startWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(path.join(here, '../auth'))
  socket = makeWASocket({ auth: state, logger: pino({ level: 'silent' }), printQRInTerminal: false })
  socket.ev.on('creds.update', saveCreds)
  socket.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) currentQr = await QRCode.toDataURL(qr)
    if (connection === 'open') { waStatus = 'Conectado'; currentQr = null }
    if (connection === 'close') {
      waStatus = 'Desconectado; reconectando…'
      currentQr = null
      emitState()
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) setTimeout(startWhatsApp, 1500)
      else waStatus = 'Sesión cerrada. Borra auth/ y reinicia para volver a enlazar.'
    }
    emitState()
  })
  socket.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    for (const entry of messages) {
      if (!entry.message || entry.key.fromMe || entry.key.remoteJid === 'status@broadcast' || entry.key.remoteJid?.endsWith('@g.us')) continue
      const jid = entry.key.remoteJid
      const text = entry.message.conversation || entry.message.extendedTextMessage?.text || ''
      if (!text.trim()) continue
      const name = entry.pushName || jid.split('@')[0]
      addMessage(jid, { from: 'customer', text, at: Date.now() })
      try {
        if (!openai) throw new Error('Configura la clave de OpenAI desde el panel local.')
        const response = await createOpenAIResponse({
          model: process.env.OPENAI_MODEL || 'gpt-6-luna',
          instructions: `Eres el asistente de atención de ${business.name}. Responde en español, breve y amable. Usa exclusivamente los datos del negocio que siguen. No inventes información, precios, horarios, dirección ni funcionalidades. Si falta cualquier dato necesario para contestar, responde exactamente [REQUIERE_PERSONA]. No afirmes que algo está confirmado si no aparece aquí. Si preguntan por precio, explica que se prepara una cotización personalizada y pregunta qué necesitan.\nDATOS:\n${JSON.stringify(business)}`,
          input: text,
          max_output_tokens: 240
        })
        let answer = response.output_text?.trim() || '[REQUIERE_PERSONA]'
        if (answer.includes('[REQUIERE_PERSONA]')) {
          answer = 'Gracias por escribir a Sync Connect. Para darte una respuesta precisa, voy a consultar con una persona del equipo y te responderemos pronto.'
          unreadQuestions.push({ id: `${Date.now()}-${Math.random()}`, jid, name, question: text, at: Date.now() })
          saveAlerts()
          io.emit('needs-human', { name, question: text })
        }
        await socket.sendMessage(jid, { text: answer })
        addMessage(jid, { from: 'bot', text: answer, at: Date.now() })
      } catch (error) {
        console.error('No se pudo responder:', error.message)
        const answer = 'Gracias por escribir a Sync Connect. En este momento no puedo verificar esa información; una persona del equipo te responderá pronto.'
        unreadQuestions.push({ id: `${Date.now()}-${Math.random()}`, jid, name, question: text, at: Date.now() })
        saveAlerts()
        await socket.sendMessage(jid, { text: answer }).catch(() => {})
        addMessage(jid, { from: 'bot', text: answer, at: Date.now() })
      }
      emitState()
    }
  })
}

io.on('connection', (client) => {
  client.emit('state', { waStatus, currentQr, chats: [...chats.values()], unreadQuestions, apiConfigured: Boolean(openai) })
  client.on('dismiss-alert', (id) => {
    unreadQuestions = unreadQuestions.filter((item) => item.id !== id)
    saveAlerts()
    emitState()
  })
  client.on('send-manual', async ({ jid, text }) => {
    if (!jid || !text?.trim() || !socket) return
    await socket.sendMessage(jid, { text: text.trim() })
    addMessage(jid, { from: 'human', text: text.trim(), at: Date.now() })
  })
})

app.get(/^(?!\/api\/|\/socket\.io\/).*/, (_req, res) => res.sendFile(path.join(webRoot, 'index.html')))
server.listen(port, '127.0.0.1', () => console.log(`Panel local: http://127.0.0.1:${port}`))
if (!openai) console.warn('Falta OPENAI_API_KEY; configura la clave desde el panel local.')
startWhatsApp().catch((error) => { waStatus = `Error: ${error.message}`; emitState(); console.error(error) })
