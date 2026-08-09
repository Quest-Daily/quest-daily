const LOGO_SVG = `<svg width="18" height="18" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g transform="rotate(15,50,50)">
    <polygon points="50,12 47.5,16.5 44,63 56,63 52.5,16.5" fill="#3a1860"/>
    <rect x="29" y="63" width="42" height="8.5" rx="4.25" fill="#c090e8"/>
    <rect x="47" y="71.5" width="6" height="14" rx="3" fill="#d8b4f8"/>
    <ellipse cx="50" cy="90" rx="9" ry="5.5" fill="#3a1860"/>
  </g>
  <polygon transform="translate(19,78)" points="0,-4.5 1.05,-1.55 4.28,-1.4 1.75,0.6 2.65,3.8 0,2.1 -2.65,3.8 -1.75,0.6 -4.28,-1.4 -1.05,-1.55" fill="#e0c030"/>
</svg>`

function nowDateTime() {
  const d = new Date()
  const date = d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()
  const time = d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()
  return `${date} · ${time}`
}

function openReceipt(html) {
  const win = window.open('', '_blank', 'width=380,height=600,toolbar=0,menubar=0,location=0,scrollbars=0')
  if (!win) return
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: fit-content; }
  body { font-family: 'Space Mono', monospace; font-size: 11px; width: 72mm; color: #000; padding: 5mm 4mm 6mm; }
  .c     { text-align: center; }
  .b     { font-weight: 700; }
  .serif { font-family: 'DM Serif Display', serif; }
  .muted { color: #555; }
  .xs    { font-size: 9px; }
  .gap    { height: 7px; }
  .gap-sm { height: 3px; }
  .solid  { border: none; border-top: 1.5px solid #000; margin: 8px 0; }
  .dash   { border: none; border-top: 1px dashed #999; margin: 6px 0; }
  .row    { display: flex; justify-content: space-between; align-items: baseline; margin: 5px 0; }
</style>
</head><body>${html}
<script>
document.fonts.ready.then(function() {
  window.print();
  setTimeout(function() { window.close(); }, 600);
});
</script>
</body></html>`)
  win.document.close()
}

export function printQuestComplete({ childName, questTitle, ticketsEarned, totalTickets, sectionDone, section }) {
  openReceipt(`
    <div class="c serif" style="font-size:22px">Quest Daily</div>
    <div class="c xs b" style="letter-spacing:0.18em; margin-top:3px">QUEST COMPLETE</div>
    <hr class="solid">
    <div class="xs muted" style="letter-spacing:0.06em">${nowDateTime()}</div>
    <div class="gap-sm"></div>
    <div class="serif b" style="font-size:26px; line-height:1.1">${childName}</div>
    <div class="gap-sm"></div>
    <div><span class="b">&#x2726; Quest complete:</span> ${questTitle}</div>
    <hr class="dash">
    <div class="row">
      <span class="xs b" style="letter-spacing:0.12em">TICKETS EARNED</span>
      <span class="serif b" style="font-size:20px; line-height:1">${ticketsEarned}</span>
    </div>
    <div class="row">
      <span class="xs b" style="letter-spacing:0.12em">BANK TOTAL</span>
      <span class="serif b" style="font-size:20px; line-height:1">${totalTickets}</span>
    </div>
    <hr class="dash">
    <div class="c xs b" style="letter-spacing:0.16em; margin: 5px 0 4px">NICE WORK, ${childName.toUpperCase()}!</div>
    <div class="c">${LOGO_SVG}</div>
    ${sectionDone ? `<div class="gap-sm"></div><div class="c xs b" style="letter-spacing:0.12em">&#x2605; ALL ${section.toUpperCase()} QUESTS DONE! &#x2605;</div>` : ''}
  `)
}

export function printSectionDone() {}

export function printRedemption({ childName, itemTitle, ticketPrice, remainingTickets }) {
  openReceipt(`
    <div class="c serif" style="font-size:22px">Quest Daily</div>
    <div class="c xs b" style="letter-spacing:0.18em; margin-top:3px">REWARD REDEEMED</div>
    <hr class="solid">
    <div class="xs muted" style="letter-spacing:0.06em">${nowDateTime()}</div>
    <div class="gap-sm"></div>
    <div class="serif b" style="font-size:26px; line-height:1.1">${childName}</div>
    <div class="gap-sm"></div>
    <div><span class="b">&#x2726; Reward:</span> ${itemTitle}</div>
    <hr class="dash">
    <div class="row">
      <span class="xs b" style="letter-spacing:0.12em">TICKETS SPENT</span>
      <span class="serif b" style="font-size:20px; line-height:1">${ticketPrice}</span>
    </div>
    <div class="row">
      <span class="xs b" style="letter-spacing:0.12em">BANK TOTAL</span>
      <span class="serif b" style="font-size:20px; line-height:1">${remainingTickets}</span>
    </div>
    <hr class="dash">
    <div class="c xs b" style="letter-spacing:0.16em; margin: 5px 0 4px">ENJOY, ${childName.toUpperCase()}!</div>
    <div class="c">${LOGO_SVG}</div>
  `)
}

export function isSupported() { return false }
export function isConnected() { return false }
export async function autoConnect() { return false }
export async function connect() { return { ok: false } }
export async function disconnect() {}
