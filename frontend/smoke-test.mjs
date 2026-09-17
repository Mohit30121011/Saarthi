import { chromium } from 'playwright'

const BASE = process.env.BASE_URL || 'http://localhost:5173'
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
await page.fill('#name', 'Smoke Test')
await page.fill('#email', email)
await page.fill('#password', 'TestPass123!')
await page.click('button[type="submit"]')
await page.waitForURL('**/onboarding', { timeout: 10000 })

await page.fill('input[type="date"]', '1990-01-01')
await page.click('button:has-text("FEMALE")')
await page.click('button:has-text("Continue")')

await page.waitForSelector('text=Where is your state domicile?')
await page.click('button:has-text("Select your State or UT")')
await page.fill('input[placeholder^="Search options"]', 'Maharashtra')
await page.click('button:has-text("Maharashtra")')
await page.click('button:has-text("Continue")')

await page.waitForSelector('text=Income & Occupation')
await page.fill('#income', '250000')
await page.click('button:has-text("Continue")')

await page.waitForSelector('text=Social Category & Highest Education')
await page.click('button:has-text("OBC")')
await page.click('button:has-text("Select highest education level")')
await page.fill('input[placeholder^="Search options"]', 'Graduate')
await page.click('button:has-text("Graduate")')
await page.click('button:has-text("Continue")')

await page.waitForSelector('text=Special Entitlement Criteria')
await page.click('button:has-text("Continue")')

await page.waitForSelector('text=Review & Confirm Snapshot')
await page.click('button:has-text("Finish & Discover Schemes")')
await page.waitForURL('**/dashboard', { timeout: 15000 })
await page.waitForSelector('text=Official Entitlement Dossier')
console.log('dashboard OK')

// hit every new page
await page.goto(`${BASE}/explorer`, { waitUntil: 'networkidle' })
await page.waitForSelector('text=Scheme Explorer')
console.log('explorer OK')

const firstCard = page.locator('h3').first()
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

await page.screenshot({ path: 'smoke-profile.png', fullPage: true })

console.log('--- errors ---')
console.log(JSON.stringify(errors, null, 2))
await browser.close()
console.log('DONE')
