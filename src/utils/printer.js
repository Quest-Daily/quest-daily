function now() {
  return new Date().toLocaleTimeString('en-AU', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

function openReceipt(html) {
  const win = window.open('', '_blank', 'width=380,height=520,toolbar=0,menubar=0,location=0,scrollbars=0')
  if (!win) return
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  @page { size: 80mm auto; margin: 4mm 2mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Courier New', monospace; font-size: 13px; width: 72mm; color: #000; padding: 6mm 4mm; }
  .c { text-align: center; }
  .b { font-weight: bold; }
  hr { border: none; border-top: 1px dashed #000; margin: 7px 0; }
  p { margin: 4px 0; }
</style>
</head><body>${html}
<script>window.onload=function(){window.print();setTimeout(function(){window.close()},600)}</script>
</body></html>`)
  win.document.close()
}

export function printQuestComplete({ childName, questTitle, ticketsEarned, totalTickets, sectionDone, section }) {
  const heading = sectionDone
    ? '🎉 ALL ' + (section || '').toUpperCase() + ' QUESTS DONE!'
    : 'QUEST COMPLETE!'
  openReceipt(`
    <div class="c">
      <p class="b">★ QUEST DAILY ★</p>
      <hr>
      <p>${heading}</p>
      <p>&nbsp;</p>
      <p class="b">${childName}</p>
      <p>${questTitle}</p>
      <p>&nbsp;</p>
      <hr>
      <p class="b">+${ticketsEarned} tickets earned</p>
      <p>Total: ${totalTickets} tickets</p>
      <p>${now()}</p>
    </div>
  `)
}

export function printSectionDone() {}

export function printRedemption({ childName, itemTitle, ticketPrice, remainingTickets }) {
  openReceipt(`
    <div class="c">
      <p class="b">★ QUEST DAILY ★</p>
      <hr>
      <p>REDEMPTION RECEIPT</p>
      <hr>
      <p class="b">${childName}</p>
      <p>redeemed:</p>
      <p>&nbsp;</p>
      <p class="b">${itemTitle}</p>
      <p>&nbsp;</p>
      <hr>
      <p>Cost: ${ticketPrice} tickets</p>
      <p>Remaining: ${remainingTickets} tickets</p>
      <p>${now()}</p>
    </div>
  `)
}

export function isSupported() { return false }
export function isConnected() { return false }
export async function autoConnect() { return false }
export async function connect() { return { ok: false } }
export async function disconnect() {}
