require('dotenv').config()

const csvParse = require('csv-parser')
const fs = require('fs')
const puppeteer = require('puppeteer')
const util = require('util')

async function loginToAdminAccount() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  let retailProducts = []

  console.log('Loading admin homepage...')
  await page.goto('https://admin.threestonehearth.com/login')
  console.log('Entering admin e-mail...')
  await page.type('#Email', process.env['THREESTONE_HEARTH_ADMIN_EMAIL'])
  console.log('Entering admin password...')
  await page.type('#Password', process.env['THREESTONE_HEARTH_ADMIN_PASSWORD'])
  console.log('Clicking enter...')
  await page.keyboard.press('Enter')
  console.log('Waiting for navigation...')
  await page.waitForNavigation()
  console.log('Going to Product Inventory page...')
  await page.goto('https://admin.threestonehearth.com/Admin/Product/BulkEdit')
  console.log('Waiting until inventory loads...')
  await page.waitForSelector('td[role="gridcell"]')


  const readStream = fs.createReadStream('./csv/online-retail-products.csv')

  const csvParsing = readStream.pipe(csvParse())

  const fullyParsedStream = new Promise((resolve, reject) => {
    csvParsing.on('data', (data) => retailProducts.push(data))
    csvParsing.on('end', () => resolve(retailProducts))
    readStream.on('error', reject)
  })

  console.log('Streaming CSV into parser...')
  let completedRetailProducts = await fullyParsedStream

  let wednesdayPerishables = completedRetailProducts.filter((product) => product['Weekly Recurring Order'])
  console.log(wednesdayPerishables)

    //   wednesdayPerishables.forEach((product) => {
    //     // console.log(product['Exact Name: NOP'])


    //   })
    // })

  await page.screenshot({ path: './screenshots/' + new Date().getTime() + '.png' })
  browser.close()
}

loginToAdminAccount()