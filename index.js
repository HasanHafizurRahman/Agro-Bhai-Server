const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId, ObjectID } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// npx kill-port 5000

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.remhw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const toolCollection = client.db('AgroBhai').collection('tool');
        const userCollection = client.db('AgroBhai').collection('users');

        app.get('/tool', async (req, res) =>{
            const query = {};
            const cursor = toolCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);
        })

        app.put('/user/:email', async(req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result1 = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1y' })
            res.send(result1);
        })

        app.get('/order', async (req, res) =>{

        })

        app.get('/tool/:id', async(req, res) =>{
            const id = req.params.id;
            const query={_id: ObjectId(id)};
            const tool = await toolCollection.findOne(query);
            res.send(tool);
        });

        // post
        app.post('/tool', async(req, res) =>{
            const newTool = req.body;
            const result = await toolCollection.insertOne(newTool);
            res.send(result);
        });

        // delete
        app.delete('/tool/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await toolCollection.deleteOne(query);
            res.send(result);
        })

    }
    finally {
        

    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("It's working nicely!")
});

app.get('/users', (req, res) => {
    res.send("It's from users!")
});

app.listen(port, () => {
    console.log('Listening to port', port);
})