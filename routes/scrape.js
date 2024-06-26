const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const axios = require("axios");
const cheerio = require("cheerio");

const PORT = process.env.PORT || 5050

router.get("/", async (req, res) => {
    const url = req.query.url;
    console.log(url)
    if (!url) return;

    //BrightData proxy configuration

    const username = String(process.env.BRIGHTDATAUSERNAME)
    const password = String(process.env.BRIGHTDATAPASSWORD)
    const session_id = (1000000 * Math.random()) | 0;
    const options = {
        auth: {
            username: `${username}-session-${session_id}`,
            password,
        },
        host: 'brd.superproxy.io',
        PORT,
        rejectUnauthorized: false,
    }

    try {
        const response = await axios.get(url, options);
        const $ = cheerio.load(response.data)

        const scriptTagContent = $('#content').html();
        console.log(scriptTagContent)
        const tradingCardMatch = scriptTagContent.match(/:trading-card="([^"]+)"/);
        const tradingCardSumaryMatch = scriptTagContent.match(/:summary="([^"]+)"/);
        console.log(tradingCardMatch)
        console.log(tradingCardSumaryMatch)

        if (tradingCardMatch && tradingCardSumaryMatch) {
            const dataString = tradingCardMatch[1];
            console.log(dataString);
            const dataSummaryString = tradingCardSumaryMatch[1];
            console.log(dataSummaryString);

            // Replace HTML entities with their corresponding characters
            const jsonString = dataString.replace(/&quot;/g, '"');
            console.log(jsonString);
            const jsonSummaryString = dataSummaryString.replace(/&quot;/g, '"');
            console.log(jsonSummaryString);

            // Parse the JSON string
            const data = JSON.parse(jsonString);
            console.log(data);
            const summaryData = JSON.parse(jsonSummaryString);
            console.log(summaryData);

            // Extract the desired fields
            const { id, productNumber, name, minPrice, thumbnailUrl } = data;
            const { streetwearId, minPrice2, maxPrice, listingCount, usedMinPrice, usedListingCount, usedListingCountText } = summaryData;

            // Send the extracted data as a response
            res.json({ id, productNumber, name, minPrice, thumbnailUrl, streetwearId, minPrice2, maxPrice, listingCount, usedMinPrice, usedListingCount, usedListingCountText });
        } else {
            res.status(404).json({ error: "Trading card data not found" });
        }
    } catch (error) {
        throw new Error(`Failed to scape product: ${error.message}`)
    }
})

router.post("/used", async (req, res) => {

    const { url } = req.body;
    console.log("page url:", url)

    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    console.log("Received URL:", url)
    

    try {
        const browser = await puppeteer.launch() //launching the browser and awaiting it because we don't know how long it will take
        const page = await browser.newPage()
        await page.goto(url, { waitUntil: 'networkidle2' }); //pull in url from the POST endpoint here
        console.log('Navigated to URL');

        const productsHandles = await page.$$("section.product ul.product__block > li.tc-item__used");
        let productListings = [];


        for (const producthandle of productsHandles) {
            let price = "Null"
            let evaluation = "Null"
            let image = "Null"
            let snkrurl = "Null"

            try {
                price = await page.evaluate(el => el.querySelector("a > div.tc-item__detail > p.price").textContent, producthandle);
            } catch (error) {
            }

            try {
                evaluation = await page.evaluate(el => el.querySelector("a > div.tc-item__detail > p.evaluation").textContent, producthandle);
            } catch (evaluation) {
            }

            try {
                image = await page.evaluate(el => el.querySelector("a > div.tc-img img").getAttribute("src"), producthandle);
            } catch (error) {
            }

            try {
                snkrurl = await page.evaluate(el => el.querySelector("a.tc-item__wrapper").getAttribute("href"), producthandle);
            } catch (error) {
            }

            if (price !== "Null") {
                console.log(price, evaluation, image, snkrurl)
                productListings.push({ price, evaluation, image, snkrurl })
            }
        }
        await browser.close();
        console.log('Scraping completed successfully');
        res.json(productListings);


    } catch (error) {
        console.error("Error during scraping:", error)
        res.status(500).json({ error: "Scraping failed" })
    }

});

module.exports = router;

