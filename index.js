require('dotenv').config()

const csvParse = require('csv-parser')
const fs = require('fs')
const puppeteer = require('puppeteer')
const util = require('util')

async function loginToAdminAccount() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

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
  console.log('Waiting for inventory to load...')
  await page.waitForSelector('td[role="gridcell"]')

  console.log('Opening and reading CSV into parser...')
  const readStream = fs.createReadStream('./csv/online-retail-products.csv')
  const csvParsing = readStream.pipe(csvParse())

  let retailProducts = []

  const fullyParsedStream = new Promise((resolve, reject) => {
    csvParsing.on('data', (data) => retailProducts.push(data))
    csvParsing.on('end', () => resolve(retailProducts))
    readStream.on('error', reject)
  })

  let completedRetailProducts = await fullyParsedStream

  let wednesdayPerishables = completedRetailProducts.filter((product) => {
    return product['Weekly Recurring Order'] === "TRUE";
  }).map((product) => {
    return { name: product['Exact Name: NOP'] }
  })

  const escapeXPathString = (string) => {
    const splitQuotes = string.replace(/'/g, `', "'", '`)
    return `concat('${splitQuotes}', '')`
  }

  for (let i = 0; i < wednesdayPerishables.length; i++) {
    const elementHandles = await page.$x(`//tr[td[contains(text(), ${escapeXPathString(wednesdayPerishables[i].name)})]]`)
    wednesdayPerishables[i].elementHandle = elementHandles[1]
  }

  console.log(wednesdayPerishables)

  //  <tr class="k-alt" data-uid="someString" role="row">
  //    <td style="vertical-align:top" role="gridcell">Recurring</td>
  //    <td>Beber Chocolate Almond Milk</td>
  //    <td><img src="published-checkmark.gif" /></td>
  //    <td>$Price</td>
  //    <td>Blank Cell</td>
  //    <td>Inventory #</td>
  //    <td><img src="another-checkmark.gif" /></td>
  //    <td>To Sell #</td>
  //    <td><a>Sold</a></td>
  //    <td>Remaining To Cell</td>
  //    <td><a>View Product</a></td>
  //  </tr>

  async function getDataUID(elementHandle) {
    return await page.evaluate(element => element.getAttribute('data-uid'))
  }

  async function getIDforArray(array) {
    const promises = array.map(getDataUID)
  }

  // const elementHandles = await page.$x(`//tr[td[contains(text(), 'Beber Chocolate Almond Milk')]]`)
  const elementHandles = await page.$x(`//tr[td[contains(text(), '${wednesdayPerishables[0].name}')]]`)
  const roleHandle = await elementHandles[1].getProperty('outerHTML')
  const roleJSON = await roleHandle.jsonValue()
  console.log(roleJSON)

  let role = await page.evaluate(element => element.getAttribute('data-uid'), elementHandles[1])
  console.log(role)

  // await page.screenshot({ path: './screenshots/' + new Date().getTime() + '.png' })
  browser.close()
}

loginToAdminAccount()