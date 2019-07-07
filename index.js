require('dotenv').config()

const csvParse = require('csv-parser')
const fs = require('fs')
const puppeteer = require('puppeteer')

async function loginToAdminAccount() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  let retailProducts = []

  fs.createReadStream('./csv/online-retail-products.csv')
    .pipe(csvParse())
    .on('data', (data) => {
      retailProducts.push(data)
    })
    .on('end', () => {
      console.log(retailProducts)
    })

  // await page.goto('https://admin.threestonehearth.com/login')
  // await page.type('#Email', process.env['THREESTONE_HEARTH_ADMIN_EMAIL'])
  // await page.type('#Password', process.env['THREESTONE_HEARTH_ADMIN_PASSWORD'])
  // await page.keyboard.press('Enter')
  // await page.waitForNavigation()
  // await page.goto('https://admin.threestonehearth.com/Admin/Product/BulkEdit')
  // await page.waitForSelector('td[role="gridcell"]')
  // await page.screenshot({ path: './screenshots/' + new Date().getTime() + '.png' })
  // browser.close()
}

loginToAdminAccount()