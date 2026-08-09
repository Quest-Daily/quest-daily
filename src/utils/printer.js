const LOGO_SVG = `<svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g transform="rotate(15,50,50)">
    <polygon points="50,12 47.5,16.5 44,63 56,63 52.5,16.5" fill="#000"/>
    <rect x="29" y="63" width="42" height="8.5" rx="4.25" fill="#000"/>
    <rect x="47" y="71.5" width="6" height="14" rx="3" fill="#000"/>
    <ellipse cx="50" cy="90" rx="9" ry="5.5" fill="#000"/>
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
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Space+Mono:wght@400;700&family=Hanken+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: fit-content; }
  body { font-family: 'Space Mono', monospace; font-size: 11px; width: 72mm; color: #000; padding: 2mm 4mm 5mm; }
  .c     { text-align: center; }
  .b     { font-weight: 700; }
  .serif { font-family: 'DM Serif Display', serif; }
  .sans  { font-family: 'Hanken Grotesk', sans-serif; }
  .muted { color: #222; }
  .xs    { font-size: 9px; }
  .gap-sm { height: 6px; }
  .solid  { border: none; border-top: 1.5px solid #000; margin: 7px 0; }
  .dash   { border: none; border-top: 1px dashed #555; margin: 7px 0; }
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

const SECTION_SVGS = {
  morning: `<svg width="26" height="26" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><mask id="moon-mask"><rect width="100" height="100" fill="white"/><circle cx="42" cy="44" r="32" fill="black"/></mask><mask id="outer-mask"><circle cx="58" cy="57" r="34" fill="white"/></mask></defs><circle cx="58" cy="57" r="34" fill="none" stroke="#000" stroke-width="5" mask="url(#moon-mask)"/><circle cx="42" cy="44" r="32" fill="none" stroke="#000" stroke-width="5" mask="url(#outer-mask)"/><path d="M23,26 L26,33 L33,36 L26,39 L23,46 L20,39 L13,36 L20,33 Z" fill="#000"/><circle cx="11" cy="16" r="3.5" fill="none" stroke="#000" stroke-width="3"/><circle cx="25" cy="7" r="2.5" fill="none" stroke="#000" stroke-width="2.5"/></svg>`,
}

export function printQuestComplete({ childName, questTitle, ticketsEarned, totalTickets, sectionDone, section }) {
  openReceipt(`
    <div style="display:flex;align-items:center;justify-content:center;gap:7px;margin-bottom:1px">${section ? SECTION_SVGS[section] : ''}<span class="serif" style="font-size:26px">Quest Daily</span></div>
    <hr class="solid">
    <div class="sans xs muted" style="letter-spacing:0.04em">${nowDateTime()}</div>
    <div class="gap-sm"></div>
    <div class="serif b" style="font-size:22px; line-height:1.1">${childName}</div>
    <div class="sans" style="margin-top:2px"><span class="b">&#x2726; Quest complete:</span> ${questTitle}</div>
    <hr class="dash">
    <div class="row">
      <span class="xs b" style="letter-spacing:0.12em">TICKETS EARNED</span>
      <span class="serif b" style="font-size:18px; line-height:1">${ticketsEarned}</span>
    </div>
    <div class="row">
      <span class="xs b" style="letter-spacing:0.12em">BANK TOTAL</span>
      <span class="serif b" style="font-size:18px; line-height:1">${totalTickets}</span>
    </div>
    <hr class="dash">
    <div class="c xs b" style="letter-spacing:0.16em; margin: 6px 0 4px">${sectionDone ? `&#x2605; ALL ${section.toUpperCase()} QUESTS DONE! &#x2605;` : `NICE WORK, ${childName.toUpperCase()}!`}</div>
    <div class="c">${LOGO_SVG}</div>
  `)
}

export function printSectionDone() {}

export function printQuestSheet({ childName, sections, allDay }) {
  function nowDate() {
    return new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  const smallLogo = LOGO_SVG.replace('width="40" height="40"', 'width="22" height="22"')

  const sectionBlocks = sections.map(({ label, quests }) => {
    const [icon, name] = label.split(' ')
    const questRows = quests.map(q => `
      <div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px dashed #ddd">
        <span style="font-size:13px;flex-shrink:0">&#9633;</span>
        <span style="font-size:11px;flex-shrink:0">${q.icon}</span>
        <span style="font-size:11px">${q.title}</span>
      </div>`).join('')
    const sectionLabel = allDay ? `${icon} ${name.toUpperCase()}` : `${icon} ${name.toUpperCase()} QUESTS`
    return `<div class="xs b" style="letter-spacing:0.12em;margin:5px 0 3px">${sectionLabel}</div>${questRows}`
  }).join('<hr class="dash">')

  const stickers = `<div style="display:flex;gap:10px;justify-content:center;margin:8px 0">
    ${Array(4).fill('<div style="width:32px;height:32px;border:1.5px dashed #aaa;border-radius:50%"></div>').join('')}
  </div>`

  openReceipt(`
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">
      ${smallLogo}
      <div>
        <div class="b" style="font-size:13px;letter-spacing:0.16em">QUEST DAILY</div>
        <div class="xs muted" style="letter-spacing:0.12em">DAILY QUEST SHEET</div>
      </div>
    </div>
    <hr class="solid">
    <div class="c b" style="font-size:13px;letter-spacing:0.12em;margin:4px 0 2px">${childName.toUpperCase()}'S QUESTS</div>
    <div class="c sans xs muted">${nowDate()}</div>
    <hr class="dash">
    ${sectionBlocks}
    <hr class="solid">
    <div class="sans xs" style="margin:3px 0">Tickets today: <span style="display:inline-block;width:70px;border-bottom:1px solid #555;vertical-align:bottom"></span></div>
    ${allDay ? `<div class="sans xs" style="margin:3px 0">Total tickets: <span style="display:inline-block;width:72px;border-bottom:1px solid #555;vertical-align:bottom"></span></div>` : ''}
    ${stickers}
    <hr class="dash">
    <div class="c b" style="margin:4px 0">Great work${allDay ? ' today' : ''}, ${childName}!</div>
    <div class="c muted" style="letter-spacing:0.3em;font-size:12px">* * * * *</div>
    <hr class="dash">
  `)
}

export function printRedemption({ childName, itemTitle, ticketPrice, remainingTickets }) {
  openReceipt(`
    <div class="c serif" style="font-size:26px; margin-bottom:1px">Quest Daily</div>
    <hr class="solid">
    <div class="xs muted" style="letter-spacing:0.06em">${nowDateTime()}</div>
    <div class="gap-sm"></div>
    <div class="serif b" style="font-size:22px; line-height:1.1">${childName}</div>
    <div style="margin-top:2px"><span class="b">&#x2726; Reward redeemed:</span> ${itemTitle}</div>
    <hr class="dash">
    <div class="row">
      <span class="xs b" style="letter-spacing:0.12em">TICKETS SPENT</span>
      <span class="serif b" style="font-size:18px; line-height:1">${ticketPrice}</span>
    </div>
    <div class="row">
      <span class="xs b" style="letter-spacing:0.12em">BANK TOTAL</span>
      <span class="serif b" style="font-size:18px; line-height:1">${remainingTickets}</span>
    </div>
    <hr class="dash">
    <div class="c xs b" style="letter-spacing:0.16em; margin: 6px 0 4px">ENJOY, ${childName.toUpperCase()}!</div>
    <div class="c">${LOGO_SVG}</div>
  `)
}

export function isSupported() { return false }
export function isConnected() { return false }
export async function autoConnect() { return false }
export async function connect() { return { ok: false } }
export async function disconnect() {}
