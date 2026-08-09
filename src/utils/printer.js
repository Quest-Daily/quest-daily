const LOGO_SVG = `<svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g transform="rotate(15,50,50)">
    <polygon points="50,12 47.5,16.5 44,63 56,63 52.5,16.5" fill="#000"/>
    <rect x="29" y="63" width="42" height="8.5" rx="4.25" fill="#444"/>
    <rect x="47" y="71.5" width="6" height="14" rx="3" fill="#777"/>
    <ellipse cx="50" cy="90" rx="9" ry="5.5" fill="#111"/>
  </g>
  <polygon transform="translate(19,78)" points="0,-4.5 1.05,-1.55 4.28,-1.4 1.75,0.6 2.65,3.8 0,2.1 -2.65,3.8 -1.75,0.6 -4.28,-1.4 -1.05,-1.55" fill="#000"/>
</svg>`

function nowDateTime() {
  const d = new Date()
  const date = d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
  const time = d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: true })
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
  body { font-family: 'Space Mono', monospace; font-size: 11px; width: 72mm; color: #000; padding: 2mm 4mm 4mm; }
  .c     { text-align: center; }
  .b     { font-weight: 700; }
  .serif { font-family: 'DM Serif Display', serif; }
  .muted { color: #222; }
  .xs    { font-size: 9px; }
  .gap    { height: 5px; }
  .gap-sm { height: 2px; }
  .solid  { border: none; border-top: 1.5px solid #000; margin: 6px 0; }
  .dash   { border: none; border-top: 1px dashed #555; margin: 5px 0; }
  .split  { display: flex; align-items: stretch; }
  .split-col { flex: 1; text-align: center; padding: 3px 6px; }
  .divider { width: 1px; background: #ccc; margin: 2px 0; }
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
    <hr class="solid" style="margin-top:0">
    <div class="c" style="margin: 4px 0 2px">${LOGO_SVG}</div>
    <div class="c serif" style="font-size:15px; letter-spacing:0.03em">Quest Daily</div>
    <div class="c b xs" style="letter-spacing:0.16em; margin-top:2px">QUEST COMPLETE</div>
    <hr class="solid">
    <div class="c serif" style="font-size:17px; margin-bottom:1px">${childName}</div>
    <div class="c muted" style="font-size:10px">${questTitle}</div>
    <div class="c xs muted" style="margin-top:2px">${nowDateTime()}</div>
    <div class="gap"></div>
    <hr class="dash">
    <div class="split" style="padding: 4px 0">
      <div class="split-col">
        <div class="xs muted" style="margin-bottom:4px">tickets earned<br>for quest</div>
        <div class="b" style="font-size:11px">${ticketsEarned}</div>
      </div>
      <div class="divider"></div>
      <div class="split-col">
        <div class="xs muted" style="margin-bottom:4px">total tickets<br>in the bank</div>
        <div class="b" style="font-size:11px">${totalTickets}</div>
      </div>
    </div>
    <hr class="dash">
    <div class="c xs b" style="letter-spacing:0.16em; margin: 4px 0 3px">NICE WORK, ${childName.toUpperCase()}!</div>
    <div class="c" style="margin-top:2px">${LOGO_SVG}</div>
    ${sectionDone ? `<div class="gap-sm"></div><div class="c xs b" style="letter-spacing:0.12em">&#x2605; ALL ${section.toUpperCase()} QUESTS DONE! &#x2605;</div>` : ''}
  `)
}

export function printSectionDone() {}

export function printRedemption({ childName, itemTitle, ticketPrice, remainingTickets }) {
  openReceipt(`
    <hr class="solid" style="margin-top:0">
    <div class="c" style="margin: 4px 0 2px">${LOGO_SVG}</div>
    <div class="c serif" style="font-size:15px; letter-spacing:0.03em">Quest Daily</div>
    <div class="c b xs" style="letter-spacing:0.16em; margin-top:2px">REWARD REDEEMED</div>
    <hr class="solid">
    <div class="c serif" style="font-size:17px; margin-bottom:1px">${childName}</div>
    <div class="c muted" style="font-size:10px">${itemTitle}</div>
    <div class="c xs muted" style="margin-top:2px">${nowDateTime()}</div>
    <div class="gap"></div>
    <hr class="dash">
    <div class="split" style="padding: 4px 0">
      <div class="split-col">
        <div class="xs muted" style="margin-bottom:4px">tickets spent<br>for reward</div>
        <div class="b" style="font-size:11px">${ticketPrice}</div>
      </div>
      <div class="divider"></div>
      <div class="split-col">
        <div class="xs muted" style="margin-bottom:4px">total tickets<br>in the bank</div>
        <div class="b" style="font-size:11px">${remainingTickets}</div>
      </div>
    </div>
    <hr class="dash">
  `)
}

export function isSupported() { return false }
export function isConnected() { return false }
export async function autoConnect() { return false }
export async function connect() { return { ok: false } }
export async function disconnect() {}
