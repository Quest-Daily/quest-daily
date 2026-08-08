function nowDateTime() {
  const d = new Date()
  const date = d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
  const time = d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: true })
  return `${date} · ${time}`
}

function openReceipt(html) {
  const win = window.open('', '_blank', 'width=380,height=520,toolbar=0,menubar=0,location=0,scrollbars=0')
  if (!win) return
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Courier New', monospace; font-size: 13px; width: 72mm; color: #000; padding: 4mm 4mm 6mm; }
  .c  { text-align: center; }
  .b  { font-weight: bold; }
  .sm { font-size: 10.5px; }
  .gap    { height: 7px; }
  .gap-sm { height: 3px; }
  .solid  { border: none; border-top: 1px solid #000; margin: 6px 0; }
  .row    { display: flex; justify-content: space-between; }
  .eq     { text-align: center; font-size: 11px; letter-spacing: 1px; margin: 4px 0; }
</style>
</head><body>${html}
<script>
window.onload = function() {
  var h = document.body.scrollHeight;
  var heightMm = Math.max(Math.ceil(h * 25.4 / 96) + 5, 90);
  var s = document.createElement('style');
  s.textContent = '@page { size: 80mm ' + heightMm + 'mm; margin: 0; }';
  document.head.appendChild(s);
  window.print();
  setTimeout(function() { window.close(); }, 600);
}
</script>
</body></html>`)
  win.document.close()
}

export function printQuestComplete({ childName, questTitle, ticketsEarned, totalTickets, sectionDone, section }) {
  openReceipt(`
    <div class="c">&#x2694;&nbsp;&nbsp;QUEST DAILY&nbsp;&nbsp;&#x2694;</div>
    <hr class="solid">
    <div class="c b">QUEST COMPLETE!</div>
    <hr class="solid">
    <div class="gap"></div>
    <div class="c b">${childName}</div>
    <div class="c">${questTitle}</div>
    <div class="gap"></div>
    <div class="c sm">${nowDateTime()}</div>
    <div class="gap"></div>
    <div class="eq">==========================</div>
    <div class="c">Tickets earned &nbsp;<span class="b">${ticketsEarned} 🎟</span></div>
    <div class="c">Total tickets &nbsp;<span class="b">${totalTickets} 🎟</span></div>
    <div class="eq">==========================</div>
    ${sectionDone ? `<div class="gap"></div><div class="c b">★ All ${section} quests done! ★</div>` : ''}
  `)
}

export function printSectionDone() {}

export function printRedemption({ childName, itemTitle, ticketPrice, remainingTickets }) {
  openReceipt(`
    <div class="c">&#x2694;&nbsp;&nbsp;QUEST DAILY&nbsp;&nbsp;&#x2694;</div>
    <hr class="solid">
    <div class="c b">REWARD REDEEMED!</div>
    <hr class="solid">
    <div class="gap"></div>
    <div class="c b">${childName}</div>
    <div class="c">${itemTitle}</div>
    <div class="gap"></div>
    <div class="c sm">${nowDateTime()}</div>
    <div class="gap"></div>
    <div class="eq">==========================</div>
    <div class="c">Tickets spent &nbsp;<span class="b">${ticketPrice} 🎟</span></div>
    <div class="c">Remaining &nbsp;<span class="b">${remainingTickets} 🎟</span></div>
    <div class="eq">==========================</div>
  `)
}

export function isSupported() { return false }
export function isConnected() { return false }
export async function autoConnect() { return false }
export async function connect() { return { ok: false } }
export async function disconnect() {}
