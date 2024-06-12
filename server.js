const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");
const puppeteer = require("puppeteer");
const ebayRoutes = require("./routes/ebayapi")

const app = express();
app.use(cors());


app.use('/ebay', ebayRoutes)


app.get("/scrape", async (req, res) => {
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

app.get("/scrape/used", async (req, res) => {
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
        console.log(response.data)
        const $ = cheerio.load(response.data)

        const scriptTagContent = $('#market__content').html();
        console.log(scriptTagContent)
        /* const tradingCardMatch = scriptTagContent.match(/:trading-card="([^"]+)"/);
        const tradingCardSumaryMatch = scriptTagContent.match(/:summary="([^"]+)"/);
        console.log(tradingCardMatch)
        console.log(tradingCardSumaryMatch) */

        /* if (tradingCardMatch && tradingCardSumaryMatch) {
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
            res.json({ id, productNumber, name, minPrice, thumbnailUrl, streetwearId, minPrice2, maxPrice, listingCount, usedMinPrice, usedListingCount, usedListingCountText }); */
        /* } else {
            res.status(404).json({ error: "Trading card data not found" });
        } */
    } catch (error) {
        throw new Error(`Failed to scape product: ${error.message}`)
    }
})



const PORT = process.env.PORT || 5050
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));