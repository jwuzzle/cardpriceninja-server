const externalEbayApi = require('../ebay-api/ebay');

const getExternalEbayListings = async (req, res) => {
    try {
    console.log("Received EBAY request");
    const { name } = req.query;
    console.log("Name", name);
    const data = await externalEbayApi.fetchEbayListings(name);
    res.json(data)
    console.log(data)
    } catch (error) {
        console.error()
    }
} 

module.exports = {
    getExternalEbayListings
};