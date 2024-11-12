const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://root:timeSeries_123@scalabledata.g5oh0.mongodb.net/?retryWrites=true&w=majority&appName=ScalableData";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        const DB = client.db("timeSeries");
        const myColl = DB.collection("test");
        const ISODate = new Date('2014-01-22T14:56:59.301Z');
        const doc = { time: ISODate, shape: "round" };
        const result = await myColl.insertOne(doc);
        console.log(
            `A document was inserted with the _id: ${result.insertedId}`,
        );
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);
