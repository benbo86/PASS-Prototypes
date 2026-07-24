import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1500, height: 900 } })
const errors = []
page.on('pageerror', err => errors.push('PAGEERR: ' + err.message))
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })

await page.goto('http://localhost:5173/PASS-Prototypes/web/messaging/')
await page.waitForTimeout(700)

const rows = await page.locator('.msg-thread-row').all()
for (const row of rows) {
  const name = await row.locator('.msg-thread-name').textContent()
  const recipient = await row.locator('.msg-thread-recipient-plain').textContent().catch(() => null)
  const isBroadcastAvatar = await row.locator('.msg-thread-avatar.broadcast').count() > 0
  console.log(JSON.stringify({ isBroadcastAvatar, name, secondLine: recipient }))
}

await page.screenshot({ path: '/private/tmp/claude-503/-Users-ben-thomas-Documents-Claude-PASS-Prototypes/fb8448ae-6697-4388-a9b3-b63629b4c8b5/scratchpad/thread-list-swap.png' })
console.log('errors', errors.length, errors)
await browser.close()
