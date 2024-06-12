const puppeteer = require('puppeteer');
const fs = require('fs/promises');


//insert POST endpoint 

app.post("/scrape/used", async (req, res) => {

    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    try {
        const browser = await puppeteer.launch() //launching the browser and awaiting it because we don't know how long it will take
    const page = await browser.newPage()
    await page.goto(url) //pull in url from the POST endpoint here

    const productsHandles = await page.$$("section.product ul.product__block > li.tc-item__used");


    let i = 0;
    let productListings = [];


    for (const producthandle of productsHandles) {
        let price = "Null"
        let evaluation = "Null"
        let image = "Null"

        try {
            price = await page.evaluate(el => el.querySelector("a > div.tc-item__detail > p.price").textContent, producthandle);
        } catch (error) {
        }

        try {
            evaluation = await page.evaluate(el => el.querySelector("a > div.tc-item__detail > p.evaluation").textContent, producthandle);
        } catch (error) {
        }

        try {
            image = await page.evaluate(el => el.querySelector("a > div.tc-img img").getAttribute("src"), producthandle);
        } catch (error) {
        }

        if(price !== "Null") {
            /* console.log(price, evaluation, image) */
            productListings.push( {price, evaluation, image})
        }
    }
    await browser.close();
    res.json(productListings);

 
    } catch (error) {
        console.error("Error during scraping:", error)
        res.status(500).json({ error: "Scraping failed" })
    }

});

