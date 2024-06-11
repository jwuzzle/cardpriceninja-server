const axios = require('axios');
require("dotenv").config();

const APPID = process.env.APPID;
console.log(APPID);

const fetchEbayListings = async (name) => {
    try {
        const keyword = name;
        const url =`https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsByKeywords&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=${APPID}&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&keywords=${encodeURIComponent(keyword)}`;
        console.log(url)
        const response = await axios.get(url);
        console.log(response.data)
        return response.data

    } catch (error) {
        if (error.response) {
            // Detailed logging of the eBay API error response
            console.error('Error fetching data from external API', JSON.stringify(error.response.data, null, 2));
        } else {
            // Logging for other errors
            console.error('Error fetching data from external API', error.message);
        }
        throw new Error('Error fetching data from external API');
    }
}


module.exports = {
    fetchEbayListings
};