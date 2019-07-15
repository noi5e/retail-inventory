require('dotenv').config()

const csvParse = require('csv-parser')
const fs = require('fs')
const puppeteer = require('puppeteer')

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




  console.log('Scraping data from website...')
  let retailProductIDList = []

  for (let i = 0; i < completedRetailProducts.length; i++) {
    retailProductIDList.push({ name: completedRetailProducts[i]['Exact Name: NOP'] })
  }

  // helper function to escape product names that have single quotes in their names:
  const escapeXPathString = (string) => {
    const splitQuotes = string.replace(/'/g, `', "'", '`)
    return `concat('${splitQuotes}', '')`
  }

  // regex function gets ID # that's embedded in <a> tag's href
  const retrieveIDfromString = (string) => {
    return parseInt(string.match(/\d+/)[0])
  }

  for (let i = 0; i < retailProductIDList.length; i++) {
    try {
      // finds the <tr> parent with <td> child with inner text that matches the product name EXACTLY
      const elementHandles = await page.$x(`//tr[td/text()=${escapeXPathString(retailProductIDList[i].name)}]`)
      // saves the resulting element handle
      retailProductIDList[i].elementHandle = elementHandles[1]
      // gets and saves the data-uid attribute from the tag: <tr data-uid="someString">
      let dataUID = await page.evaluate(element => element.getAttribute('data-uid'), elementHandles[1])  
      retailProductIDList[i].dataUID = dataUID

      // finds the corresponding, other <tr> tag with the same data-uid attribute.
      let otherElementHandles = await page.$x(`//tr[@data-uid="${dataUID}"]`)
      let innerText = await otherElementHandles[0].$$eval('td', nodes => nodes.map((node) => node.innerHTML))

      // this <tr> tag should have an <a> child with the product ID in its href: <a href="/Admin/Product/Edit/3107">
      // if (!innerText[10]) {
      //   let innerText = await otherElementHandles[1].$$eval('td', nodes => nodes.map((node) => node.innerHTML))

      //   retailProductIDList[i].id = retrieveIDfromString(innerText[7])
      // } else {
        retailProductIDList[i].id = retrieveIDfromString(innerText[10])      
      // }
    } catch(error) {
      console.error('Error with ' + retailProductIDList[i].name + ': ' + error)
    }
  }



  // for (let i = 0; i < retailProductIDList.length; i++) {

  //   try {
  //     let otherElementHandles = await page.$x(`//tr[@data-uid="${retailProductIDList[i].dataUID}"]`)
  //     let innerText = await otherElementHandles[0].$$eval('td', nodes => nodes.map((node) => node.innerHTML))

  //     if (!innerText[10]) {
  //       let innerText = await otherElementHandles[1].$$eval('td', nodes => nodes.map((node) => node.innerHTML))

  //       retailProductIDList[i].id = retrieveIDfromString(innerText[7])
  //     } else {
  //       retailProductIDList[i].id = retrieveIDfromString(innerText[10])      
  //     }
  //   } catch(error) {
  //     console.error('Error with this product: ' + retailProductIDList[i].name)
  //   }
  // }





  // // iterates over CSV of retail products, to filter out only Wednesday perishables:
  // let wednesdayPerishables = completedRetailProducts.filter((product) => {
  //   return product['Weekly Recurring Order'] === "TRUE";
  // }).map((product) => {
  //   return { name: product['Exact Name: NOP'] }
  // })

  // // helper function to escape product names that have single quotes in their names:
  // const escapeXPathString = (string) => {
  //   const splitQuotes = string.replace(/'/g, `', "'", '`)
  //   return `concat('${splitQuotes}', '')`
  // }

  // // iterates over the names of Wednesday perishables, finds the <tr> tags that contain them via XPath, and saves the element handles:
  // for (let i = 0; i < wednesdayPerishables.length; i++) {
    // const elementHandles = await page.$x(`//tr[td/text()=${escapeXPathString(wednesdayPerishables[i].name)}]`)
  //   wednesdayPerishables[i].elementHandle = elementHandles[1]

  //   let dataUID = await page.evaluate(element => element.getAttribute('data-uid'), elementHandles[1])
  //   wednesdayPerishables[i].dataUID = dataUID
  // }

  // // iterates over element handles, and finds the corresponding, separate <tr> that has the sales numbers:
  // for (let i = 0; i < wednesdayPerishables.length; i++) {
  //   let otherElementHandles = await page.$x(`//tr[@data-uid="${wednesdayPerishables[i].dataUID}"]`)

  //   let innerText = await otherElementHandles[0].$$eval('td', nodes => nodes.map(node => node.innerText))

  //   wednesdayPerishables[i].inventory = parseInt(innerText[5])
  //   wednesdayPerishables[i].toSell = parseInt(innerText[7])
  //   wednesdayPerishables[i].sold = parseInt(innerText[8])
  //   wednesdayPerishables[i].remainingToSell = parseInt(innerText[9])
  // }

  // console.log(wednesdayPerishables)

  // await page.screenshot({ path: './screenshots/' + new Date().getTime() + '.png' })
  browser.close()
}

loginToAdminAccount()