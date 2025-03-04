const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");
const puppeteer = require("puppeteer");
const ebayRoutes = require("./routes/ebayapi")
const scrapeRoutes = require("./routes/scrape")
const bodyParser = require("body-parser")

const app = express();
app.use(cors({
    origin: 'https://www.cardpriceninja.com'
  }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/ebay', ebayRoutes)
app.use('/scrape', scrapeRoutes)




const PORT = process.env.PORT || 5050
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
