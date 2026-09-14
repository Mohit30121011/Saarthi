import { chromium } from 'playwright'

const BASE = 'http://localhost:5174'
const errors = []

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`) })
page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`))
page.on('response', (res) => {
  if (res.status() >= 500) errors.push(`[http ${res.status()}] ${res.url()}`)
})

// register + onboard a fresh user so protected pages have real data to render against
const email = `smoke.${Date.now()}@example.com`
await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle' })
await page.fill('#full_name', 'Smoke Test')
await page.fill('#email', email)
await page.fill('#password', 'TestPass123!')
await page.click('button[type="submit"]')
await page.waitForURL('**/onboarding', { timeout: 10000 })

await page.fill('input[type="date"]', '1990-01-01')
await page.click('button:has-text("FEMALE")')
await page.click('button:has-text("Continue")')
await page.waitForSelector('text=Where do you live?')
await page.selectOption('select', 'Maharashtra')
await page.click('button:has-text("Continue")')
await page.waitForSelector('text=Income & occupation')
await page.click('button:has-text("Continue")')
await page.waitForSelector('text=Category & education')
await page.click('button:has-text("Continue")')
await page.waitForSelector('text=A few more details')
await page.click('button:has-text("Continue")')
await page.waitForSelector('text=Review & confirm')
await page.click('button:has-text("Finish")')
await page.waitForURL('**/dashboard', { timeout: 15000 })
await page.waitForSelector('text=Your matched schemes')
console.log('dashboard OK')

// hit every new page
await page.goto(`${BASE}/explorer`, { waitUntil: 'networkidle' })
await page.waitForSelector('text=Scheme Explorer')
console.log('explorer OK')

const firstCard = page.locator('a[href^="/schemes/"]').first()
await firstCard.waitFor({ timeout: 10000 })
await firstCard.click()
await page.waitForSelector('text=Eligibility')
console.log('scheme detail OK')
await page.click('button:has-text("Eligibility")')
await page.click('button:has-text("Documents")')
await page.click('button:has-text("How to Apply")')
console.log('scheme detail tabs OK')

await page.goto(`${BASE}/checklist`, { waitUntil: 'networkidle' })
await page.waitForSelector('text=Document Checklist')
console.log('checklist OK')

await page.goto(`${BASE}/bookmarks`, { waitUntil: 'networkidle' })
await page.waitForSelector('text=Saved Schemes')
console.log('bookmarks OK')

await page.goto(`${BASE}/notifications`, { waitUntil: 'networkidle' })
await page.waitForSelector('text=Notifications')
console.log('notifications page OK')

await page.goto(`${BASE}/profile`, { waitUntil: 'networkidle' })
await page.waitForSelector('text=Your Profile')
console.log('profile OK')

await page.screenshot({ path: 'D:/Sarthi/data/seed/screenshots/smoke-profile.png', fullPage: true })

console.log('--- errors ---')
console.log(JSON.stringify(errors, null, 2))
await browser.close()
console.log('DONE')
