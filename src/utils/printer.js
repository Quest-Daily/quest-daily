const ESC = 0x1B
const GS  = 0x1D
const LF  = 0x0A

let port   = null
let writer = null

export function isSupported() {
  return 'serial' in navigator
}

export function isConnected() {
  return port !== null
}

export async function autoConnect() {
  if (!isSupported()) return false
  try {
    const ports = await navigator.serial.getPorts()
    if (ports.length === 0) return false
    port = ports[0]
    await port.open({ baudRate: 9600 })
    writer = port.writable.getWriter()
    return true
  } catch (e) {
    port   = null
    writer = null
    return false
  }
}

export async function connect() {
  if (!isSupported()) {
    return { ok: false, error: 'Web Serial API not supported. Use Chrome or Edge.' }
  }
  try {
    port = await navigator.serial.requestPort()
    await port.open({ baudRate: 9600 })
    writer = port.writable.getWriter()
    return { ok: true }
  } catch (e) {
    port   = null
    writer = null
    if (e.name === 'NotFoundError') return { ok: false, error: null }
    return { ok: false, error: e.message }
  }
}

export async function disconnect() {
  try {
    if (writer) { writer.releaseLock(); writer = null }
    if (port)   { await port.close();   port   = null }
  } catch (_) {}
}

// ── ESC/POS helpers ──────────────────────────────────────────────────────────

const enc = new TextEncoder()

function b(...bytes) { return bytes }
function t(str)      { return [...enc.encode(str)] }
function ln(str = '') { return [...t(str), LF] }
function div()        { return ln('------------------------------------------') }

async function send(parts) {
  if (!writer) return
  const bytes = parts.flat(Infinity)
  try {
    await writer.write(new Uint8Array(bytes))
  } catch (e) {
    console.warn('Print failed:', e.message)
    writer = null
    port   = null
  }
}

function now() {
  return new Date().toLocaleTimeString('en-AU', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

// ── Receipt formats ───────────────────────────────────────────────────────────

export async function printQuestComplete({ childName, questTitle, ticketsEarned, totalTickets }) {
  await send([
    b(ESC, 0x40),          // init
    b(ESC, 0x61, 0x01),    // center align
    ln(),
    b(ESC, 0x45, 0x01),    // bold on
    ln('* QUEST DAILY *'),
    b(ESC, 0x45, 0x00),    // bold off
    div(),
    ln('QUEST COMPLETE!'),
    ln(),
    b(ESC, 0x45, 0x01),
    ln(childName),
    b(ESC, 0x45, 0x00),
    ln(questTitle),
    ln(),
    div(),
    b(ESC, 0x45, 0x01),
    ln(`+${ticketsEarned} tickets earned`),
    b(ESC, 0x45, 0x00),
    ln(`Total: ${totalTickets} tickets`),
    ln(now()),
    ln(), ln(), ln(), ln(),
    b(GS, 0x56, 0x00),     // full cut
  ])
}

export async function printSectionDone({ childName, section, totalTickets }) {
  const label = section.charAt(0).toUpperCase() + section.slice(1)
  await send([
    b(ESC, 0x40),
    b(ESC, 0x61, 0x01),
    ln(),
    b(ESC, 0x45, 0x01),
    ln('* QUEST DAILY *'),
    b(ESC, 0x45, 0x00),
    div(),
    b(GS, 0x21, 0x11),     // double size
    b(ESC, 0x45, 0x01),
    ln('ALL DONE!'),
    b(GS, 0x21, 0x00),     // normal size
    b(ESC, 0x45, 0x00),
    ln(),
    b(ESC, 0x45, 0x01),
    ln(childName),
    b(ESC, 0x45, 0x00),
    ln(`finished all ${label} quests!`),
    ln(),
    div(),
    ln(`Total: ${totalTickets} tickets`),
    ln(now()),
    ln(), ln(), ln(), ln(),
    b(GS, 0x56, 0x00),
  ])
}

export async function printRedemption({ childName, itemTitle, ticketPrice, remainingTickets }) {
  await send([
    b(ESC, 0x40),
    b(ESC, 0x61, 0x01),
    ln(),
    b(ESC, 0x45, 0x01),
    ln('* QUEST DAILY *'),
    b(ESC, 0x45, 0x00),
    div(),
    ln('REDEMPTION RECEIPT'),
    div(),
    b(ESC, 0x45, 0x01),
    ln(childName),
    b(ESC, 0x45, 0x00),
    ln('redeemed:'),
    ln(),
    b(ESC, 0x45, 0x01),
    ln(itemTitle),
    b(ESC, 0x45, 0x00),
    ln(),
    div(),
    ln(`Cost: ${ticketPrice} tickets`),
    ln(`Remaining: ${remainingTickets} tickets`),
    ln(now()),
    ln(), ln(), ln(), ln(),
    b(GS, 0x56, 0x00),
  ])
}
