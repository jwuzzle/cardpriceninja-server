const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");



const app = express();
app.use(cors());


const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));