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

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message: 'UnAuthorized access'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'Forbidden  Access'})
        }
        console.log(decoded) // bar;
    })
}
async function run() {
    try {
        await client.connect();
        const toolCollection = client.db('AgroBhai').collection('tool');
        const myOrderCollection = client.db('AgroBhai').collection('myOrder');
        const userCollection = client.db('AgroBhai').collection('users');

        app.get('/tool', async (req, res) =>{
            const query = {};
            const cursor = toolCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);
        })
        app.get('/user', async(req, res) =>{
            const users = await userCollection.find().toArray();
            res.send(users)
        })
        // app.get('/admin/:email', async (req, res) =>{
        //     const email = req.params.email;
        //     const user = await userCollection.findOne({email: email});
        //     const isAdmin = user.role === 'admin';
        //     res.send({admin: isAdmin});
        // })

        app.put('/user/admin/:email', async(req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: {role:'admin'},
            };
            const result = await userCollection.updateOne(filter, updateDoc)
            res.send(result);
            
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

        app.post('/myOrder', async(req, res)=> {
            const newOrder = req.body;
            const result = await myOrderCollection.insertOne(newOrder);
            res.send(result);
        })

        app.get('/myOrder', async (req, res) =>{
            const user = req.query.user;
            const authorization = req.headers.authorization;
            console.log('auth headers', authorization);
            const query = {user: user}
            const cursor = myOrderCollection.find(query);
            const myOrder = await cursor.toArray();
            res.send(myOrder);
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