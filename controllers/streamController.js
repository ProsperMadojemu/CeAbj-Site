import "dotenv/config";


const streamKey = async (req,res) => {
    const streamkey = req.query.key || req.body.key;
    if (streamkey === process.env.STREAM_KEY) {
        res.status(200).send("OK");
    } else {
        res.status(403).send("Forbidden");
    }
}

export default streamKey;