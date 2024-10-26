import axios from "axios";
import xml2js from 'xml2js'
import "dotenv/config";

const streamKey = async (req,res) => {
    const streamkey = req.query.key || req.body.key;
    if (streamkey === process.env.STREAM_KEY) {
        res.status(200).send("OK");
    } else {
        res.status(403).send("Forbidden");
    }
}

let cachedData = null; 
let lastFetchTime = 0;   

// Function to fetch and parse stats
const fetchStats = async () => {
    try {
        const response = await axios.get('http://nginx:5050/stat');
        const parser = new xml2js.Parser();

        return new Promise((resolve, reject) => {
            parser.parseString(response.data, (err, result) => {
                if (err) {
                    console.error('Error parsing XML:', err.message);
                    resolve({ stats: null, errorType: 'PARSING_ERROR' });
                } else if (JSON.stringify(result) === JSON.stringify(cachedData)) {
                    // No change in data
                    resolve({ stats: null, errorType: 'NO_CHANGE' });
                } else {
                    // New data, update cache
                    cachedData = result;
                    resolve({ stats: cachedData, errorType: null });
                }
            });
        });
    } catch (err) {
        console.error('Error fetching stats:', err.message);
        if (err.code === 'ENOTFOUND') {
            // Connection error
            return { stats: null, errorType: 'ENOTFOUND' };
        } else {
            // General fetch error
            return { stats: null, errorType: 'FETCH_ERROR' };
        }
    }
};;

export {streamKey, fetchStats};