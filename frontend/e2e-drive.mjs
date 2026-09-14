import { chromium } from 'playwright'
import fs from 'fs'

const BASE = 'http://localhost:5174'
const SHOT_DIR = 'D:/Sarthi/data/seed/screenshots'
fs.mkdirSync(SHOT_DIR, { recursive: true })

const errors = []

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } })
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text())
})
page.on('pageerror', (err) => errors.push('pageerror: ' + err.message))

async function shot(name) {
  await page.screenshot({ path: `${SHOT_DIR}/${name}.png`, fullPage: true })
  console.log('screenshot:', name)
}

console.log('--- nav login ---')
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
await page.waitForSelector('text=Welcome back')
await shot('01-login')

console.log('--- nav signup ---')
await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle' })
await page.waitForSelector('text=Create your account')
await shot('02-signup')

console.log('--- fill signup form ---')
const email = `test.browser.${Date.now()}@example.com`
await page.fill('#full_name', 'Test Browser')
await page.fill('#email', email)
await page.fill('#password', 'TestPass123!')
await shot('03-signup-filled')
await page.click('button[type="submit"]')

console.log('--- wait for onboarding ---')
await page.waitForURL('**/onboarding', { timeout: 10000 })
await page.waitForSelector('text=Tell us about you')
await shot('04-onboarding-step1')

console.log('--- step 1: DOB + gender ---')
await page.fill('input[type="date"]', '1985-03-15')
await page.click('button:has-text("MALE")')
await page.click('button:has-text("Continue")')

console.log('--- step 2: state + district ---')
await page.waitForSelector('text=Where do you live?')
await page.selectOption('select', 'Maharashtra')
await page.fill('input[placeholder="e.g. Pune"]', 'Pune')
await shot('05-onboarding-step2')
await page.click('button:has-text("Continue")')

console.log('--- step 3: income + occupation ---')
await page.waitForSelector('text=Income & occupation')
await page.fill('input[type="number"]', '80000')
await page.click('button:has-text("Farmer")')
await shot('06-onboarding-step3')
await page.click('button:has-text("Continue")')

console.log('--- step 4: category + education ---')
await page.waitForSelector('text=Category & education')
await page.click('button:has-text("OBC")')
await page.selectOption('select', '10th')
await shot('07-onboarding-step4')
await page.click('button:has-text("Continue")')

console.log('--- step 5: toggles ---')
await page.waitForSelector('text=A few more details')
await shot('08-onboarding-step5')
await page.click('button:has-text("Continue")')

console.log('--- step 6: review ---')
await page.waitForSelector('text=Review & confirm')
await shot('09-onboarding-step6')
await page.click('button:has-text("Finish")')

console.log('--- wait for dashboard ---')
await page.waitForURL('**/dashboard', { timeout: 15000 })
await page.waitForSelector('text=Your matched schemes', { timeout: 15000 })
await page.waitForTimeout(1500) // let scheme cards finish rendering
await shot('10-dashboard')

const cardCount = await page.locator('a[href^="/schemes/"]').count()
console.log('scheme cards rendered:', cardCount)

console.log('--- console errors ---')
console.log(JSON.stringify(errors, null, 2))

await browser.close()
console.log('DONE')
